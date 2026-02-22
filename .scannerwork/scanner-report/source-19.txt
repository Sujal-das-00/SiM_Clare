import { forgetPasswordService } from "../models/forgetPasswordService.js";
import { verifyOtpService } from "../models/models.verifyOtp.js";
import AppError from "../utils/Apperror.js";
import { handelResponse } from "../utils/errorHandeler.js";
import bcrypt from "bcrypt";

export const resetPassword = async (req, res, next) => {
    try {
        const { email, otp, newPass } = req.body;

        if (!email || !otp || !newPass)
            return handelResponse(res, 400, "All fields required");

        const passwordRegex =
            /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

        if (!passwordRegex.test(newPass)) {
            return handelResponse(
                res,
                400,
                "Password must be at least 8 characters long and include 1 uppercase letter, 1 number, and 1 special character"
            );
        }

        await verifyOtpService(otp, email);
        const hashedPassword = await bcrypt.hash(newPass, 10);
        const passwordRest = await forgetPasswordService(email, hashedPassword);
        if (!passwordRest)
            throw new AppError(500, "Password update failed");
        return handelResponse(res, 200, "Password reset successful");

    } catch (error) {
        next(error);
    }
};