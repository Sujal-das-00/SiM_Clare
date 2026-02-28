import { getSimByDestinationOrchestrator } from "../Orchestors/Orchestor.Sim_logic.js";
import { handelResponse } from "../utils/errorHandeler.js";

export const getSimByDestination = async (req, res, next) => {
    try {
        const { destinationid } = req.params;
        const { countryCode = "US" } = req.query;
        if (!destinationid || destinationid.trim() === "") {
            return handelResponse(res, 400, "Please select a destination country");
        }
        if (typeof countryCode !== "string" || countryCode.trim() === "") {
            return handelResponse(res, 400, "countryCode query param is required (e.g. ?countryCode=IN)");
        }
        const pricedPlans = await getSimByDestinationOrchestrator(
            destinationid.trim().toUpperCase(),
            countryCode.trim().toUpperCase()
        );
        return handelResponse(res, 200, "Sim details fetched successfully", {
            destination:destinationid,
            countryCode: countryCode.trim().toUpperCase(),
            plans: pricedPlans,
        });
    } catch (error) {
        next(error)
    }
}