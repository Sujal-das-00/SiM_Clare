import db from "../../config/db.js"
import logger from "../../utils/looger.js";

export const createPaymentService = async ({
    order_id,
    paymentIntentId,
    sessionId,
    amount,
    currency,
    status = "CREATED"
}) => {
    try {
        const query = `
            INSERT INTO payments (
                order_id,
                stripe_payment_intent_id,
                stripe_sessionId,
                amount,
                currency,
                payment_status
            )
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        const values = [
            order_id,
            paymentIntentId,
            sessionId,
            amount,
            currency,
            status
        ];

        const [result] = await db.execute(query, values);

        return result.insertId;
    } catch (error) {
        logger.error(`[createPaymentService] Failed for order_id=${order_id}: ${error.message}`);
        throw error;
    }
};
