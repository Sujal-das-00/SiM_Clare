
export const COUNTRY_TO_CURRENCY = {

    // NORTH AMERICA

    US: "USD", CA: "CAD", MX: "MXN", GT: "GTQ", BZ: "BZD", SV: "USD", HN: "HNL", NI: "NIO",
    CR: "CRC", PA: "PAB", DO: "DOP", HT: "HTG", JM: "JMD", BS: "BSD", BB: "BBD", TT: "TTD", CU: "CUP",
    // SOUTH AMERICA
    BR: "BRL", AR: "ARS", CL: "CLP", CO: "COP", PE: "PEN", UY: "UYU",
    PY: "PYG", BO: "BOB", EC: "USD", VE: "VES", GY: "GYD", SR: "SRD",

    // EUROPE
    GB: "GBP", IE: "EUR", FR: "EUR", DE: "EUR", IT: "EUR", ES: "EUR", PT: "EUR", NL: "EUR",
    BE: "EUR", LU: "EUR", AT: "EUR", FI: "EUR", GR: "EUR", SK: "EUR", SI: "EUR", EE: "EUR",
    LV: "EUR", LT: "EUR", CY: "EUR",
    MT: "EUR", HR: "EUR", CH: "CHF", NO: "NOK", SE: "SEK", DK: "DKK", PL: "PLN", CZ: "CZK", HU: "HUF",
    RO: "RON",
    BG: "BGN", IS: "ISK", UA: "UAH", RS: "RSD", BA: "BAM", AL: "ALL", MK: "MKD", MD: "MDL", TR: "TRY",
    // ASIA
    IN: "INR", CN: "CNY", JP: "JPY", KR: "KRW", SG: "SGD", MY: "MYR", TH: "THB", ID: "IDR", PH: "PHP",
    VN: "VND", HK: "HKD", TW: "TWD", PK: "PKR", BD: "BDT",
    LK: "LKR", NP: "NPR", AF: "AFN", IR: "IRR", IQ: "IQD", JO: "JOD", LB: "LBP", OM: "OMR", YE: "YER",
    QA: "QAR", KW: "KWD", BH: "BHD", AE: "AED", SA: "SAR", IL: "ILS", KZ: "KZT", UZ: "UZS", TM: "TMT",
    KG: "KGS", TJ: "TJS", MN: "MNT",
    MM: "MMK", KH: "KHR", LA: "LAK", BN: "BND",
    // OCEANIA
    AU: "AUD", NZ: "NZD", PG: "PGK", FJ: "FJD", SB: "SBD", WS: "WST", TO: "TOP", VU: "VUV",
    // AFRICA
    ZA: "ZAR", NG: "NGN", KE: "KES", GH: "GHS", EG: "EGP", DZ: "DZD", MA: "MAD", TN: "TND", ET: "ETB",
    UG: "UGX", TZ: "TZS", RW: "RWF",
    BI: "BIF", ZM: "ZMW", ZW: "ZWL", MW: "MWK", MZ: "MZN", AO: "AOA", NA: "NAD", BW: "BWP", CM: "XAF",
    GA: "XAF", CG: "XAF", TD: "XAF", CF: "XAF", GQ: "XAF", SN: "XOF", CI: "XOF", ML: "XOF",
    BF: "XOF", NE: "XOF",
    TG: "XOF", BJ: "XOF", GW: "XOF", SL: "SLE", LR: "LRD", GM: "GMD", SO: "SOS",
    DJ: "DJF", ER: "ERN", LY: "LYD", SD: "SDG",

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

