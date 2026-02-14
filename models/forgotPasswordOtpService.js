import db from '../config/db.js';

export const forgotPasswordOtpService = async (email, otp_hashed, expiry) => {
    try {
        if (!email || !otp_hashed || !expiry) {
            const error = new Error("OTP not generated properly");
            error.status = 400;
            throw error;
        }

        const query = `
            INSERT INTO password_resets (email, otp_hash, expires_at)
            VALUES (?, ?, ?)
        `;

        await db.query(query, [email, otp_hashed, expiry]);

        return true;

    } catch (error) {
        throw error;
    }
};
