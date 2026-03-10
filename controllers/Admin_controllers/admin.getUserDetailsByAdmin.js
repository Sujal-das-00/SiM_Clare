import db from "../../config/db.js";
import { handelResponse } from "../../utils/errorHandeler.js";

export const getUserDetailsByAdmin = async (req, res, next) => {
    try {

        const { email } = req.body;

        if (!email) {
            return handelResponse(res, 400, "Provide email address");
        }

        // Step 1: Get user id
        const [userRows] = await db.query(
            "SELECT id FROM users WHERE email = ? LIMIT 1",
            [email]
        );

        if (userRows.length === 0) {
            return handelResponse(res, 404, "User not found");
        }

        const userId = userRows[0].id;

        const UserDataQuery = `
        SELECT
            o.id AS order_id,
            o.country_code,
            o.sim_type,
            o.base_price,
            o.discount,
            o.discount_value,
            o.final_price,
            o.currency,
            o.promo_code,
            o.order_status,
            o.created_at,

            p.id AS payment_id,
            p.stripe_payment_intent_id,
            p.stripe_sessionId,
            p.amount AS payment_amount,
            p.payment_status,

            eph.id AS esim_history_id,
            eph.iccid,
            eph.msisdn,
            eph.provisioning_status

        FROM orders o

        LEFT JOIN payments p
            ON p.order_id = o.id

        LEFT JOIN esim_purchase_history eph
            ON eph.order_id = o.id

        WHERE o.user_id = ?
        ORDER BY o.created_at DESC
        `;

        const [userData] = await db.query(UserDataQuery, [userId]);

        return handelResponse(res, 200, "Data fetched successfully", userData);

    } catch (error) {
        next(error);
    }
};