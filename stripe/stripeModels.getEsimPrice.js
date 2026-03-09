import db from "../config/db.js";

export const getOrderById = async (orderId) => {

    const query = `
        SELECT
            o.id AS order_id,
            o.base_price,
            o.order_status,
            COALESCE(p.amount, 0) AS paid_amount
        FROM orders o
        LEFT JOIN payments p
            ON p.order_id = o.id
        WHERE o.id = ?
        LIMIT 1
    `;

    try {

        const [rows] = await db.query(query, [orderId]);

        if (rows.length === 0) {
            return null;
        }
        console.log(rows)
        return rows[0];

    } catch (error) {

        console.error("getOrderById error:", error);
        throw error;

    }

};
