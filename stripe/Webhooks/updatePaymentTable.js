import db from '../../config/db.js'
export const updatePaymentStatusByIntent = async (
    orderId,
    status,
    paymentIntent
) => {
    console.log("i am running")
    await db.query(
        `
    UPDATE payments
    SET payment_status = ?,stripe_payment_intent_id=?, updated_at = NOW()
    WHERE order_id = ?
    `,
        [status,paymentIntent, orderId]
    );

};
