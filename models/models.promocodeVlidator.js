import db from "../config/db.js";
import AppError from "../utils/Apperror.js";
export async function validatePromoService({ code, order_amount, country_code, sim_type, user_id }) {

    // ── 1. Fetch promo by code ────────────────────────────────────
    const [[promo]] = await db.query(
        `SELECT * FROM promo_codes WHERE code = ?`,
        [code.trim().toUpperCase()]
    );

    if (!promo) {
        throw new AppError("Invalid promo code.", 404);
    }

    // ── 2. Active check ───────────────────────────────────────────
    if (!promo.is_active) {
        throw new AppError("Invalid promo code.", 400);
    }

    // ── 3. Date validity ──────────────────────────────────────────
    const now = new Date();

    if (promo.valid_from && new Date(promo.valid_from) > now) {
        throw new AppError("This promo code is not yet active.", 400);
    }

    if (promo.valid_until && new Date(promo.valid_until) < now) {
        throw new AppError("This promo code has expired.", 400);
    }

    // ── 4. Global usage limit ─────────────────────────────────────
    if (promo.usage_limit !== null && promo.used_count >= promo.usage_limit) {
        throw new AppError("This promo code has reached its usage limit.", 400);
    }

    // ── 5. Per-user usage limit ───────────────────────────────────
    const [[{ user_redemption_count }]] = await db.query(
        `SELECT COUNT(*) AS user_redemption_count 
         FROM promo_redemptions 
         WHERE promo_id = ? AND user_id = ?`,
        [promo.id, user_id]
    );

    if (user_redemption_count >= promo.user_usage_limit) {
        throw new AppError("You have already used this promo code.", 400);
    }

    // ── 6. First order only ───────────────────────────────────────
    if (promo.is_first_order_only) {
        const [[{ order_count }]] = await db.query(
            `SELECT COUNT(*) AS order_count FROM orders WHERE user_id = ?`,
            [user_id]
        );

        if (order_count > 0) {
            throw new AppError("This promo code is only valid on your first order.", 400);
        }
    }

    // ── 7. Minimum order amount ───────────────────────────────────
    if (promo.min_order_amount && Number(order_amount) < Number(promo.min_order_amount)) {
        throw new AppError(
            `Minimum order amount of ${promo.min_order_amount} is required for this promo code.`,
            400
        );
    }

    // ── 8. Country restriction ────────────────────────────────────
    if (promo.country_code && promo.country_code !== country_code) {
        throw new AppError("This promo code is not valid in your region.", 400);
    }

    // ── 9. SIM type restriction ───────────────────────────────────
    if (promo.sim_type !== null && Number(promo.sim_type) !== Number(sim_type)) {
        throw new AppError("This promo code is not valid for this SIM type.", 400);
    }

    // ── 10. Calculate discount ────────────────────────────────────
    let discount_amount = 0;

    if (promo.discount_type === "flat") {
        discount_amount = Number(promo.discount_value);
    } else if (promo.discount_type === "percentage") {
        discount_amount = (Number(order_amount) * Number(promo.discount_value)) / 100;

        if (promo.max_discount !== null) {
            discount_amount = Math.min(discount_amount, Number(promo.max_discount));
        }
    }

    // Discount cannot exceed order amount
    discount_amount = Math.min(discount_amount, Number(order_amount));

    const final_payable = Number(order_amount) - discount_amount;

    return {
        promo_id: promo.id,
        code: promo.code,
        discount_type: promo.discount_type,
        discount_value: promo.discount_value,
        max_discount: promo.max_discount,
        discount_amount: parseFloat(discount_amount.toFixed(2)),
        final_payable: parseFloat(final_payable.toFixed(2)),
    };
}