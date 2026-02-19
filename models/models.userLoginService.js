import bcrypt from 'bcrypt'
import db from '../config/db.js'
import { createJwt } from '../services/Authentication._Client.js';
import AppError from '../utils/Apperror.js';
import { generateAndSaveOtp } from '../services/otpGrenerator.js';
export const userLoginService = async (email, password) => {
    try {
        const query = `SELECT * FROM users WHERE email=?`;
        const [rows] = await db.query(query, [email]);
        const user = rows[0];
        if (rows.length === 0) {
            throw new AppError("User not found")
        }
        const match = await bcrypt.compare(password, user.password_hash);
        if (!match) throw new AppError(401, "Invallid password")

        if (!user.email_verified) {
            const otp = await generateAndSaveOtp(user.id, "EMAIL_VERIFICATION");
            TODO:
            "sends otp"
            return {
                status: "UNVERIFIED_EMAIL",
                message: "Email not verified. OTP sent.",
                email: user.email,
                otp: otp
            };
        }



        const jwttoken = await createJwt(user)
        return (jwttoken);
    } catch (error) {
        throw error
    }
}