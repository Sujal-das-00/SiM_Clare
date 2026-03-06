import { markPromoCodeUsed } from "../controllers/checkout_controllers/markPromoCodeUsed.js";
import { fetchSimPriceById } from "../models/Checkout_models/fetchSimPriceById.js";
import { createOrder } from "../models/Checkout_models/orderInitiate.js";
import { validatePromoService } from "../models/models.promocodeVlidator.js";
import { enrichWithMultiplier } from "../services/multiplier.js";

export const checkoutOrchestrator = async (data) => {
    const { plan_id, destinationId, user_id, promocode } = data;

    //fetch price and type from redis

    const plan = await fetchSimPriceById(plan_id, destinationId)
    const base_price = plan.basePrice;

    //fetch multiplier for the type and calculate the final price

    const enrichedPlan = await enrichWithMultiplier(plan, destinationId)
    const { finalPriceCAD, type: sim_type } = enrichedPlan[0];
    let final_price = finalPriceCAD
    let discount_amount = 0;
    let discount_value = 0;

    //Validate promocode if present

    if (promocode) {
        const promoResult = await validatePromoService({
            code: promocode,
            order_amount: final_price,
            destinationId,
            sim_type,
            user_id
        });
        final_price = promoResult.final_payable;
        discount_amount = promoResult.discount_amount || 0;
        discount_value = promoResult.discount_value || 0;
    }

    //insert into orders table

    const order_id = await createOrder({
        user_id,
        plan_id,
        country_code: destinationId,
        sim_type,
        base_price,
        discount: discount_amount,
        discount_value: discount_value,
        final_price,
        currency: "CAD",
        promo_code: promocode || null
    });

    //mark promocode used

    if (promocode) {
        await markPromoCodeUsed(
            promocode,
            user_id,
            order_id,
            discount_amount
        );
    }

    TODO: "call the stripe payment handeler"


    return final_price

}