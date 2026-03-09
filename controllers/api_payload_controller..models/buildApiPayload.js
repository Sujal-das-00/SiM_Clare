import db from "../../config/db.js";
import AppError from "../../utils/Apperror.js";

export const buildType1Payload = async (orderId) => {

    const query = `
    SELECT 
    o.id,
    o.sim_id,
    COALESCE(p.mobile_no, u.phone) AS mobile_no,
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

export const buildType3Payload = async (orderId) => {

    const query = `
        SELECT 
            o.id,
            o.sim_id,
            p.destination_id,
            p.customer_name,
            p.customer_surname1,
            p.customer_surname2,
            p.customer_document_type_id,
            p.customer_document_number,
            p.customer_birthdate,
            p.customer_sex,
            p.customer_nationality_id
        FROM orders o
        JOIN order_provisioning p ON o.id = p.order_id
        WHERE o.id = ?
        LIMIT 1
    `;

    const [rows] = await db.query(query, [orderId]);

    if (!rows.length) throw new Error("Type3 order data not found");

    const order = rows[0];

    return {
        items: [
            {
                type: "3",
                sku: order.sim_id,
                quantity: 1,
                productCode: order.sim_id.toUpperCase(),
                destinationId: String(order.destination_id),
                customer_name: order.customer_name,
                customer_surname1: order.customer_surname1,
                customer_surname2: order.customer_surname2,
                customer_document_type_id: order.customer_document_type_id,
                customer_document_number: order.customer_document_number,
                customer_birthdate: order.customer_birthdate,
                customer_sex: order.customer_sex,
                customer_nationality_id: order.customer_nationality_id
            }
        ]
    };
};