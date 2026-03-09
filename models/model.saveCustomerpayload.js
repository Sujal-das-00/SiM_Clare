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
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
        data.order_id,
        data.sim_type,
        data.mobile_no || null,
        data.msisdn || null,
        data.product_code || null,
        data.product_type || null,
        data.destination_id || null,
        data.customer_name || null,
        data.customer_surname1 || null,
        data.customer_surname2 || null,
        data.customer_document_type_id || null,
        data.customer_document_number || null,
        data.customer_birthdate || null,
        data.customer_sex || null,
        data.customer_nationality_id || null,
        data.email || null
    ];

    const [result] = await db.query(query, values);

    return result.insertId;
};