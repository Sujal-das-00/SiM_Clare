import db from "../config/db.js";

export const getType3QueueOrderById = async (orderId) => {
    const query = `
        SELECT
            o.id,
            o.user_id,
            o.sim_type,
            o.order_status,
            p.payment_status,
            eph.id AS esim_history_id,
            eph.provisioning_status
        FROM orders o
        LEFT JOIN payments p
            ON p.order_id = o.id
        LEFT JOIN esim_purchase_history eph
            ON eph.order_id = o.id
        WHERE o.id = ?
        LIMIT 1
    `;

    const [rows] = await db.query(query, [orderId]);
    return rows[0] || null;
};
