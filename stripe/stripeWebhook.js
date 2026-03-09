import stripe from "../config/stripe.js";
import db from "../config/db.js";
import { handelResponse } from "../utils/errorHandeler.js";
import { isEventProcessed, storeProcessedEvent } from "./Webhooks/EventWebhook.js"
import { getOrderById } from "./stripeModels.getEsimPrice.js";
import { updateOrderStatus } from "../models/Checkout_models/Checkout_utils/updatePaymentStatus.js";
import { updatePaymentStatusByIntent } from "./Webhooks/updatePaymentTable.js"
import { getAdminBalance } from "../config/getAdminBalance.js";
import { getOrder_data_PayloadController } from "../controllers/api_payload_controller..models/getOrderbyId.js";
export const stripe_webhook_verifyPayment = async (req, res) => {

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
        return handelResponse(res, 400, "Webhook verification failed")

    }

    try {

        /**
         * Idempotency protection
         */

        const alreadyProcessed = await isEventProcessed(event.id);
        if (alreadyProcessed) {
            console.log("Duplicate webhook ignored:", event.id);
            return res.json({ received: true });
        }
        console.log("Stripe event:", event.type);
        console.log("--------------------------------------------------");
        
        switch (event.type) {

            /**
             * Checkout success
             */

            case "checkout.session.completed": {

                const session = event.data.object;
                const orderId = session.metadata?.order_id;
                const paymentIntent = session.payment_intent;

                if (!orderId) {
                    console.error("Missing order_id in metadata");
                    break;
                }

                /**
                 * Fetch order
                 */
                console.log("hello world")
                const order = await getOrderById(orderId);
                if (!order.order_id) {
                    console.error("Order not found:", orderId);
                    break;
                }

                /**
                 * Prevent duplicate fulfillment
                 */

                if (order.order_status === "COMPLETED") {
                    console.log("Order already completed:", orderId);
                    break;

                }

                /**
                 * Validate payment amount
                 */
                
                const expectedPrice = order.paid_amount
                const paidAmount = session.unit_amount / 100;
                if (paidAmount < expectedPrice) {
                    console.error("Payment amount mismatch");
                    await updateOrderStatus(orderId, "PAYMENT_MISMATCH");
                    break;
                }
                const payload = await getOrder_data_PayloadController(orderId)
                console.log("payload is ",payload)
                const esim = await buyEsimFromProvider(payload);
                /**
                 * Begin transaction
                 */

                const conn = await db.getConnection();

                await conn.beginTransaction();

                try {

                    /**
                     * Update payment table
                     */

                    await updatePaymentStatusByIntent(
                        orderId,
                        "SUCCEEDED",
                        paymentIntent,
                        conn
                    );

                    /**
                     * Check admin balance
                     */

                    // const adminBalance = await getAdminBalance();
                    const adminBalance = 100;

                    if (adminBalance < expectedPrice) {

                        await updateOrderStatus(
                            orderId,
                            "AWAITING_BALANCE",
                            conn
                        );

                    } else {

                        await updateOrderStatus(
                            orderId,
                            "COMPLETED",
                            conn
                        );

                    }

                    await conn.commit();

                } catch (err) {

                    await conn.rollback();

                    throw err;

                } finally {

                    conn.release();

                }

                console.log("Order processed:", orderId);

                break;

            }

            /**
             * Payment failed
             */

            case "payment_intent.payment_failed": {

                const intent = event.data.object;

                console.log("Payment failed:", intent.id);

                await updatePaymentStatusByIntent(
                    null,
                    "FAILED",
                    intent.id
                );

                break;

            }

            default:

                console.log("Unhandled event type:", event.type);

        }

        /**
         * Store event for idempotency
         */

        await storeProcessedEvent(event.id);

        return res.json({ received: true });

    } catch (error) {

        console.error("Webhook processing error:", error);

        return res.status(500).json({
            error: "Webhook processing failed"
        });

    }

};
