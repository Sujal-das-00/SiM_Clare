import db from "../../../config/db.js";
import AppError from "../../../utils/Apperror.js";

export const updateOrderStatus = async (orderId, order_status) => {
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

        const [result] = await db.execute(query, [order_status, orderId]);

        if (result.affectedRows === 0) {
            throw new AppError(404, "Order not found");
        }

        return {
            success: true,
            orderId,
            order_status
        };

    } catch (error) {

        console.error("Update Order Status Error:", error);

        throw new AppError(
            error.statusCode || 500,
            error.message || "Failed to update order status"
        );
    }
};