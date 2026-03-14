// redis.js
import Redis from "ioredis";
import "dotenv/config";

export const redisClient = new Redis({
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    db: process.env.REDIS_DB || 0,

    // Reconnect on failure
    retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
    },
    maxRetriesPerRequest: 3,
});

redisClient.on("connect", () => console.log("Redis connected"));
redisClient.on("error", (err) => console.error("Redis error:", err));