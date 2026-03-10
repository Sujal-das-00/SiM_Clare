import { purchaseQueue } from "./purchaseQueue.js";
import { upsertProvisioningCheckpoint } from "../../models/APIs_EndPoint/saveEsimPurchaseData.js";

export async function queueEsimPurchase(orderId) {
  await upsertProvisioningCheckpoint({
    order_id: orderId,
    provisioning_status: "QUEUED",
    raw_response: {
      source: "purchaseQueueModel",
      message: "Job queued for purchase processing"
    }
  });

  const job = await purchaseQueue.add(
    "purchase",
    { orderId },
    {
      jobId: `purchase-${orderId}`
    }
  );

  return job;
}
