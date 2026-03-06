import { checkoutOrchestrator } from "../../Orchestors/checkoutOrchestrator.js";
import { handelResponse } from "../../utils/errorHandeler.js"

export const checkout_initiate = async (req, res, next) => {
    try {
        const { plan_id, destinationId, promocode = null } = req.body
        console.log(plan_id)
        const user_id = req.user.id;
        console.log(user_id)
        // const user_id = 1;
        if (!plan_id) return handelResponse(res, 400, "Please select a plan");
        const price = await checkoutOrchestrator({ plan_id,destinationId, user_id, promocode })
        return handelResponse(res,200,"data fetched successfully",price)
    } catch (error) {
        next(error)
    }
}