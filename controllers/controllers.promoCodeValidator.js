import { validatePromoService } from "../models/models.promocodeVlidator.js";
import { handelResponse } from "../utils/errorHandeler.js";

export const validatePromoCode = async (req, res, next) => {
    try {
        const { code, order_amount, country_code, sim_type } = req.body;
        const user_id = req.user.id;   
        if (!code) {
            return handelResponse(res, 400, "Promo code is required.");
        }

        if (!order_amount || isNaN(Number(order_amount)) || Number(order_amount) <= 0) {
            return handelResponse(res, 400, "A valid order amount is required.");
        }
        const result = await validatePromoService({
            code,
            order_amount,
            country_code: country_code ?? null,
            sim_type: sim_type ?? null,
            user_id,
        });

        return handelResponse(res, 200, "Promo code applied successfully.", result);

    } catch (error) {
        next(error);
    }
};