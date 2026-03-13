import db from "../config/db.js";

export const saveCustomerOrderProvisioningService = async (data) => {

    const query = `
        INSERT INTO order_provisioning (
            order_id,
            sim_type,
            mobile_no,
            msisdn,
            product_code,
            product_type,
            email
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
        data.order_id,
        data.sim_type,
        data.mobile_no || null,
        data.msisdn || null,
        data.product_code || null,
        data.product_type || null,
        data.email || null
    ];

    const [result] = await db.query(query, values);

    return result.insertId;
};
