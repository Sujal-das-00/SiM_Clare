import { checkoutOrchestrator } from "../../Orchestors/checkoutOrchestrator.js";
import { handelResponse } from "../../utils/errorHandeler.js"

export const checkout_initiate = async (req, res, next) => {
    try {
        const { plan_id, destinationId, promocode, countryCode, acceptTerms = 1, productname, checkout_attempt_id } = req.body;
        if (acceptTerms === 0) return handelResponse(res, 400, "Please accept the Terms and Condition")
        if (!checkout_attempt_id) return handelResponse(res, 400, "checkout_attempt_id is required");
        const user_id = req.user.id;
        if (!plan_id) return handelResponse(res, 400, "Please select a plan");
        const response = await checkoutOrchestrator({
            plan_id,
            destinationId,
            promocode,
            countryCode,
            acceptTerms,
            user_id,
            productname,
            checkout_attempt_id
        })
        return handelResponse(res, 200, "data fetched successfully", response)
    } catch (error) {
        next(error)
    }
}
