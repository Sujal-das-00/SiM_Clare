import { purchaseQueue } from "./purchaseQueue.js";

export async function queueEsimPurchase(orderId) {

  const job = await purchaseQueue.add(
    "purchase-esim",
    { orderId },
    {
      jobId: `purchase-${orderId}` // prevents duplicate jobs
    }
  );

  return job;
} 