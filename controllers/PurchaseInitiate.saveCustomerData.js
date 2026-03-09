import { saveCustomerOrderProvisioningService } from "../models/model.saveCustomerpayload.js";

export const saveCustomerData = async (req, res, next) => {
    try {
        const email = req.user.email;
        const {
            order_id,
            sim_type,
            mobile_no,
            msisdn,
            product_code,
            product_type,
            destination_id,
            customer_name,
            customer_surname1,
            customer_surname2,
            customer_document_type_id,
            customer_document_number,
            customer_birthdate,
            customer_sex,
            customer_nationality_id,
        } = req.body;

        if (!order_id || !sim_type) {
            return res.status(400).json({
                success: false,
                message: "order_id and sim_type are required"
            });
        }

        const data = {
            order_id,
            sim_type,
            mobile_no,
            msisdn,
            product_code,
            product_type,
            destination_id,
            customer_name,
            customer_surname1,
            customer_surname2,
            customer_document_type_id,
            customer_document_number,
            customer_birthdate,
            customer_sex,
            customer_nationality_id,
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