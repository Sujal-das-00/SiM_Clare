import { Queue } from "bullmq";
import { bullRedis } from "../../config/bullIoredis.js";


export const purchaseQueue = new Queue("esim-purchase", {
    connection: bullRedis,
    defaultJobOptions: {
        attempts: 5,
        backoff: {
            type: "exponential",
            delay: 5000
        },
        removeOnComplete: 100,
        removeOnFail: 500
    }
});