import db from '../../config/db.js'

export const createOrder = async ({
    user_id,
    plan_id,
    country_code,
    sim_type,
    base_price,
    discount,
    discount_value,
    final_price,
    currency,
    promo_code,
    acceptTerms,
    checkout_attempt_id
}) => {
console.log("user id is ",user_id)
    try {

        const query = `
        INSERT INTO orders
        (
            user_id,
            sim_id,
            country_code,
            sim_type,
            base_price,
            discount,
            discount_value,
            final_price,
            currency,
            promo_code,
            checkout_attempt_id,
            terms_agreed,
            order_status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'CREATED')
        `;

        const values = [
            user_id,
            plan_id,
            country_code,
            sim_type,
            base_price,
            discount || 0,
            discount_value,
            final_price,
            currency || "CAD",
            promo_code || null,
            checkout_attempt_id,
            acceptTerms || 1
        ];

        const [result] = await db.query(query, values);

        return result.insertId;

    } catch (error) {

        console.error("Create Order Error:", error);
        throw error;

    }
};
