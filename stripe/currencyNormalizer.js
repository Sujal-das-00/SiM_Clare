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

const THREE_DECIMAL_CURRENCIES = new Set([
    "bhd",  // Bahraini Dinar
    "jod",  // Jordanian Dinar
    "kwd",  // Kuwaiti Dinar
    "omr",  // Omani Rial
    "tnd",  // Tunisian Dinar
]);
export async function toMinorUnits(amount, currency) {
    const cur = currency.toLowerCase();

    if (ZERO_DECIMAL_CURRENCIES.has(cur))
        return Math.round(amount);

    if (THREE_DECIMAL_CURRENCIES.has(cur))
        return Math.round(amount * 1000);

    return Math.round(amount * 100);
}