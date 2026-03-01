import db from "../config/db.js";

/**
 * Fetch multipliers for specific country + GLOBAL fallback
 */
async function fetchMultiplierMap(destinationid) {

    const MULTIPLIER_QUERY = `
        SELECT sim_type, country_code, multiplier
        FROM sim_price_multipliers
        WHERE is_active = 1
        AND (country_code = ? OR country_code = 'GLOBAL')
    `;

    const [rows] = await db.query(MULTIPLIER_QUERY, [destinationid]);

    if (!rows || rows.length === 0) {
        console.warn("[Multiplier] No active multipliers found. Defaulting to 1.0");
        return {};
    }

    /**
     * Structure:
     * {
     *   "1": { GLOBAL: 1.2, JP: 1.5 },
     *   "2": { GLOBAL: 1.3 }
     * }
     */
    return rows.reduce((map, row) => {

        const typeKey = String(row.sim_type);

        if (!map[typeKey]) {
            map[typeKey] = {};
        }

        map[typeKey][row.country_code] = parseFloat(row.multiplier);

        return map;

    }, {});
}


/**
 * Applies country-specific multiplier with fallback hierarchy.
 *
 * @param {Array} plans
 * @param {string} destinationid (e.g. "JPN-1")
 * @returns {Promise<Array>}
 */
export async function enrichWithMultiplier(plans, destinationid) {

    if (!Array.isArray(plans) || plans.length === 0) return [];

    if (!destinationid)
        throw new Error("[Multiplier] countryCode is required for pricing resolution");

    const normalizedCountry = destinationid.toUpperCase();

    const multiplierMap = await fetchMultiplierMap(normalizedCountry);

    return plans.map(plan => {

        const typeKey = String(plan.type);

        const typeMultipliers = multiplierMap[typeKey] || {};

        //  Priority resolution
        const appliedMultiplier =
            typeMultipliers[normalizedCountry] ??
            typeMultipliers["GLOBAL"] ??
            1.0;

        if (!typeMultipliers[normalizedCountry] && !typeMultipliers["GLOBAL"]) {
            console.warn(
                `[Multiplier] No multiplier found for sim_type "${plan.type}". Defaulting to 1.0`
            );
        }

        const finalPriceCAD = parseFloat(
            (plan.basePrice * appliedMultiplier).toFixed(4)
        );

        const { basePrice, ...planWithoutCost } = plan;

        return {
            ...planWithoutCost,
            finalPriceCAD,
        };
    });
}