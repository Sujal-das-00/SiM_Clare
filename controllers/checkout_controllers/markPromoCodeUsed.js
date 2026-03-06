import db from "../../config/db.js";
import AppError from "../../utils/Apperror.js";

export const markPromoCodeUsed = async (code, user_id, order_id, discount_amount) => {

    const conn = await db.getConnection();

    try {
        await conn.beginTransaction();

        //  Lock promo row
        const [[promo]] = await conn.query(
            `SELECT id, usage_limit, used_count 
             FROM promo_codes 
             WHERE code = ? 
             FOR UPDATE`,
            [code.trim().toUpperCase()]
        );

        if (!promo) {
            throw new AppError(404,"Invalid promo code");
        }

        //  Check usage limit
        if (promo.usage_limit !== null && promo.used_count >= promo.usage_limit) {
            throw new AppError(400,"Promo usage limit reached");
        }

        //  Increase usage count atomically
        await conn.query(
            `UPDATE promo_codes
             SET used_count = used_count + 1
             WHERE id = ?`,
            [promo.id]
        );

        //  Insert redemption record
        await conn.query(
            `INSERT INTO promo_redemptions
            (promo_id, user_id, order_id, discount_amount)
            VALUES (?, ?, ?, ?)`,
            [promo.id, user_id, order_id, discount_amount]
        );

        await conn.commit();

        return {
            success: true,
            promo_id: promo.id
        };

    } catch (error) {

        await conn.rollback();
        throw error;

    } finally {

        conn.release();

    }
};