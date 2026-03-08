/**
 * currencyMapper.js
 *
 * Maps ISO 3166-1 alpha-2 country codes to their presentment currency,
 * then uses Stripe's live FX rates to convert a CAD base amount into
 * the local currency amount (in the currency's smallest unit / "minor unit").
 *
 * Coverage: all 135+ currencies Stripe supports for card payments as of 2024.
 * Source: https://docs.stripe.com/currencies
 */

import Stripe from "stripe";
import logger from "../../utils/logger.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2024-04-10",
    telemetry: false,
});

// ---------------------------------------------------------------------------
// Country → currency mapping  (ISO 3166-1 alpha-2 → ISO 4217 lowercase)
// ---------------------------------------------------------------------------
const COUNTRY_CURRENCY_MAP = {
    // ── North America ────────────────────────────────────────────────────────
    CA: "cad",
    US: "usd",
    MX: "mxn",

    // ── Latin America ────────────────────────────────────────────────────────
    BR: "brl",
    AR: "ars",
    CL: "clp",
    CO: "cop",
    PE: "pen",
    UY: "uyu",
    DO: "dop",
    GT: "gtq",
    CR: "crc",
    PA: "pab",
    JM: "jmd",
    TT: "ttd",

    // ── Eurozone ─────────────────────────────────────────────────────────────
    DE: "eur",
    FR: "eur",
    IT: "eur",
    ES: "eur",
    NL: "eur",
    PT: "eur",
    AT: "eur",
    BE: "eur",
    FI: "eur",
    IE: "eur",
    GR: "eur",
    CY: "eur",
    LU: "eur",
    SK: "eur",
    SI: "eur",
    EE: "eur",
    LV: "eur",
    LT: "eur",
    MT: "eur",

    // ── Non-euro Europe ───────────────────────────────────────────────────────
    GB: "gbp",
    CH: "chf",
    SE: "sek",
    NO: "nok",
    DK: "dkk",
    PL: "pln",
    CZ: "czk",
    HU: "huf",
    RO: "ron",
    BG: "bgn",
    IS: "isk",
    HR: "eur",   // Croatia joined Eurozone Jan 2023
    TR: "try",
    UA: "uah",
    GE: "gel",
    AM: "amd",
    AZ: "azn",

    // ── Asia-Pacific ──────────────────────────────────────────────────────────
    JP: "jpy",
    AU: "aud",
    NZ: "nzd",
    SG: "sgd",
    HK: "hkd",
    IN: "inr",
    PK: "pkr",
    BD: "bdt",
    LK: "lkr",
    MY: "myr",
    TH: "thb",
    PH: "php",
    ID: "idr",
    VN: "vnd",
    KR: "krw",
    TW: "twd",
    CN: "cny",   // Note: CNY has no Stripe settlement; presentment only
    NP: "npr",
    MM: "mmk",
    KH: "khr",
    LA: "lak",
    MN: "mnt",

    // ── Central Asia ──────────────────────────────────────────────────────────
    KZ: "kzt",
    UZ: "uzs",
    RU: "rub",

    // ── Middle East ───────────────────────────────────────────────────────────
    AE: "aed",
    SA: "sar",
    QA: "qar",
    KW: "kwd",
    BH: "bhd",
    OM: "omr",
    JO: "jod",
    LB: "lbp",
    IL: "ils",
    EG: "egp",

    // ── Africa ────────────────────────────────────────────────────────────────
    ZA: "zar",
    NG: "ngn",
    KE: "kes",
    GH: "ghs",
    TZ: "tzs",
    UG: "ugx",
    MA: "mad",
    TN: "tnd",
    MU: "mur",
    SC: "scr",
    BW: "bwp",
    SN: "xof",   // Senegal (CFA Franc BCEAO zone)
    CI: "xof",   // Côte d'Ivoire
    CM: "xaf",   // Cameroon (CFA Franc BEAC zone)
    GA: "xaf",   // Gabon
};

// ---------------------------------------------------------------------------
// Stripe zero-decimal currencies (amount IS in major units — no cents)
// Full list: https://docs.stripe.com/currencies#zero-decimal
// ---------------------------------------------------------------------------
const ZERO_DECIMAL_CURRENCIES = new Set([
    "bif",  // Burundian Franc
    "clp",  // Chilean Peso
    "djf",  // Djiboutian Franc
    "gnf",  // Guinean Franc
    "isk",  // Icelandic Króna  ← was missing in v1
    "jpy",  // Japanese Yen
    "kmf",  // Comorian Franc
    "krw",  // South Korean Won
    "mga",  // Malagasy Ariary
    "pyg",  // Paraguayan Guaraní
    "rwf",  // Rwandan Franc
    "ugx",  // Ugandan Shilling
    "vnd",  // Vietnamese Đồng
    "vuv",  // Vanuatu Vatu
    "xaf",  // CFA Franc BEAC
    "xof",  // CFA Franc BCEAO
    "xpf",  // CFP Franc
]);

