import { queueEsimPurchase } from "../utils/Queues/purchaseQueueModel.js";
import { getType3QueueOrderById } from "../models/model.type3QueueOrder.js";
import AppError from "../utils/Apperror.js";

const REQUIRED_FIELDS = [
    "destination_id",
    "customer_name",
    "customer_surname1",
    "customer_document_type_id",
    "customer_document_number",
    "customer_birthdate",
    "customer_sex",
    "customer_nationality_id"
];

const getMissingFields = (payload) => {
    return REQUIRED_FIELDS.filter((field) => {
        const value = payload[field];
        return value === undefined || value === null || value === "";
    });
};

export const queueType3CustomerData = async (req, res, next) => {
    try {
        const {
            order_id,
            sim_type,
            destination_id,
            customer_name,
            customer_surname1,
            customer_surname2,
            customer_document_type_id,
            customer_document_number,
            customer_birthdate,
            customer_sex,
            customer_nationality_id
        } = req.body;

        if (!order_id) {
            throw new AppError(400, "order_id is required");
        }

        if (sim_type !== undefined && Number(sim_type) !== 3) {
            throw new AppError(400, "sim_type must be 3 for this route");
        }

        const missingFields = getMissingFields(req.body);
        if (missingFields.length) {
            throw new AppError(400, `Missing required fields: ${missingFields.join(", ")}`);
        }

        const order = await getType3QueueOrderById(order_id);

        if (!order) {
            throw new AppError(404, "Order not found");
        }

        if (Number(order.user_id) !== Number(req.user.id)) {
            throw new AppError(403, "You are not allowed to queue this order");
        }

        if (Number(order.sim_type) !== 3) {
            throw new AppError(400, "This route only supports sim_type 3 orders");
        }

        if (order.order_status === "PROVISIONING" || order.order_status === "COMPLETED") {
            throw new AppError(409, "Order has already been queued for provisioning");
        }

        if (order.order_status === "FAILED") {
            throw new AppError(409, "Failed orders cannot be queued");
        }

        if (order.order_status === "AWAITING_BALANCE") {
            throw new AppError(409, "Order cannot be queued while balance is pending");
        }

        if (order.order_status !== "PAID") {
            throw new AppError(409, "Order must be paid before queueing type 3 provisioning");
        }

        if (order.esim_history_id || order.provisioning_status) {
            throw new AppError(409, "Provisioning history already exists for this order");
        }

        const type3CustomerData = {
            destination_id,
            customer_name,
            customer_surname1,
            customer_surname2: customer_surname2 || null,
            customer_document_type_id,
            customer_document_number,
            customer_birthdate,
            customer_sex,
            customer_nationality_id
        };

        await queueEsimPurchase(order_id, {
            type3CustomerData,
            rejectIfExists: true
        });

        return res.status(202).json({
            success: true,
            message: "Type 3 customer data queued for provisioning"
        });
    } catch (error) {
        next(error);
    }
};
