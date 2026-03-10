import { getRatesCached } from "../services/exchangeRatesInMemoryCache.js";
import { convertCurrency } from "../services/pricePipeline.js";
import { getCurrencyForCountry } from "../utils/currencyMapper.js";
import { handelResponse } from "../utils/errorHandeler.js";

export const convertPiceDisplay = async (req, res, next) => {
    try {
        const { country, og_price } = req.body;
        if (!country || !og_price) return handelResponse(res, 400, "Please provide country or price", og_price)
        const targetCurrency = getCurrencyForCountry(country?.toUpperCase());
        const rates = await getRatesCached()
        if (!targetCurrency || !rates[targetCurrency]) {
            return handelResponse(res, 200, "Unable to fetch falling back to CAD", og_price)
        }
        const displayPrice = await convertCurrency(og_price, targetCurrency, rates);
        return handelResponse(res, 200, "display currency fetched", displayPrice)
    } catch (error) {
        next(error)
    }
}