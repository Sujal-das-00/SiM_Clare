import { getExchangeRates } from "./getExcchangeRates.js";

let cachedRates = null;
let lastFetch = 0;

const MEMORY_TTL = 10 * 60 * 1000; // 10 minutes

export async function getRatesCached() {

    const now = Date.now();

    // Use memory cache if fresh
    if (cachedRates && (now - lastFetch) < MEMORY_TTL) {
        return cachedRates;
    }

    // Fetch from Redis layer
    const rates = await getExchangeRates();

    cachedRates = rates;
    lastFetch = now;

    return rates;
}