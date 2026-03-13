import { purchaseQueue } from "./purchaseQueue.js";
import { upsertProvisioningCheckpoint } from "../../models/APIs_EndPoint/saveEsimPurchaseData.js";
import { updateOrderStatus } from "../../models/Checkout_models/Checkout_utils/updatePaymentStatus.js";
import AppError from "../../utils/Apperror.js";

export async function queueEsimPurchase(orderId, options = {}) {
  const { type3CustomerData = null, rejectIfExists = false } = options;
  const existingJob = await purchaseQueue.getJob(`purchase-${orderId}`);

  if (existingJob && rejectIfExists) {
    throw new AppError(409, "Provisioning job already exists for this order");
  }

  const job = await purchaseQueue.add(
    "purchase",
    { orderId, type3CustomerData },
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
