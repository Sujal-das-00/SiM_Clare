import { markPromoCodeUsed } from "../controllers/checkout_controllers/markPromoCodeUsed.js";
import { updateOrderStatus } from "../models/Checkout_models/Checkout_utils/updatePaymentStatus.js";
import { fetchSimPriceById } from "../models/Checkout_models/fetchSimPriceById.js";
import { createPaymentService } from "../models/Checkout_models/models.payment.js";
import { createOrder } from "../models/Checkout_models/checkout.orderCreate.js";
import { validatePromoService } from "../models/models.promocodeVlidator.js";
import { enrichWithMultiplier } from "../services/multiplier.js";
import { paymentGateway } from "../stripe/stripePayment.js";
import { getCurrencyForCountry } from "../utils/currencyMapper.js"
import { findOpenCheckoutAttempt } from "../models/Checkout_models/findOpenCheckoutAttempt.js";
import stripe from "../config/stripe.js";
export const checkoutOrchestrator = async (data) => {
    const {
        plan_id,
        destinationId,
        user_id,
        promocode,
        countryCode,
        acceptTerms,
        productname,
        checkout_attempt_id
    } = data;
    console.log("promocode is ",promocode)
    const displayCurrency = getCurrencyForCountry(countryCode);

    // Reuse already-open checkout attempt to avoid duplicate orders/sessions on repeated clicks.
    const openAttempt = await findOpenCheckoutAttempt({ user_id, checkout_attempt_id });
    if (openAttempt?.sessionId) {
        try {
            const existingSession = await stripe.checkout.sessions.retrieve(openAttempt.sessionId);
            if (existingSession?.url && existingSession.status === "open") {
                return {
                    reused: true,
                    order_id: openAttempt.order_id,
                    sessionId: openAttempt.sessionId,
                    paymentIntentId: openAttempt.paymentIntentId,
                    checkoutUrl: existingSession.url
                };
            }
        } catch (error) {
            console.error("Unable to reuse Stripe session:", error.message);
        }
    }

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

    //insert into orders table also update the order status to CREATED

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
        promo_code: promocode || null,
        acceptTerms,
        checkout_attempt_id
    });
    console.log("final price is",final_price)
    //mark promocode used

    if (promocode) {
        await markPromoCodeUsed(
            promocode,
            user_id,
            order_id,
            discount_amount
        );
    }
    const payment = await paymentGateway({
        final_price,
        displayCurrency,
        order_id,
        productname,
        checkout_attempt_id
    })
    await updateOrderStatus(order_id, "PAYMENT_PENDING")
    await createPaymentService({
        order_id,
        paymentIntentId: payment.paymentIntentId,
        sessionId: payment.sessionId,
        amount: payment.amount,
        currency: displayCurrency || "cad",
        status: "CREATED"
    })

    return {
        reused: false,
        final_price,
        order_id,
        sessionId: payment.sessionId,
        paymentIntentId: payment.paymentIntentId,
        checkoutUrl: payment.checkoutUrl
    }

}
