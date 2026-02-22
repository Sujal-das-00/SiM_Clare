import { ismailExistService } from "../models/ismailExistService.js";
import { sendMail } from "../services/mailer.js";
import { generateAndSaveOtp } from "../services/otpGrenerator.js";
import AppError from "../utils/Apperror.js";
import { validateEmail } from "../utils/emailValidator.js";
import { handelResponse } from "../utils/errorHandeler.js";


export const resendOtp = async (req,res,next)=>{
    try {
         
        const {email} = req.body;
        const checkEmail = await validateEmail(email);
        if(!checkEmail.valid) throw new AppError(400,checkEmail.reason)
        if(!email) return handelResponse(res,404,"Please provide the email ")
        const ismailExist = await ismailExistService(email);
        if(!ismailExist) return handelResponse(res,404,"Email not found please do signup");

        const user_id = ismailExist.user_id;
        const name = ismailExist.name;
        const otp = await generateAndSaveOtp(user_id,'EMAIL_VERIFICATION')
        const response = await sendMail(name,email,otp);
        return handelResponse(res,200,"otp sent succcessfully",response)
    } catch (error) {
        next(error)
    }
}