import db from "../../config/db.js"

export const createPaymentService = async ({
    order_id,
    paymentIntentId,
    sessionId,
    amount,
    currency,
    status = "CREATED"
}) => {
    console.log("order-id ",order_id,"payment intent",paymentIntentId," ",sessionId," ",amount," ",currency)
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
};
