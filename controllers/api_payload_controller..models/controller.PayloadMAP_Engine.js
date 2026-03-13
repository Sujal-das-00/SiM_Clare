import db from "../../config/db.js"
import AppError from "../../utils/Apperror.js"
import {
    buildType1Payload,
    buildType2Payload,
    buildType3PayloadFromTransientData
} from "./buildApiPayload.js"
export const getOrder_data_PayloadController = async (orderId, options = {}) => {
    console.log("order id ",orderId)
    const { type3CustomerData = null } = options;
    if (typeof orderId === "object" && orderId !== null) {
        orderId = orderId.order_id ?? orderId.id;
    }
    if (!orderId) {
        throw new AppError(400, "Order ID is required");
    }
    const query = `SELECT sim_type from orders where id = ?`
    const [rows] = await db.query(query, [orderId])
    let payload = null
    switch (rows[0].sim_type) {
        case 1:
            payload = await buildType1Payload(orderId)
            break;
        case 2:
            payload = await buildType2Payload(orderId);
            break;

        case 3:
            if (type3CustomerData) {
                payload = await buildType3PayloadFromTransientData(orderId, type3CustomerData);
                break;
            }

            throw new AppError(400, "Type 3 provisioning payload must be provided explicitly");

        // case 4:
        //     payload = await buildType4Payload(orderId);
        //     break;
        default:
            throw new AppError(500, `Unsupported sim type ${rows[0].sim_type}`)
    }
    return payload;
}
// getOrder_data_PayloadController(57)
