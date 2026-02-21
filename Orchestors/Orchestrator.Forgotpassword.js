import { generateAndSaveOtp } from "../services/otpGrenerator.js";
import db from '../config/db.js'
import AppError from "../utils/Apperror.js";
import { sendMail } from "../services/mailer.js";
export const userForgetPasswordOrchestrator = async (email) => {
    console.log("email is",email)
    //search the mail in db 
    try {
        const [rows] = await db.query("Select * from users where email=?", [email])
        console.log(rows)
        if (rows.length === 0) {
            throw new AppError(404, "User not found")
        }
        const otp = await generateAndSaveOtp(rows[0].id,'PASSWORD_RESET');
        const response = await sendMail(email,otp)
        return otp;
        
        
    } catch (error) {
        throw error
    }
}