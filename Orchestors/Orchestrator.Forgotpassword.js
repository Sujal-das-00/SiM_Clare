import { generateAndSaveOtp } from "../services/otpGrenerator.js";
import db from '../config/db.js'
import AppError from "../utils/Apperror.js";
export const userForgetPasswordOrchestrator = async (email) => {
    //search the mail in db 
    try {
        const [rows] = await db.query("Select * from users where email=?", [email])
        if (rows.length === 0) {
            throw new AppError(404, "User not found")
        }
        const otp = await generateAndSaveOtp(rows[0].id,'PASSWORD_RESET');
        return otp;
        TODO:
        "calls the otp sender"
    } catch (error) {
        throw error
    }
}