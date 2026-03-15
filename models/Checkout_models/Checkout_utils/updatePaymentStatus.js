import db from "../../../config/db.js"
import AppError from "../../../utils/Apperror.js";
import logger from "../../../utils/looger.js";

export const updateOrderStatus = async (orderId, order_status,conn=db) => {
    try {
        if (!orderId) {
            throw new AppError(400, "Order ID is required");
        }

        if (!order_status) {
            throw new AppError(400, "Order status is required");
        }

        const query = `
            UPDATE orders
            SET order_status = ?
            WHERE id = ?
        `;

        const [result] = await conn.execute(query, [order_status, orderId]);

        if (result.affectedRows === 0) {
            throw new AppError(404, "Order not found");
        }

        return {
            success: true,
            orderId,
            order_status
        };

    } catch (error) {
        logger.error(`[updateOrderStatus] Failed for orderId=${orderId}: ${error.message}`);

        throw new AppError(
            error.statusCode || 500,
            error.message || "Failed to update order status"
        );
    }
};
