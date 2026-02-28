// services/enrichWithMultiplier.js

import db from "../config/db.js"

const MULTIPLIER_QUERY = `
  SELECT sim_type, multiplier
  FROM   sim_price_multipliers
  WHERE  is_active = 1
  ORDER  BY sim_type ASC
`;

/**
 * Fetches all active multipliers in a single DB query.
 * @returns {Promise<Record<string, number>>} e.g. { "1": 1.2, "2": 1.35 }
 */
async function fetchMultiplierMap() {
    const  [rows]  = await db.query(MULTIPLIER_QUERY);
    console.log(rows)   
    if (!rows || rows.length === 0) {
        throw new Error("[Multiplier] sim_pricing table is empty or all rows are inactive");
    }
    return rows.reduce((map, row) => {
        map[String(row.sim_type)] = parseFloat(row.multiplier);
        return map;
    }, {});
}

/**
 * Applies sim_type multiplier to each plan's basePrice.
 * Strips basePrice from output — cost price never leaves the backend.
 *
 * @param {Array} plans - Curated plans (contain basePrice)
 * @returns {Promise<Array>} Plans with finalPriceCAD, basePrice removed
 */
export async function enrichWithMultiplier(plans) {
    if (!Array.isArray(plans) || plans.length === 0) return [];

    const multiplierMap = await fetchMultiplierMap();

    return plans.map(plan => {
        const multiplier = multiplierMap[String(plan.type)];

        if (multiplier === undefined) {
            console.warn(`[Multiplier] Unknown sim type "${plan.type}", defaulting to 1.0`);
        }

        const appliedMultiplier = multiplier ?? 1.0;
        const finalPriceCAD = parseFloat((plan.basePrice * appliedMultiplier).toFixed(4));

        // Remove cost price before it can ever reach the frontend
        const { basePrice, ...planWithoutCost } = plan;

        return {
            ...planWithoutCost,
            finalPriceCAD,
        };
    });
}