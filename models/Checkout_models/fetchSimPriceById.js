import { redisClient } from "../../config/Redish_connection.js"

export const fetchSimPriceById = async (plan_id, destinationId) => {
    let data = await redisClient.get(`esim:${destinationId}:featured`);
    if (!data) {
        data = await redisClient.get(`esim:${destinationId}:stale`);
    }

    if (!data) {
        return null;
    }

    const parsedData = typeof data === "string" ? JSON.parse(data) : data;
    const plans = Array.isArray(parsedData) ? parsedData : [];
    const plan = plans.find(p => p.id === plan_id);
    return plan
}
