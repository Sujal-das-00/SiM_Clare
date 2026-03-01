import { updateSimMultiplierService } from "../../models/AdminPanel/admin.models.simMultiplier.js";
import AppError from "../../utils/Apperror.js";
import { handelResponse } from "../../utils/errorHandeler.js";

export const updateSimMultiplier = async (req, res, next) => {
    try {
        const { sim_type, country_code, multiplier, is_active=1 } = req.body;
        console.log("update multipplier symtype ",sim_type," country_code ",country_code," multipliyer",multiplier," active" ,is_active)
        if (!sim_type)
            return next(new AppError(400,"sim_type is required"));

        if (multiplier === undefined || multiplier === null)
            return next(new AppError(400,"multiplier is required"));

        const numericMultiplier = Number(multiplier);

        if (isNaN(numericMultiplier) || numericMultiplier <= 0)
            return next(new AppError(400,"multiplier must be > 0"));

        if (numericMultiplier > 10)
            return next(new AppError(400,"multiplier cannot exceed 10"));

        // FRONTEND must send GLOBAL or country code
        const normalizedCountry = country_code
            ? country_code.toUpperCase()
            : "GLOBAL";

        const status =
            typeof is_active === "boolean"
                ? is_active ? 1 : 0
                : 1;

        const result = await updateSimMultiplierService({
            sim_type,
            country_code: normalizedCountry,
            multiplier: numericMultiplier,
            is_active: status,
        });

        return handelResponse(
            res,
            200,
            "Sim multiplier updated successfully",
            result
        );

    } catch (error) {
        next(error);
    }
};