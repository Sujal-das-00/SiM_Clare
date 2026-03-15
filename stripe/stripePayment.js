import Stripe from "stripe";
import AppError from "../utils/Apperror.js";
import { convertPriceStripe } from "./currencyConvertor.js";
import { toMinorUnits } from "./currencyNormalizer.js";
import dotenv from "dotenv"
import stripe from "../config/stripe.js";
dotenv.config()


export const paymentGateway = async ({
    final_price,
    displayCurrency,
    order_id,
    productname,
    checkout_attempt_id,
    quantity = 1,
}) => {
    const targetCurrency = displayCurrency;
    const orderId = order_id;
    const productName = productname;
    if (typeof final_price !== "number" || final_price <= 0) {
        throw new AppError(400, "Invalid amount");
    }

    if (!targetCurrency) {
        throw new AppError(400, "Target currency required");
    }
    try {

        /**
         * STEP 1
         * Convert CAD → Target Currency
         */
        const { amount, currency } =
            await convertPriceStripe(final_price, targetCurrency);
        /**
         * STEP 2 
         * NORMALIZE THE MULTIPLIER
         */
        const normalizedAmount = await toMinorUnits(amount,currency)
        /**
         * STEP 3
         * Create Stripe Checkout Session
         */
        const session = await stripe.checkout.sessions.create({

            mode: "payment",
            line_items: [
                {
                    price_data: {
                        currency,

                        product_data: {
                            name: productName
                        },

                        unit_amount: normalizedAmount
                    },

                    quantity
                }
            ],

            metadata: {
                order_id: orderId,
                currency,
                base_currency: "CAD"
            },

            success_url:
                `${process.env.PAYMENT_SUCCESS_URL}?session_id={CHECKOUT_SESSION_ID}`,

            cancel_url: process.env.PAYMENT_CANCEL_URL

        }, {
            idempotencyKey: `checkout_attempt_${checkout_attempt_id}`
        });

        return {
            sessionId: session.id,
            checkoutUrl: session.url,
            paymentIntentId: session.payment_intent,
            amount
        };

    } catch (error) {

        console.error("Stripe Error:", {
            message: error.message,
            type: error.type,
            code: error.code,
            amount
        });

        throw new AppError(
            500,
            "Payment initialization failed"
        );
    }
};
