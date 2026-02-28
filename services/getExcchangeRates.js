// services/getExchangeRates.js

import { redisClient } from "../config/Redish_connection.js";



const FX_KEY = "esim:fx:rates";
const FX_META_KEY = "esim:fx:meta";
const FX_STALE_KEY = "esim:fx:stale";
const FX_LOCK_KEY = "esim:fx:lock";
const FX_TTL = 60 * 60;        // 1 hour
const FX_STALE_TTL = 60 * 60 * 24;   // 24 hours
const FX_LOCK_TTL = 20;

// Base must match your provider's billing currency
const FX_API_URL = `https://api.exchangerate-api.com/v4/latest/CAD`;

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

function normalizeRatesPayload(payload, label) {
    if (!payload) return null;

    let parsed = payload;
    if (typeof payload === "string") {
        try {
            parsed = JSON.parse(payload);
        } catch (err) {
            throw new Error(`[FX] Invalid ${label} JSON payload: ${err.message}`);
        }
    }

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        throw new Error(`[FX] Invalid ${label} payload type`);
    }

    return parsed;
}

async function acquireLock(key) {
    const res = await redisClient.set(key, "1", { nx: true, ex: FX_LOCK_TTL });
    return res === "OK" || res === 1 || res === true;
}

async function releaseLock(key) {
    try { await redisClient.del(key); } catch (_) { /* best effort */ }
}

async function fetchFromAPI() {
    const res = await fetch(FX_API_URL, {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) throw new Error(`FX API error: ${res.status} ${res.statusText}`);

    const data = await res.json();
    if (!data?.rates || typeof data.rates !== "object") {
        throw new Error("FX API returned malformed response");
    }

    return data.rates;
}

async function writeToCache(rates) {
    const meta = {
        baseCurrency: "CAD",
        fetchedAt: Date.now(),
        expiresAt: Date.now() + FX_TTL * 1000,
        totalRates: Object.keys(rates).length,
    };

    const results = await Promise.allSettled([
        redisClient.set(FX_KEY, JSON.stringify(rates), { ex: FX_TTL }),
        redisClient.set(FX_META_KEY, JSON.stringify(meta), { ex: FX_TTL }),
        redisClient.set(FX_STALE_KEY, JSON.stringify(rates), { ex: FX_STALE_TTL }),
    ]);

    const failures = results.filter((r) => r.status === "rejected");
    if (failures.length > 0) {
        throw new Error(`Cache write failed for ${failures.length} key(s)`);
    }

}

/**
 * Returns exchange rates with CAD as base.
 * Redis cached for 1 hour. Falls back to stale if API is down.
 *
 * @returns {Promise<Record<string, number>>}
 */
export async function getExchangeRates() {
    // ── 1. Cache hit ───────────────────────────────────────────────────────────
    try {
        const cached = await redisClient.get(FX_KEY);
        const normalizedCached = normalizeRatesPayload(cached, "cache");
        if (normalizedCached) return normalizedCached;
    } catch (err) {
        console.warn(err.message);
    }

    // ── 2. Acquire lock ────────────────────────────────────────────────────────
    const lockAcquired = await acquireLock(FX_LOCK_KEY);

    if (!lockAcquired) {
        const deadline = Date.now() + 9000;
        while (Date.now() < deadline) {
            await sleep(150);
            const retry = await redisClient.get(FX_KEY);
            try {
                const normalizedRetry = normalizeRatesPayload(retry, "cache");
                if (normalizedRetry) return normalizedRetry;
            } catch (err) {
                console.warn(err.message);
            }
        }
        console.warn("[FX] Lock wait timed out, trying stale");

        const staleAfterWait = await redisClient.get(FX_STALE_KEY);
        try {
            const normalizedStale = normalizeRatesPayload(staleAfterWait, "stale");
            if (normalizedStale) {
                console.warn("[FX] Serving stale exchange rates after lock timeout");
                return normalizedStale;
            }
        } catch (err) {
            console.warn(err.message);
        }

        throw new Error("Exchange rates refresh in progress, please retry");
    }

    // ── 3. Fetch fresh ─────────────────────────────────────────────────────────
    try {
        const rates = await fetchFromAPI();
        writeToCache(rates).catch((err) => {
            console.error("[FX] Cache write failed:", err.message);
        });
        return rates;
    } catch (err) {
        console.error("[FX] Fetch failed:", err.message);

        // ── 4. Stale fallback ────────────────────────────────────────────────────
        const stale = await redisClient.get(FX_STALE_KEY);
        try {
            const normalizedStale = normalizeRatesPayload(stale, "stale");
            if (normalizedStale) {
                console.warn("[FX] Serving stale exchange rates");
                return normalizedStale;
            }
        } catch (parseErr) {
            console.warn(parseErr.message);
        }

        throw new Error(`Exchange rates unavailable: ${err.message}`);
    } finally {
        if (lockAcquired) await releaseLock(FX_LOCK_KEY);
    }
}
