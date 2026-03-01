
const DATA_TIERS = [
    { label: "300MB", min: 0, max: 499 },
    { label: "500MB", min: 500, max: 999 },
    { label: "1GB", min: 1000, max: 4999 },
    { label: "Unlimited", min: 5000, max: null },
];
const DATA_PRIMARY_THRESHOLD_MB = 100;

function normalizeToMB(plan) {
    const amount = parseFloat(plan.productDataAllowance) || 0;
    switch ((plan.dataAllowanceUnit || "").toUpperCase()) {
        case "GB": return amount * 1024;
        case "MB": return amount;
        case "KB": return amount / 1024;
        default: return 0;
    }
}

function getVoiceMinutes(plan) {
    return parseInt(plan.productVoiceMinutes) || 0;
}

function getSmsCount(plan) {
    return parseInt(plan.productSmsCount) || 0;
}

function getBasePrice(plan) {
    return parseFloat(plan.productBasePrice) || 0;
}
/**
 * Returns a Set of capabilities a plan has.
 * A plan can have: "data", "voice", "sms"
 */
function getCapabilities(plan) {
    const caps = new Set();
    if (normalizeToMB(plan) >= DATA_PRIMARY_THRESHOLD_MB) caps.add("data");
    if (getVoiceMinutes(plan) > 0) caps.add("voice");
    if (getSmsCount(plan) > 0) caps.add("sms");
    return caps;
}
/**
 * Score a data tier plan — MB per dollar
 */
function scoreDataPlan(plan) {
    const price = getBasePrice(plan);
    if (!price) return 0;
    return normalizeToMB(plan) / price;
}

/**
 * Score a combo plan — normalize each feature to a 0-1 scale then average
 * This prevents a plan with 10000 minutes skewing against one with 1GB data
 */
function scoreComBoPlan(plan, caps) {
    const price = getBasePrice(plan);
    if (!price) return 0;

    const scores = [];

    if (caps.has("data")) {
        scores.push(normalizeToMB(plan) / price);  // MB per dollar
    }
    if (caps.has("voice")) {
        scores.push(getVoiceMinutes(plan) / price); // minutes per dollar
    }
    if (caps.has("sms")) {
        scores.push(getSmsCount(plan) / price);     // sms per dollar
    }
    return scores.reduce((a, b) => a + b, 0) / scores.length;
}

/**
 * Find which DATA_TIER a plan's data allowance falls into.
 * Returns the tier object or null.
 */
function getDataTier(plan) {
    const mb = normalizeToMB(plan);
    return DATA_TIERS.find(tier =>
        mb >= tier.min && (tier.max === null || mb <= tier.max)
    ) ?? null;
}
function stripToMinimal(plan, tierLabel, category) {
    const price = getBasePrice(plan);
    if (!price) return null; 

    return {
        id: plan.productID,
        type: plan.productType,
        basePrice: price,
        currency: plan.productCurrency || "USD",
        days: plan.productValidityDays,
        // Data
        data: parseFloat(plan.productDataAllowance) || 0,
        dataUnit: plan.dataAllowanceUnit || "MB",
        dataMB: normalizeToMB(plan),              
        hasVoice: getVoiceMinutes(plan) > 0,
        voiceMinutes: getVoiceMinutes(plan),
        // SMS
        hasSms: getSmsCount(plan) > 0,
        smsCount: getSmsCount(plan),
        tierLabel,  
        category,
        local: plan.local === "true",
        localCountry:plan.localCountry
    };
}

/**
 * Given all plans for a single validity period,
 * returns the best plan per tier (up to 7).
 */
function curatePlansForDay(plansForDay) {
    const dayResult = [];
    for (const tier of DATA_TIERS) {
        const candidates = plansForDay.filter(p => {
            const caps = getCapabilities(p);
            const dataTier = getDataTier(p);
            return (
                caps.has("data") &&                    // Must have real data
                dataTier?.label === tier.label &&      // Must match this tier
                !caps.has("voice") &&                  // Pure data only
                !caps.has("sms")                       // No combo — combos handled below
            );
        });

        if (candidates.length === 0) continue;

        const best = candidates
            .map(p => ({ plan: p, score: scoreDataPlan(p) }))
            .sort((a, b) => b.score - a.score)[0]?.plan;

        if (!best) continue;

        const stripped = stripToMinimal(best, tier.label, "data");
        if (stripped) dayResult.push(stripped);
    }

    const COMBO_TIERS = [
        {
            label: "Voice+Data",
            requires: ["voice", "data"],
            excludes: ["sms"],
        },
        {
            label: "SMS+Data",
            requires: ["sms", "data"],
            excludes: ["voice"],
        },
        {
            label: "Voice+SMS+Data",
            requires: ["voice", "sms", "data"],
            excludes: [],
        },
    ];

    for (const tier of COMBO_TIERS) {
        const candidates = plansForDay.filter(p => {
            const caps = getCapabilities(p);
            const hasAllRequired = tier.requires.every(r => caps.has(r));
            const hasNoExcluded = tier.excludes.every(e => !caps.has(e));
            return hasAllRequired && hasNoExcluded;
        });

        if (candidates.length === 0) continue;

        const best = candidates
            .map(p => ({ plan: p, score: scoreComBoPlan(p, getCapabilities(p)) }))
            .sort((a, b) => b.score - a.score)[0]?.plan;

        if (!best) continue;

        const stripped = stripToMinimal(best, tier.label, "combo");
        if (stripped) dayResult.push(stripped);
    }

    return dayResult;
}

export function curatePlans(products) {
    if (!Array.isArray(products) || products.length === 0) {
        console.warn("[Curator] No products provided");
        return [];
    }
    const validProducts = products.filter(p => {
        const price = getBasePrice(p);
        const hasId = Boolean(p.productID);
        const hasDays = Number.isFinite(p.productValidityDays) && p.productValidityDays > 0;
        return price > 0 && hasId && hasDays;
    });

    if (validProducts.length === 0) {
        console.warn("[Curator] All products were filtered out as malformed");
        return [];
    }
    const uniqueDays = [
        ...new Set(validProducts.map(p => p.productValidityDays))
    ].sort((a, b) => a - b);
    const result = [];

    for (const day of uniqueDays) {
        const plansForDay = validProducts.filter(p => p.productValidityDays === day);
        const dayPlans = curatePlansForDay(plansForDay);

        result.push(...dayPlans);
    }

    // ── Summary breakdown ──────────────────────────────────────────────────────
    const breakdown = result.reduce((acc, p) => {
        acc[p.tierLabel] = (acc[p.tierLabel] || 0) + 1;
        return acc;
    }, {});

    return result;
}