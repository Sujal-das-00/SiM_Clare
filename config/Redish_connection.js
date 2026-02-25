import { Redis } from "@upstash/redis";
import "dotenv/config";
const redisClient = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
});
await redisClient.set('key', 'sujal');
const value = await redisClient.get('key');
console.log(value);
