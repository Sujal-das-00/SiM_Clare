import { getRatesCached } from "../services/exchangeRatesInMemoryCache.js";
import { convertCurrency } from "../services/pricePipeline.js";

export async function convertPriceStripe(priceCAD, targetCurrency) {
    const rates = await getRatesCached()
    const PROVIDER_CURRENCY = "CAD";
    if (!targetCurrency || !rates[targetCurrency]) {
        console.warn(`[FX] Currency ${targetCurrency} not available, falling back to CAD`);
        return {
            currency: PROVIDER_CURRENCY.toLowerCase(),
            amount
            //: Math.round((priceCAD + Number.EPSILON) * 100)
        };
    }
    const converted = await convertCurrency(priceCAD, targetCurrency, rates);
    return {
        currency: targetCurrency.toLowerCase(),
        amount:converted
        //amount: Math.round((converted + Number.EPSILON) * 100)
    };
}