// services/pricingPipeline.js
import { getRatesCached } from "./exchangeRatesInMemoryCache.js";
import { getExchangeRates } from "./getExcchangeRates.js";
import { enrichWithMultiplier } from "./multiplier.js";

const PROVIDER_CURRENCY = "CAD";

/**
 * Converts a CAD price to the target display currency.
 * Falls back to CAD if rate is unavailable.
 */
export function convertCurrency(priceCAD, targetCurrency, rates) {

    if (targetCurrency === PROVIDER_CURRENCY) {
        return priceCAD;
    }

    const rate = rates[targetCurrency];

    if (!rate || typeof rate !== "number" || rate <= 0) {
        throw new Error(`FX rate missing for ${targetCurrency}`);
    }
    return priceCAD * rate;
}
function convertPriceDisplay(priceCAD, targetCurrency, rates) {
    const converted = convertCurrency(priceCAD, targetCurrency, rates);
    return Number(converted.toFixed(2));
}

/**
 * Full pricing pipeline:
 *   plans (with basePrice) → multiplier → FX conversion → frontend-ready
 *
 * @param {Array}  plans           - Curated plans from Redis cache
 * @param {string} displayCurrency - ISO 4217 code e.g. "INR", "USD"
 * @param {string} destinationid -country code of the selected destination e.g. "USA-1", "IN-"
 * @returns {Promise<Array>}
 */
export async function pricingPipeline(plans, displayCurrency, destinationid) {

    if (!Array.isArray(plans) || plans.length === 0) return [];
    if (!displayCurrency || typeof displayCurrency !== "string") {
        displayCurrency = PROVIDER_CURRENCY;
    }


    // Run in parallel — independent operations
    const [enrichedPlans, rates] = await Promise.all([
        enrichWithMultiplier(plans, destinationid),
        getRatesCached(),
    ]);
    return enrichedPlans.map(plan => {

        const finalPrice = convertPriceDisplay(plan.finalPriceCAD, displayCurrency, rates);
        const priceCAD = parseFloat(plan.finalPriceCAD.toFixed(4));

        // Strip internal pricing fields
        const { finalPriceCAD, ...cleanPlan } = plan;

        return {
            ...cleanPlan,
            finalPrice,                      // converted to user's currency
            displayCurrency,                 // e.g. "INR"
            priceCAD,                        // always include for receipts/checkout
        };
    });
}