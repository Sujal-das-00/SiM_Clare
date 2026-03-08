import stripe from "../config/stripe.js";
import { isEventProcessed, storeProcessedEvent } from "./Webhooks/EventWebhook.js";
import { updatePaymentStatusByIntent } from "./Webhooks/updatePaymentTable.js";
import { updateOrderStatus } from "../models/Checkout_models/Checkout_utils/updatePaymentStatus.js";
import dotenv from "dotenv"
dotenv.config()
export const stripe_webhook_verifyPayment = async (req, res, next) => {
    const signature = req.headers["stripe-signature"];
    let event;
    try {

        event = stripe.webhooks.constructEvent(
            req.body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (error) {
        console.error("Webhook signature verification failed:", error.message);
        return res.status(400).send("Unable to verify the payment");

    }
    try {

        /**
         * Prevent duplicate event processing
         */
        const alreadyProcessed = await isEventProcessed(event.id);

        if (alreadyProcessed) {
            console.log("Duplicate webhook ignored:", event.id);
            return res.json({ received: true });
        }

        /**
         * Process event types
         */
        console.log("event type", event.type)
        const session = event.data.object;
        const orderId = session.metadata?.order_id;
        switch (event.type) {
            /**
             * Payment completed
             */

            case "checkout.session.completed": {

                const paymentIntent = session.payment_intent;


                if (!orderId) {
                    console.error("Missing order_id in metadata");
                    break;
                }

                await updatePaymentStatusByIntent(
                    orderId,
                    "SUCCEEDED",
                    paymentIntent
                );

                await updateOrderStatus(
                    orderId,
                    "PAID"
                );
                console.log(" Payment completed:", orderId);
                break;
            }

            /**
             * Payment failed
             */
            case "payment_intent.payment_failed": {

                const intent = event.data.object;

                await updatePaymentStatusByIntent(
                    orderId,
                    "FAILED",
                    intent.id,
                );

                console.log("Payment failed:", intent.id);

                break;
            }

            /**
             * Payment succeeded (extra safety)
             */
            case "payment_intent.succeeded": {

                const intent = event.data.object;

                await updatePaymentStatusByIntent(
                    orderId,
                    "SUCCEEDED",
                    intent.id
                );

                console.log(" Payment intent succeeded:", intent.id);

                break;
            }

            default:

                console.log("Unhandled event type:", event.type);

        }

        /**
         * Store processed event
         */
        await storeProcessedEvent(event.id);

        return res.json({ received: true });

    } catch (error) {

        console.error("Webhook processing error:", error);

        return res.status(500).json({
            error: "Webhook processing failed"
        });

    }

}