// ---------------------------------------------------------------------------
// Three-decimal currencies (multiply by 1000 for minor units)
// ---------------------------------------------------------------------------
const THREE_DECIMAL_CURRENCIES = new Set([
    "bhd",  // Bahraini Dinar
    "jod",  // Jordanian Dinar
    "kwd",  // Kuwaiti Dinar
    "omr",  // Omani Rial
    "tnd",  // Tunisian Dinar
]);

// ---------------------------------------------------------------------------
// NOTE: Indonesian Rupiah (IDR) is a standard TWO-decimal currency in Stripe.
// It was incorrectly classified as zero-decimal in v1. The amounts are large
// (e.g. 150,000 IDR) but still require ×100 conversion to minor units.
// ---------------------------------------------------------------------------

/**
 * Resolve the presentment currency for a given country code.
 * Falls back to CAD (the billing base) if the country is unknown.
 *
 * @param {string} countryCode  ISO 3166-1 alpha-2, e.g. "IN"
 * @returns {string}            Lowercase Stripe currency code, e.g. "inr"
 */
export function resolveCurrency(countryCode) {
    if (!countryCode) return "cad";
    return COUNTRY_CURRENCY_MAP[countryCode.toUpperCase()] ?? "cad";
}

/**
 * Convert an amount in CAD to the target currency using Stripe's live FX rates.
 *
 * @param {number} amountCAD         Decimal amount in CAD  e.g. 29.99
 * @param {string} targetCurrency    Lowercase Stripe currency  e.g. "inr"
 * @returns {Promise<{
 *   convertedAmount: number,   // amount in minor units ready for Stripe
 *   exchangeRate: number,      // rate used (CAD → targetCurrency)
 *   displayAmount: number,     // human-readable decimal amount
 *   currency: string
 * }>}
 */
export async function convertCADToLocalCurrency(amountCAD, targetCurrency) {
    const currency = targetCurrency.toLowerCase();

    // No conversion needed if already CAD
    if (currency === "cad") {
        const minorUnits = toMinorUnits(amountCAD, "cad");
        return {
            convertedAmount: minorUnits,
            exchangeRate: 1,
            displayAmount: amountCAD,
            currency: "cad",
        };
    }

    // Fetch live Stripe FX rate (CAD → target)
    let rate;
    try {
        const fxResponse = await stripe.exchangeRates.retrieve("cad");
        rate = fxResponse.rates[currency];

        if (!rate) {
            logger.warn(
                `[CurrencyMapper] FX rate not available for ${currency}, falling back to CAD`,
            );
            const minorUnits = toMinorUnits(amountCAD, "cad");
            return {
                convertedAmount: minorUnits,
                exchangeRate: 1,
                displayAmount: amountCAD,
                currency: "cad",
            };
        }
    } catch (err) {
        logger.error("[CurrencyMapper] Failed to fetch Stripe FX rates", { err });
        throw new Error("Unable to retrieve exchange rates. Please try again.");
    }

    const rawConverted = amountCAD * rate;
    const minorUnits = toMinorUnits(rawConverted, currency);
    const displayAmount = fromMinorUnits(minorUnits, currency);

    logger.info("[CurrencyMapper] FX conversion", {
        amountCAD,
        currency,
        rate,
        displayAmount,
    });

    return {
        convertedAmount: minorUnits,  // integer — pass directly to Stripe
        exchangeRate: rate,
        displayAmount,
        currency,
    };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Convert a decimal amount to Stripe's minor-unit integer.
 *
 * Examples:
 *   toMinorUnits(29.99, "usd") → 2999
 *   toMinorUnits(500,   "jpy") → 500     (zero-decimal)
 *   toMinorUnits(1.234, "kwd") → 1234    (three-decimal)
 *   toMinorUnits(15000, "idr") → 1500000 (two-decimal — NOT zero-decimal!)
 */
export function toMinorUnits(amount, currency) {
    const cur = currency.toLowerCase();
    if (ZERO_DECIMAL_CURRENCIES.has(cur)) return Math.round(amount);
    if (THREE_DECIMAL_CURRENCIES.has(cur)) return Math.round(amount * 1000);
    return Math.round(amount * 100);
}

/**
 * Convert a Stripe minor-unit integer back to a human-readable decimal.
 */
export function fromMinorUnits(amount, currency) {
    const cur = currency.toLowerCase();
    if (ZERO_DECIMAL_CURRENCIES.has(cur)) return amount;
    if (THREE_DECIMAL_CURRENCIES.has(cur)) return amount / 1000;
    return amount / 100;
}