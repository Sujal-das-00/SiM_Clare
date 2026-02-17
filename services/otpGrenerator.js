import bcrypt from 'bcrypt'
import db from '../config/db.js';
export const generateAndSaveOtp = async (id,purpose) => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt.hash(otp, 10);
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
    try {
        await db.query('insert into user_otps (user_id,otp_hash,expires_at,purpose,is_used) values(?,?,?,?,false)', [id, otpHash, otpExpiry,purpose])
        return otp;
    } catch (error) {
        throw error
    }
}