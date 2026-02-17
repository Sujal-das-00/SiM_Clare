import db from '../config/db.js';
import AppError from '../utils/Apperror.js';
import bcrypt from 'bcrypt';

export const verifyOtpService = async (otp, email) => {

    const connection = await db.getConnection();

    try {
        
        const [rows] = await connection.query(
            "SELECT id, email_verified FROM users WHERE email = ?",
            [email]
        );

        if (rows.length === 0)
            throw new AppError(404, "User not found");

        const user_id = rows[0].id;
        const email_verified = rows[0].email_verified;

        const [otpRows] = await connection.query(
            `SELECT id, otp_hash, expires_at, is_used
             FROM user_otps
             WHERE user_id = ?
             AND is_used = 0
             ORDER BY created_at DESC
             LIMIT 1`,
            [user_id]
        );

        if (otpRows.length === 0)
            throw new AppError(400, "OTP not found");

        const latestOtp = otpRows[0];

        if (new Date() > new Date(latestOtp.expires_at))
            throw new AppError(400, "OTP expired");

        const isValid = await bcrypt.compare(
            otp.toString(),
            latestOtp.otp_hash
        );

        if (!isValid)
            throw new AppError(400, "Invalid OTP");

        // mark THIS OTP as used
        await connection.query(
            "UPDATE user_otps SET is_used = 1 WHERE id = ?",
            [latestOtp.id]
        );
        if(!email_verified){
            await connection.query(
            "UPDATE users SET email_verified = 1 WHERE id = ?",
            [user_id]
        )
        }
        
        await connection.commit();

        return { success: true };

    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};
