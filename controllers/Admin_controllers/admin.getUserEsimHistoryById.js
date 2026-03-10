import db from "../../config/db.js";
import { handelResponse } from "../../utils/errorHandeler.js";

export const getUserEsimHistoryById = async (req, res, next) => {
    try {

        const { esim_history_id } = req.params;

        if (!esim_history_id) {
            return handelResponse(res, 400, "esim_history_id is required");
        }

        const query = `
        SELECT

            -- esim purchase
            eph.id AS esim_history_id,
            eph.order_id,
            eph.user_id,
            eph.sku,
            eph.product_type,
            eph.quantity,
            eph.iccid,
            eph.msisdn,
            eph.activation_code,
            eph.provider_purchase_id,
            eph.provider_reference,
            eph.provider_status_code,
            eph.provider_status_msg,
            eph.provider_txn_time,
            eph.provisioning_status,

            -- order
            o.country_code,
            o.sim_type,
            o.base_price,
            o.discount,
            o.discount_value,
            o.final_price,
            o.currency,
            o.promo_code,
            o.order_status,

            -- payment
            p.stripe_payment_intent_id,
            p.stripe_sessionId,
            p.amount AS payment_amount,
            p.payment_status,

            -- provisioning data
            op.mobile_no,
            op.product_code,
            op.customer_name,
            op.customer_surname1,
            op.customer_document_number,
            op.customer_birthdate,
            op.customer_sex,
            op.customer_nationality_id,
            op.email

        FROM esim_purchase_history eph

        LEFT JOIN orders o
            ON o.id = eph.order_id

        LEFT JOIN payments p
            ON p.order_id = o.id

        LEFT JOIN order_provisioning op
            ON op.order_id = o.id

        WHERE eph.id = ?
        LIMIT 1
        `;

        const [rows] = await db.query(query, [esim_history_id]);

        if (rows.length === 0) {
            return handelResponse(res, 404, "eSIM history not found");
        }

        return handelResponse(
            res,
            200,
            "Data fetched successfully",
            rows[0]
        );

    } catch (error) {
        next(error);
    }
};