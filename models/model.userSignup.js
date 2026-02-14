import db from '../config/db.js';
import bcrypt from 'bcrypt'
import { generateOtp } from '../services/otpGrenerator.js';
export const userSignupService = async (email, password, phone, name) => {
    try {
        if (!email || !password || !name || !phone)
            throw new Error("Missing fields")
        const [findMail] = await db.query('Select * FROM users where email=?', [email]);
        if (findMail.length > 0) {
            throw new Error("Email already exist");
        }

        const otpData = await generateOtp();
        const otp = otpData.otp;
        const otpHash = otpData.otpHash;
        const otpExpiry = otpData.otpExpiry;
        
        await db.query(
            `INSERT INTO users 
        (email, password_hash, full_name, phone, otp_hash, otp_expiry, email_verified)
        VALUES (?, ?, ?, ?, ?, ?, false)`,
            [email, password, name, phone, otpHash, otpExpiry]
        );
        return ({ otp, message: "i am a test otp" })
        // await sendOTPEmail(email, otp);
    } catch (error) {
        throw error
    }
}

