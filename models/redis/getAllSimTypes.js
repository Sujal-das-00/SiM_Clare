import { redisClient } from "../../config/Redish_connection.js";
import { fetchSimDetailsAndCache } from "./fetchSimAndCache.js";

export async function getSimListFromRedis(destinationId) {

    const cacheKey = `esim:${destinationId}:featured`;

    // 1️⃣ Try Redis first
    const cachedData = await redisClient.get(cacheKey);
    // console.log("sim cahed data is ",cachedData);
    
    if (cachedData) {
        const parsed = cachedData
        return {
            sims: cachedData
        };
    }

    //  Cache miss → Fetch + Cache
    const sims = await fetchSimDetailsAndCache(destinationId);

    return {
        sims: sims
    };
}