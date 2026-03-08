import db from "../../config/db.js";

export const findOpenCheckoutAttempt = async ({
    user_id,
    checkout_attempt_id
}) => {
    const query = `
        SELECT
            o.id AS order_id,
            p.stripe_payment_intent_id AS paymentIntentId,
            p.stripe_sessionId AS sessionId
        FROM orders o
        INNER JOIN payments p ON p.order_id = o.id
        WHERE o.user_id = ?
          AND o.checkout_attempt_id = ?
          AND o.order_status IN ('CREATED', 'PAYMENT_PENDING')
          AND p.payment_status IN ('CREATED', 'REQUIRES_PAYMENT')
          AND o.created_at >= (NOW() - INTERVAL 30 MINUTE)
        ORDER BY o.id DESC
        LIMIT 1
    `;

    const [rows] = await db.query(query, [user_id, checkout_attempt_id]);
    if (!rows.length) return null;
    return rows[0];
};
