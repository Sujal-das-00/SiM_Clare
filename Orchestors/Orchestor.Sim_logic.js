
import { getSimListFromRedis } from "../models/redis/getAllSimTypes.js";
import { pricingPipeline } from "../services/pricePipeline.js";
import AppError from "../utils/Apperror.js";
import { getCurrencyForCountry } from "../utils/currencyMapper.js";
import logger from "../utils/looger.js";

/**
 * Orchestrates the full plan fetch + pricing flow.
 *
 * @param {string} destinationId  - e.g. "USA"
 * @param {string} countryCode    - e.g. "IN" (user's location from frontend)
 * @returns {Promise<Array>}      - Priced, frontend-ready plans
 */

export const getSimByDestinationOrchestrator = async (destinationId, countryCode) => {
    console.log("getting currency...",destinationId," country code ",countryCode)
    try {
        const displayCurrency = getCurrencyForCountry(countryCode);
        console.log("going to redis... countrycode",countryCode)
        const plans = await getSimListFromRedis(destinationId)
        if (!plans || plans.length === 0) {
            throw new AppError(404, `No plans found for destination: ${destinationId}`);
        }
        console.log("going to pricingPipeline... display currency",displayCurrency)
        const pricedPlans = await pricingPipeline(plans.sims, displayCurrency,destinationId);
        console.log("returing plans")
        return (pricedPlans)


    } catch (error) {
        logger.log(`[Orchestrator] Failed for destination="${destinationId}":`, error.message)
        throw error
    }
}   