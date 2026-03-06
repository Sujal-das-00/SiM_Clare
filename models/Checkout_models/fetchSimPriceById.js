import { redisClient } from "../../config/Redish_connection.js"

export const fetchSimPriceById = async (plan_id, destinationId) => {
    let data = await redisClient.get(`esim:${destinationId}:featured`);
    if (!data) {
        data = await redisClient.get(`esim:${destinationId}:stale`);
    } const plan = data.find(p => p.id === plan_id);
    return plan
}