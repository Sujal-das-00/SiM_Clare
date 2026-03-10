import { purchaseQueue } from "./purchaseQueue.js";
import { upsertProvisioningCheckpoint } from "../../models/APIs_EndPoint/saveEsimPurchaseData.js";
import { updateOrderStatus } from "../../models/Checkout_models/Checkout_utils/updatePaymentStatus.js";

export async function queueEsimPurchase(orderId) {
  const job = await purchaseQueue.add(
    "purchase",
    { orderId },
    {
      jobId: `purchase-${orderId}`
    }
  );

  await upsertProvisioningCheckpoint({
    order_id: orderId,
    provisioning_status: "QUEUED",
    raw_response: {
      source: "purchaseQueueModel",
      message: "Job queued for purchase processing"
    }
  });

  await updateOrderStatus(orderId, "PROVISIONING");

  return job;
}
