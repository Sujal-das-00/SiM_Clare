import bcrypt from 'bcrypt'
import db from '../config/db.js';

/**
 * Generates a 6-digit OTP, hashes it using bcrypt,
 * stores it in the database with expiry and purpose,
 * and returns the plain OTP.
 * @param {number} id - The unique user ID associated with the OTP.
 * @param {string} purpose - The business context for which the OTP is generated.
 * @returns {Promise<string>} Returns the plain 6-digit OTP.
 * @throws {Error} Throws database or hashing errors if operation fails.
 */



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