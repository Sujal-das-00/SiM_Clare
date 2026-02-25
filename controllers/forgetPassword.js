import { forgetPasswordService } from "../models/forgetPasswordService.js";
import { verifyOtpService } from "../models/models.verifyOtp.js";
import AppError from "../utils/Apperror.js";
import { handelResponse } from "../utils/errorHandeler.js";
import bcrypt from "bcrypt";
import zxcvbn from "zxcvbn";
export const resetPassword = async (req, res, next) => {
    try {
        const { email, otp, newPass } = req.body;

        if (!email || !otp || !newPass)
            return handelResponse(res, 400, "All fields required");

        if (newPass.length < 8) return handelResponse(res, 400, "Password Mmust be 8 char long")
        const SecurePassword = zxcvbn(newPass);
        if (SecurePassword.score < 3) {
            return handelResponse(res, 400, "Password is too weak. Please choose a stronger password")
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