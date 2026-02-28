
export const COUNTRY_TO_CURRENCY = {
    // North America
    US: "USD", CA: "CAD", MX: "MXN",

    // South America
    BR: "BRL", AR: "ARS", CL: "CLP", CO: "COP", PE: "PEN",

    // Europe
    GB: "GBP", DE: "EUR", FR: "EUR", IT: "EUR", ES: "EUR",
    NL: "EUR", BE: "EUR", PT: "EUR", AT: "EUR", CH: "CHF",
    SE: "SEK", NO: "NOK", DK: "DKK", PL: "PLN", CZ: "CZK",
    HU: "HUF", RO: "RON", TR: "TRY",

    // Asia
    IN: "INR", CN: "CNY", JP: "JPY", KR: "KRW", SG: "SGD",
    MY: "MYR", TH: "THB", ID: "IDR", PH: "PHP", VN: "VND",
    HK: "HKD", TW: "TWD", AE: "AED", SA: "SAR", IL: "ILS",
    PK: "PKR", BD: "BDT", LK: "LKR", NP: "NPR",

    // Oceania
    AU: "AUD", NZ: "NZD",

    // Africa
    ZA: "ZAR", NG: "NGN", KE: "KES", GH: "GHS", EG: "EGP",
};

const DEFAULT_CURRENCY = "USD";

/**
 * Returns the ISO 4217 currency code for a given ISO 3166-1 alpha-2 country code.
 * Falls back to USD for unknown countries.
 *
 * @param {string} countryCode - e.g. "IN", "US", "GB"
 * @returns {string} e.g. "INR", "USD", "GBP"
 */

export function getCurrencyForCountry(countryCode) {
    if (!countryCode || typeof countryCode !== "string") return DEFAULT_CURRENCY;
    return COUNTRY_TO_CURRENCY[countryCode.trim().toUpperCase()] ?? DEFAULT_CURRENCY;
}

