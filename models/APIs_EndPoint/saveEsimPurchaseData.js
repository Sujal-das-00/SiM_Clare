import db from "../../config/db.js";

const getOrderProvisioningDefaults = async (orderId) => {
    if (!orderId) {
        return {};
    }

    const [rows] = await db.query(
        `
        SELECT
            o.user_id,
            o.sim_id,
            o.sim_type
        FROM orders o
        WHERE o.id = ?
        LIMIT 1
        `,
        [orderId]
    );

    return rows[0] || {};
};

const normalizeProvisioningData = async (data) => {
    const orderDefaults = await getOrderProvisioningDefaults(data.order_id);

    return {
        ...data,
        user_id: data.user_id ?? orderDefaults.user_id ?? null,
        sku: data.sku ?? orderDefaults.sim_id ?? "UNKNOWN",
        product_type: data.product_type ?? orderDefaults.sim_type ?? null
    };
};

export const createProvisioningRecord = async (data) => {
    const normalizedData = await normalizeProvisioningData(data);

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
        normalizedData.order_id || null,
        normalizedData.user_id || null,
        normalizedData.provider_purchase_id || null,
        normalizedData.provider_reference || null,
        normalizedData.sku || "UNKNOWN",
        normalizedData.product_type || null,
        normalizedData.quantity || 1,
        normalizedData.activation_code || null,
        normalizedData.iccid || null,
        normalizedData.msisdn || null,
        normalizedData.nsce || null,
        normalizedData.puk || null,
        normalizedData.provider_currency || "USD",
        normalizedData.provider_amount || null,
        normalizedData.provider_status_code || null,
        normalizedData.provider_status_msg || null,
        normalizedData.provider_txn_time || null,
        normalizedData.provisioning_status || "INITIATED",
        JSON.stringify(normalizedData.raw_response || {})
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
    const normalizedData = await normalizeProvisioningData(data);
    const existing = await getProvisioningByOrderId(normalizedData.order_id);

    if (!existing) {
        return createProvisioningRecord(normalizedData);
    }

    const fields = [];
    const values = [];

    if (Object.prototype.hasOwnProperty.call(normalizedData, "provider_purchase_id")) {
        fields.push("provider_purchase_id = ?");
        values.push(normalizedData.provider_purchase_id);
    }

    if (Object.prototype.hasOwnProperty.call(normalizedData, "provider_reference")) {
        fields.push("provider_reference = ?");
        values.push(normalizedData.provider_reference);
    }

    if (Object.prototype.hasOwnProperty.call(normalizedData, "activation_code")) {
        fields.push("activation_code = ?");
        values.push(normalizedData.activation_code);
    }

    if (Object.prototype.hasOwnProperty.call(normalizedData, "iccid")) {
        fields.push("iccid = ?");
        values.push(normalizedData.iccid);
    }

    if (Object.prototype.hasOwnProperty.call(normalizedData, "msisdn")) {
        fields.push("msisdn = ?");
        values.push(normalizedData.msisdn);
    }

    if (Object.prototype.hasOwnProperty.call(normalizedData, "nsce")) {
        fields.push("nsce = ?");
        values.push(normalizedData.nsce);
    }

    if (Object.prototype.hasOwnProperty.call(normalizedData, "puk")) {
        fields.push("puk = ?");
        values.push(normalizedData.puk);
    }

    if (Object.prototype.hasOwnProperty.call(normalizedData, "provider_status_code")) {
        fields.push("provider_status_code = ?");
        values.push(normalizedData.provider_status_code);
    }

    if (Object.prototype.hasOwnProperty.call(normalizedData, "provider_status_msg")) {
        fields.push("provider_status_msg = ?");
        values.push(normalizedData.provider_status_msg);
    }

    if (Object.prototype.hasOwnProperty.call(normalizedData, "provider_txn_time")) {
        fields.push("provider_txn_time = ?");
        values.push(normalizedData.provider_txn_time);
    }

    if (Object.prototype.hasOwnProperty.call(normalizedData, "provisioning_status")) {
        fields.push("provisioning_status = ?");
        values.push(normalizedData.provisioning_status);
    }

    if (Object.prototype.hasOwnProperty.call(normalizedData, "raw_response")) {
        fields.push("raw_response = ?");
        values.push(JSON.stringify(normalizedData.raw_response || {}));
    }

    if (!fields.length) {
        return existing.id;
    }

    const query = `
        UPDATE esim_purchase_history
        SET ${fields.join(", ")}
        WHERE order_id = ?
    `;

    values.push(normalizedData.order_id);

    await db.query(query, values);
    return existing.id;
};

export const updateProvisioningStatus = async (id, status) => {
    const query = `
        UPDATE esim_purchase_history
        SET provisioning_status = ?
        WHERE id = ?
    `;

    const [result] = await db.query(query, [status, id]);
    return result.affectedRows;
};

export const incrementRetry = async (id) => {
    const query = `
        UPDATE esim_purchase_history
        SET retry_count = retry_count + 1
        WHERE id = ?
    `;

    const [result] = await db.query(query, [id]);
    return result.affectedRows;
};
