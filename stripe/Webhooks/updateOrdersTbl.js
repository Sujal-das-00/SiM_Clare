import db from "../../config/db.js"
export const updateOrderStatus = async (
    orderId,
    status
) => {

    await db.query(
        `
    UPDATE orders
    SET status = ?, updated_at = NOW()
    WHERE id = ?
    `,
        [status, orderId]
    );

};