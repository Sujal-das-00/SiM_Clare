
import { redisClient } from "../../config/Redish_connection.js";
import { curatePlans } from "../../utils/redis.planPreproccessor.js";
import { getSimByDestinationService } from "../APIs_EndPoint/getSimByDestinationService.js";

// ─── Constants ────────────────────────────────────────────────────────────────
const CACHE_TTL = 60 * 60 * 6;   // 6 hours
const STALE_TTL = 60 * 60 * 24;  // 24 hours
const LOCK_TTL = 30;             // 30 seconds
const LOCK_RETRY_INTERVAL_MS = 100;
const LOCK_RETRY_ATTEMPTS = 15;

// ─── Key Factory ─────────────

const keys = (country) => ({
    featured: `esim:${country}:featured`,
    meta: `esim:${country}:meta`,
    stale: `esim:${country}:stale`,
    lock: `esim:${country}:lock`,
});

// ─── Lock Helpers ───────────────
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
async function acquireLock(lockKey) {
    const result = await redisClient.set(lockKey, "1", { nx: true, ex: LOCK_TTL });
    return result === "OK" || result === 1 || result === true;
}

async function releaseLock(lockKey) {
    try { await redisClient.del(lockKey); } catch (_) { /* best effort */ }
}

// ─── Cache Writer ───────────────

async function writeToCache(k, featuredPlans, totalRaw) {
    const meta = {
        totalPlans: totalRaw,
        featuredCount: featuredPlans.length,
        cachedAt: Date.now(),
        expiresAt: Date.now() + CACHE_TTL * 1000,
    };
    await Promise.all([
        redisClient.set(k.featured, JSON.stringify(featuredPlans), { ex: CACHE_TTL }),
        redisClient.set(k.meta, JSON.stringify(meta), { ex: CACHE_TTL }),
        redisClient.set(k.stale, JSON.stringify(featuredPlans), { ex: STALE_TTL }),
    ]);
}

// ─── Provider Fetch + Revalidate ───────────────
async function revalidateCache(country, k) {
    const response = await getSimByDestinationService(country);
    const products = response?.data?.data;

    if (!Array.isArray(products) || products.length === 0) {
        throw new Error(`Provider returned empty data for: ${country}`);
    }

    const featuredPlans = curatePlans(products);

    if (featuredPlans.length === 0) {
        throw new Error(`Curation returned 0 plans for: ${country}`);
    }

    await writeToCache(k, featuredPlans, products.length);
    console.log(`[Cache] Revalidated "${country}" — ${featuredPlans.length} plans stored`);
    return featuredPlans;
}

// ─── Main Export ──────────────────────────
export async function fetchSimDetailsAndCache(country) {
    if (!country || typeof country !== "string") {
        throw new Error("fetchSimDetailsAndCache: invalid country parameter");
    }

    const normalized = country.trim().toUpperCase();
    const k = keys(normalized);

    // ── 1. Serve from cache immediately ───────────────────────────────────────
    const cached = await redisClient.get(k.featured);
    if (cached) return JSON.parse(cached);

    // ── 2. Cold cache — acquire lock to prevent stampede ──────────────────────
    const lockAcquired = await acquireLock(k.lock);

    if (!lockAcquired) {
        console.log(`[Cache] Lock active for "${normalized}", waiting...`);
        for (let i = 0; i < LOCK_RETRY_ATTEMPTS; i++) {
            await sleep(LOCK_RETRY_INTERVAL_MS);
            const retry = await redisClient.get(k.featured);
            if (retry) {
                console.log(`[Cache] Got "${normalized}" after ${i + 1} retry(s)`);
                return JSON.parse(retry);
            }
        }
        console.warn(`[Cache] Lock wait timed out for "${normalized}", trying stale`);
    }

    // ── 3. Fetch from provider ─────────────────────────────────────────────────
    try {
        return await revalidateCache(normalized, k);
    } catch (err) {
        console.error(`[Cache] Provider error for "${normalized}":`, err.message);

        // ── 4. Stale fallback ────────────────────────────────────────────────────
        const stale = await redisClient.get(k.stale);
        if (stale) {
            console.warn(`[Cache] Serving stale data for "${normalized}"`);
            return JSON.parse(stale);
        }

        throw new Error(`No data available for "${normalized}": ${err.message}`);
    } finally {
        if (lockAcquired) await releaseLock(k.lock);
    }
}