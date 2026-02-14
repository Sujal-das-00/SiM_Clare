import bcrypt from 'bcrypt';
import { handelResponse } from '../utils/errorHandeler.js';
import { generateOtp } from '../services/otpGrenerator.js';
import db from '../config/db.js';
import { forgotPasswordOtpService } from '../models/forgotPasswordOtpService.js';

export const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body
        //check the email present in db

        const [rows] = await db.query("Select * from users where email=?", [email])
        if (rows.length === 0) {
            const error = new Error("User not found");
            error.status = 404;
            throw error;
        }

        //call the otp generator 
       const { otp, otpHash, otpExpiry } = await generateOtp();
        // console.log(otp, " ", otpHash, " ", otpExpiry)
        // res.status(200).json({otp:otp,otpExpiry:otpExpiry})

        //call otp save service
        const response = await forgotPasswordOtpService(email,otpHash,otpExpiry);
        TODO:"send mail Here "
        return handelResponse(res,200,"OTP sent to mail",otp)
    } catch (error) {
        next(error)
    }


}