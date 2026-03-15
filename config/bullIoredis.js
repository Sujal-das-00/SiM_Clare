import "dotenv/config";

// BullMQ manages its own Redis connections. Passing plain options here avoids
// sharing a worker connection with application Redis clients.
export const bullRedis = {
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: Number(process.env.REDIS_PORT || 6379),
    password: process.env.REDIS_PASSWORD || undefined,
    db: Number(process.env.REDIS_DB || 0),
    maxRetriesPerRequest: null,
    retryStrategy(times) {
        return Math.min(times * 50, 2000);
    }
};
