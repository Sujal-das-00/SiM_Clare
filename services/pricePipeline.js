// services/pricingPipeline.js
import { getExchangeRates } from "./getExcchangeRates.js";
import { enrichWithMultiplier } from "./multiplier.js";

const PROVIDER_CURRENCY = "CAD";

/**
 * Converts a CAD price to the target display currency.
 * Falls back to CAD if rate is unavailable.
 */
function convertPrice(priceCAD, targetCurrency, rates) {
    if (targetCurrency === PROVIDER_CURRENCY) {
        return parseFloat(priceCAD.toFixed(2));
    }

    const rate = rates[targetCurrency];

    if (!rate || typeof rate !== "number") {
        console.warn(`[Pricing] No rate for "${targetCurrency}", falling back to CAD`);
        return parseFloat(priceCAD.toFixed(2));
    }

    return parseFloat((priceCAD * rate).toFixed(2));
}

/**
 * Full pricing pipeline:
 *   plans (with basePrice) → multiplier → FX conversion → frontend-ready
 *
 * @param {Array}  plans           - Curated plans from Redis cache
 * @param {string} displayCurrency - ISO 4217 code e.g. "INR", "USD"
 * @returns {Promise<Array>}
 */
export async function pricingPipeline(plans, displayCurrency) {

    if (!Array.isArray(plans) || plans.length === 0) return [];
    if (!displayCurrency || typeof displayCurrency !== "string") {
        console.warn("[Pricing] Invalid displayCurrency, falling back to CAD");
        displayCurrency = PROVIDER_CURRENCY;
    }


    // Run in parallel — independent operations
    const [enrichedPlans, rates] = await Promise.all([
        enrichWithMultiplier(plans),
        getExchangeRates(),
    ]);
    console.log(enrichedPlans)
    console.log(rates)

    return enrichedPlans.map(plan => {
        const finalPrice = convertPrice(plan.finalPriceCAD, displayCurrency, rates);
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