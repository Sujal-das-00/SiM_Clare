import bcrypt from 'bcrypt'
import db from '../config/db.js'
import { createJwt } from '../services/Authentication._Client.js';
import AppError from '../utils/Apperror.js';
import { generateAndSaveOtp } from '../services/otpGrenerator.js';
import { sendMail } from '../services/mailer.js';
import { validateEmail } from '../utils/emailValidator.js';
const DUMMY_HASH = '$2b$12$6a6Zxa7/SmP2onKFsALnZemZ8qKLROavagKpy9cft7CEPHTpVEr.a';
export const userLoginService = async (email, password) => {
    try {
        
        const query = `SELECT * FROM users WHERE email=?`;
        const [rows] = await db.query(query, [email]);
        const user = rows[0];

        const hashToCompare = user ? user.password_hash : DUMMY_HASH;
        const match = await bcrypt.compare(password, hashToCompare);
        if (!user || !match) {
            throw new AppError(401, 'Invalid email or password');
        }

        if (!user.email_verified) {
            const checkEmail = await validateEmail(email);
            if (!checkEmail.valid) throw new AppError(400, checkEmail.reason)
            const otp = await generateAndSaveOtp(user.id, "EMAIL_VERIFICATION");
            await sendMail(email, otp)
            return {
                status: "UNVERIFIED_EMAIL",
                message: "Email not verified. OTP sent.",
            };
        }

        const jwttoken = await createJwt(user)
        return (jwttoken);
    } catch (error) {
        throw error
    }
}