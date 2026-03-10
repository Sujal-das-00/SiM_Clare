import pool from "../../config/db.js";
export const updatePaymentStatusByIntent = async (
    orderId,
    status,
    paymentIntent,
    db = pool
) => {
    if (orderId) {
        await db.query(
            `
            UPDATE payments
            SET payment_status = ?, stripe_payment_intent_id = COALESCE(?, stripe_payment_intent_id), updated_at = NOW()
            WHERE order_id = ?
            `,
            [status, paymentIntent, orderId]
        );

        return;
    }

    if (paymentIntent) {
        await db.query(
            `
            UPDATE payments
            SET payment_status = ?, updated_at = NOW()
            WHERE stripe_payment_intent_id = ?
            `,
            [status, paymentIntent]
        );

        return;
    }

    throw new Error("Either orderId or paymentIntent is required");
};
