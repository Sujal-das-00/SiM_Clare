import db from "../../config/db.js";

export const createProvisioningRecord = async (data) => {
    const query = `
        INSERT INTO esim_purchase_history (
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
        data.order_id || null,
        data.user_id || null,
        data.provider_purchase_id || null,
        data.provider_reference || null,
        data.sku || "UNKNOWN",
        data.product_type || null,
        data.quantity || 1,
        data.activation_code || null,
        data.iccid || null,
        data.msisdn || null,
        data.nsce || null,
        data.puk || null,
        data.provider_currency || "USD",
        data.provider_amount || null,
        data.provider_status_code || null,
        data.provider_status_msg || null,
        data.provider_txn_time || null,
        data.provisioning_status || "INITIATED",
        JSON.stringify(data.raw_response || {})
    ];

    const [result] = await db.query(query, values);
    return result.insertId;
};

export const getProvisioningByOrderId = async (orderId) => {
    const query = `
        SELECT *
        FROM esim_purchase_history
        WHERE order_id = ?
        LIMIT 1
    `;

    const [rows] = await db.query(query, [orderId]);
    return rows[0] || null;
};

export const upsertProvisioningCheckpoint = async (data) => {
    const existing = await getProvisioningByOrderId(data.order_id);

    if (!existing) {
        return createProvisioningRecord(data);
    }

    const fields = [];
    const values = [];

    if (Object.prototype.hasOwnProperty.call(data, "provider_purchase_id")) {
        fields.push("provider_purchase_id = ?");
        values.push(data.provider_purchase_id);
    }

    if (Object.prototype.hasOwnProperty.call(data, "provider_reference")) {
        fields.push("provider_reference = ?");
        values.push(data.provider_reference);
    }

    if (Object.prototype.hasOwnProperty.call(data, "activation_code")) {
        fields.push("activation_code = ?");
        values.push(data.activation_code);
    }

    if (Object.prototype.hasOwnProperty.call(data, "iccid")) {
        fields.push("iccid = ?");
        values.push(data.iccid);
    }

    if (Object.prototype.hasOwnProperty.call(data, "msisdn")) {
        fields.push("msisdn = ?");
        values.push(data.msisdn);
    }

    if (Object.prototype.hasOwnProperty.call(data, "nsce")) {
        fields.push("nsce = ?");
        values.push(data.nsce);
    }

    if (Object.prototype.hasOwnProperty.call(data, "puk")) {
        fields.push("puk = ?");
        values.push(data.puk);
    }

    if (Object.prototype.hasOwnProperty.call(data, "provider_status_code")) {
        fields.push("provider_status_code = ?");
        values.push(data.provider_status_code);
    }

    if (Object.prototype.hasOwnProperty.call(data, "provider_status_msg")) {
        fields.push("provider_status_msg = ?");
        values.push(data.provider_status_msg);
    }

    if (Object.prototype.hasOwnProperty.call(data, "provider_txn_time")) {
        fields.push("provider_txn_time = ?");
        values.push(data.provider_txn_time);
    }

    if (Object.prototype.hasOwnProperty.call(data, "provisioning_status")) {
        fields.push("provisioning_status = ?");
        values.push(data.provisioning_status);
    }

    if (Object.prototype.hasOwnProperty.call(data, "raw_response")) {
        fields.push("raw_response = ?");
        values.push(JSON.stringify(data.raw_response || {}));
    }

    if (!fields.length) {
        return existing.id;
    }

    const query = `
        UPDATE esim_purchase_history
        SET ${fields.join(", ")}
        WHERE order_id = ?
    `;

    values.push(data.order_id);

    await db.query(query, values);
    return existing.id;
};
