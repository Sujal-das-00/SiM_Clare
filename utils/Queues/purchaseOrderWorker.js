import { Worker } from "bullmq";
import bullRedis from "../../config/bullIoredis.js";

import { getOrder_data_PayloadController } from "../../controllers/api_payload_controller..models/getOrderbyId.js";
import { buyEsimFromProviderService } from "../../models/APIs_EndPoint/buyEsimFromProvider.js";
import { getEsimStatusService } from "../../models/APIs_EndPoint/getEsimSttus.js";
import { upsertProvisioningCheckpoint } from "../../models/APIs_EndPoint/saveEsimPurchaseData.js";
import { updateOrderStatus } from "../../models/Checkout_models/Checkout_utils/updatePaymentStatus.js";
import { purchaseQueue } from "./purchaseQueue.js";

const MAX_POLL_ATTEMPTS = 30;
const POLL_DELAY_MS = 10000;

const getPurchaseIdFromResponse = (response) => {
    return (
        response?.data?.[0]?.purchaseID?.[0] ||
        response?.data?.[0]?.purchaseID ||
        response?.data?.purchaseID ||
        response?.purchaseID ||
        null
    );
};

const getStatusPayload = (response) => response?.data || response;

const getNormalizedStatus = (payload) => {
    return String(
        payload?.status ||
        payload?.provisioning_status ||
        payload?.state ||
        payload?.orderStatus ||
        ""
    ).trim().toUpperCase();
};

const isCompletedStatus = (status) => {
    return ["COMPLETED", "COMPLETE", "SUCCESS", "SUCCESSFUL", "DONE"].includes(status);
};

const isFailedStatus = (status) => {
    return ["FAILED", "ERROR", "REJECTED", "CANCELLED"].includes(status);
};

const getEsimDetails = (payload) => {
    return payload?.esimproduct || payload?.esimProduct || payload?.esim || {};
};

const purchaseWorker = new Worker(
    "esim-purchase",
    async (job) => {
        if (job.name === "purchase") {
            const { orderId } = job.data;

            await updateOrderStatus(orderId, "PROVISIONING");
            await upsertProvisioningCheckpoint({
                order_id: orderId,
                provisioning_status: "INITIATED",
                raw_response: {
                    source: "purchaseWorker",
                    message: "Worker started processing purchase"
                }
            });

            try {
                const payload = await getOrder_data_PayloadController(orderId);
                const providerResponse = await buyEsimFromProviderService(payload);
                const purchaseId = getPurchaseIdFromResponse(providerResponse);

                if (!purchaseId) {
                    await updateOrderStatus(orderId, "FAILED");
                    await upsertProvisioningCheckpoint({
                        order_id: orderId,
                        provisioning_status: "FAILED",
                        raw_response: providerResponse
                    });

                    throw new Error("Provider purchase ID not found in purchase response");
                }

                await upsertProvisioningCheckpoint({
                    order_id: orderId,
                    provider_purchase_id: purchaseId,
                    raw_response: providerResponse
                });

                await purchaseQueue.add(
                    "poll-status",
                    {
                        orderId,
                        purchaseId,
                        attempts: 0
                    },
                    {
                        delay: POLL_DELAY_MS,
                        jobId: `poll-${purchaseId}-0`
                    }
                );

                return {
                    orderId,
                    purchaseId
                };
            } catch (error) {
                await updateOrderStatus(orderId, "FAILED");
                await upsertProvisioningCheckpoint({
                    order_id: orderId,
                    provisioning_status: "FAILED",
                    raw_response: {
                        message: error.message
                    }
                });

                throw error;
            }
        }

        if (job.name === "poll-status") {
            const { orderId, purchaseId, attempts = 0 } = job.data;

            try {
                const response = await getEsimStatusService(purchaseId);
                const statusPayload = getStatusPayload(response);
                const normalizedStatus = getNormalizedStatus(statusPayload);

                if (isFailedStatus(normalizedStatus)) {
                    await updateOrderStatus(orderId, "FAILED");
                    await upsertProvisioningCheckpoint({
                        order_id: orderId,
                        provider_purchase_id: purchaseId,
                        provisioning_status: "FAILED",
                        raw_response: response
                    });

                    throw new Error(`Provider returned failed status for purchase ${purchaseId}`);
                }

                if (!isCompletedStatus(normalizedStatus)) {
                    if (attempts >= MAX_POLL_ATTEMPTS) {
                        await updateOrderStatus(orderId, "FAILED");
                        await upsertProvisioningCheckpoint({
                            order_id: orderId,
                            provider_purchase_id: purchaseId,
                            provisioning_status: "FAILED",
                            raw_response: response
                        });

                        throw new Error(`Polling timeout for purchase ${purchaseId}`);
                    }

                    await purchaseQueue.add(
                        "poll-status",
                        {
                            orderId,
                            purchaseId,
                            attempts: attempts + 1
                        },
                        {
                            delay: POLL_DELAY_MS,
                            jobId: `poll-${purchaseId}-${attempts + 1}`
                        }
                    );

                    return {
                        orderId,
                        purchaseId,
                        attempts: attempts + 1,
                        status: normalizedStatus || "PENDING"
                    };
                }

                const esim = getEsimDetails(statusPayload);

                await upsertProvisioningCheckpoint({
                    order_id: orderId,
                    provider_purchase_id: purchaseId,
                    activation_code: esim.activationCode || esim.activation_code || null,
                    iccid: esim.iccid || null,
                    msisdn: esim.msisdn || null,
                    nsce: esim.nsce || null,
                    puk: esim.puk || null,
                    provisioning_status: "COMPLETED",
                    raw_response: response
                });

                await updateOrderStatus(orderId, "COMPLETED");

                return {
                    orderId,
                    purchaseId,
                    status: "COMPLETED"
                };
            } catch (error) {
                await updateOrderStatus(orderId, "FAILED");
                await upsertProvisioningCheckpoint({
                    order_id: orderId,
                    provider_purchase_id: purchaseId,
                    provisioning_status: "FAILED",
                    raw_response: {
                        message: error.message
                    }
                });

                throw error;
            }
        }

        throw new Error(`Unknown job name: ${job.name}`);
    },
    {
        connection: bullRedis,
        limiter: {
            max: 5,
            duration: 1000
        },
        concurrency: 3
    }
);

purchaseWorker.on("completed", (job) => {
    console.log(`Job completed: ${job.id} (${job.name})`);
});

purchaseWorker.on("failed", (job, error) => {
    console.error(`Job failed: ${job?.id} (${job?.name})`, error);
});

export default purchaseWorker;
