import db from "../../config/db.js"
import { handelResponse } from "../../utils/errorHandeler.js";
export const deletePromoCode = async (req, res, next) => {
    try {
        const { id } = req.params;
        console.log(id)
        const query = `UPDATE promo_codes SET is_active = FALSE WHERE id = ?`;
        await db.query(query, [id]);
        return handelResponse(res, 200, "Promocode deleted Successfully")
    } catch (error) {
        next(error)
    }
}