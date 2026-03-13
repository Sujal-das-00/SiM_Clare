import db from "../../config/db.js";
import AppError from "../../utils/Apperror.js";

export const buildType1Payload = async (orderId) => {

    const query = `
    SELECT 
    o.id,
    o.sim_id,
    COALESCE(u.phone,p.mobile_no) AS mobile_no,
    u.email
    FROM orders o
    JOIN users u ON o.user_id = u.id
    LEFT JOIN order_provisioning p ON o.id = p.order_id
    WHERE o.id = ?
    LIMIT 1;
    `;

    const [rows] = await db.query(query, [orderId]);

    if (!rows.length) {
        throw new AppError(404, "Order not found");
    }

    const order = rows[0];

    return {
        items: [
            {
                type: "1",
                sku: order.sim_id,
                quantity: 1,
                mobileno: order.mobile_no,
                emailid: order.email
            }
        ]
    };
};

export const buildType2Payload = async (orderId) => {

    const query = `
        SELECT 
            o.id,
            o.sim_id,
            u.email
        FROM orders o
        JOIN users u ON o.user_id = u.id
        WHERE o.id = ?
        LIMIT 1
    `;

    const [rows] = await db.query(query, [orderId]);

    if (!rows.length) throw new AppError(404, "Type2 order not found");

    const order = rows[0];

    return {
        items: [
            {
                type: "2",
                sku: order.sim_id,
                quantity: 1,
                emailid: order.email
            }
        ]
    };
};

export const getType3OrderBaseData = async (orderId) => {
    const query = `
        SELECT
            o.id,
            o.sim_id
        FROM orders o
        WHERE o.id = ?
        LIMIT 1
    `;

    const [rows] = await db.query(query, [orderId]);

    if (!rows.length) throw new Error("Type3 order data not found");

    return rows[0];
};

export const buildType3PayloadFromTransientData = async (orderId, type3CustomerData) => {
    const order = await getType3OrderBaseData(orderId);

    if (!type3CustomerData) {
        throw new Error("Type3 customer data is required for transient provisioning");
    }

    return {
        items: [
            {
                type: "3",
                sku: order.sim_id,
                quantity: 1,
                productCode: order.sim_id.toUpperCase(),
                destinationId: String(type3CustomerData.destination_id),
                customer_name: type3CustomerData.customer_name,
                customer_surname1: type3CustomerData.customer_surname1,
                customer_surname2: type3CustomerData.customer_surname2 || null,
                customer_document_type_id: type3CustomerData.customer_document_type_id,
                customer_document_number: type3CustomerData.customer_document_number,
                customer_birthdate: type3CustomerData.customer_birthdate,
                customer_sex: type3CustomerData.customer_sex,
                customer_nationality_id: type3CustomerData.customer_nationality_id
            }
        ]
    };
};
