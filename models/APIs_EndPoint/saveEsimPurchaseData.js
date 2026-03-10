import db from "../../config/db.js";

/**
 * Insert provisioning record
 */
export const createProvisioningRecord = async (data) => {
    const query = `
        INSERT INTO esim_purchse_history (
            order_id,
            user_id,
            provider_purchase_id,
            provider_reference,
            sku,
            product_type,
            quantity,
            activation_code,
            iccid,
            msisdn,
            nsce,
            puk,
            provider_currency,
            provider_amount,
            provider_status_code,
            provider_status_msg,
            provider_txn_time,
            provisioning_status,
            raw_response
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
        data.order_id,
        data.user_id,
        data.provider_purchase_id,
        data.provider_reference,
        data.sku,
        data.product_type,
        data.quantity,
        data.activation_code,
        data.iccid,
        data.msisdn,
        data.nsce,
        data.puk,
        data.provider_currency,
        data.provider_amount,
        data.provider_status_code,
        data.provider_status_msg,
        data.provider_txn_time,
        data.provisioning_status || "INITIATED",
        JSON.stringify(data.raw_response)
    ];

    const [result] = await db.query(query, values);
    return result.insertId;
};


/**
 * Get provisioning by order id
 */
export const getProvisioningByOrderId = async (order_id) => {

    const query = `
        SELECT *
        FROM provider_esim_provisioning
        WHERE order_id = ?
        LIMIT 1
    `;

    const [rows] = await db.query(query, [order_id]);
    return rows[0];
};


/**
 * Update provisioning status
 */
export const updateProvisioningStatus = async (id, status) => {

    const query = `
        UPDATE provider_esim_provisioning
        SET provisioning_status = ?
        WHERE id = ?
    `;

    const [result] = await db.query(query, [status, id]);
    return result.affectedRows;
};


/**
 * Increment retry count
 */
export const incrementRetry = async (id) => {

    const query = `
        UPDATE provider_esim_provisioning
        SET retry_count = retry_count + 1
        WHERE id = ?
    `;

    const [result] = await db.query(query, [id]);
    return result.affectedRows;
};