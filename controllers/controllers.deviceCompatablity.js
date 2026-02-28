import { deviceCompatibilityFlow } from "../Orchestors/Orchestrator.deviceCompatibility.js";
import AppError from "../utils/Apperror.js";
import { handelResponse } from "../utils/errorHandeler.js";

export const checkDeviceCompatibility = async (req, res, next) => {
    try {
        const { userAgent, country } = req.body;

        if (!userAgent) {
            return next(new AppError(400,"User agent is required"));
        }

        const result = await deviceCompatibilityFlow({
            userAgent,
            country
        });

        return handelResponse(
            res,
            200,
            "Device compatibility checked successfully",
            result
        );

    } catch (error) {
        next(error);
    }
};