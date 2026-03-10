import { Worker } from "bullmq";
import { getOrder_data_PayloadController } from "../../controllers/api_payload_controller..models/getOrderbyId.js";
import { buyEsimFromProviderService } from "../../models/APIs_EndPoint/buyEsimFromProvider.js";
import bullRedis from "../../config/bullIoredis.js";

const purchaseWorker = new Worker(
    "esim-purchase",
    async (job) => {
        const { orderId } = job.data;
        console.log("Processing order:", orderId);
        const payload = await getOrder_data_PayloadController(orderId);
        const providerResponse = await buyEsimFromProviderService(payload);
        console.log("==================================");

        console.log("i am the worker");
        console.log(providerResponse);
        // TODO: save the response data.
        return providerResponse;
    },
    {
        connection: bullRedis,
        // protects provider API
        limiter: {
            max: 5,
            duration: 1000
        },
        concurrency: 3
    }
);

purchaseWorker.on("ready", () => {
    console.log("Purchase worker is ready and waiting for jobs");
});

purchaseWorker.on("completed", (job, result) => {
    console.log(`Job ${job.id} completed`);
});

purchaseWorker.on("failed", (job, err) => {
    console.error(`Job ${job?.id ?? "unknown"} failed`, err);
});

purchaseWorker.on("error", (err) => {
    console.error("Purchase worker connection/runtime error", err);
});
