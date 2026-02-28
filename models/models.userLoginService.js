import bcrypt from 'bcrypt'
import db from '../config/db.js'
import { createJwt } from '../services/Authentication._Client.js';
import AppError from '../utils/Apperror.js';
import { generateAndSaveOtp } from '../services/otpGrenerator.js';
import { sendMail } from '../services/mailer.js';
const DUMMY_HASH = '$2b$12$6a6Zxa7/SmP2onKFsALnZemZ8qKLROavagKpy9cft7CEPHTpVEr.a';
export const userLoginService = async (email, password) => {
    try {

        const query = `SELECT * FROM users WHERE email=?`;
        const [rows] = await db.query(query, [email]);
        const user = rows[0];
        if(rows.length===0) throw new AppError(404,"Email not found")

        if (!user.email_verified) {
            const otp = await generateAndSaveOtp(user.id, "EMAIL_VERIFICATION")
            await sendMail(email, otp)
            throw new AppError(400, "Email not verified")
        }
        const hashToCompare = user ? user.password_hash : DUMMY_HASH;
        const match = await bcrypt.compare(password, hashToCompare);
        if (!user || !match) {
            throw new AppError(401, 'Invalid email or password');
        }
        const jwttoken = await createJwt(user)
        return (jwttoken);
    } catch (error) {
        throw error
    }
}