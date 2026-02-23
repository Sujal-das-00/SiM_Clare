import { generateAndSaveOtp } from "../services/otpGrenerator.js";
import db from '../config/db.js'
import AppError from "../utils/Apperror.js";
import { sendMail } from "../services/mailer.js";
import { validateEmail } from "../utils/emailValidator.js";
export const userForgetPasswordOrchestrator = async (email) => {
    //search the mail in db 
    try {
        
        const checkEmail = await validateEmail(email);
        if(!checkEmail.valid) throw new AppError(400,checkEmail.reason)
        
        const [rows] = await db.query("Select * from users where email=?", [email])
        if (rows.length === 0) {
            throw new AppError(404, "User not found")
        }
        const otp = await generateAndSaveOtp(rows[0].id,'PASSWORD_RESET');
        const response = await sendMail(rows[0].full_name,email,otp)
        if(response)return ({sucess:true})
        return ({sucess:false})
    } catch (error) {
        throw error
    }
}