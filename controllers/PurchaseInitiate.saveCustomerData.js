import { saveCustomerOrderProvisioningService } from "../models/model.saveCustomerpayload.js";
import AppError from "../utils/Apperror.js";

export const saveCustomerData = async (req, res, next) => {
    try {
        const email = req.user.email;
        const {
            order_id,
            sim_type,
            mobile_no,
            msisdn,
            product_code,
            product_type
        } = req.body;

        if (!order_id || !sim_type) {
            return res.status(400).json({
                success: false,
                message: "order_id and sim_type are required"
            });
        }

        if (Number(sim_type) === 3) {
            throw new AppError(
                400,
                "Use /api/post/customer/data/type3/queue for sim_type 3 orders"
            );
        }

        const data = {
            order_id,
            sim_type,
            mobile_no,
            msisdn,
            product_code,
            product_type,
            email
        };

        const insertId = await saveCustomerOrderProvisioningService(data);

        res.status(201).json({
            success: true,
            message: "Customer provisioning data saved",
            provisioning_id: insertId
        });

    } catch (error) {
        console.error("Save provisioning error:", error);
        next(error);
    }
};
