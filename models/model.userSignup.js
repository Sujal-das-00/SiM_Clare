import db from '../config/db.js';
import AppError from '../utils/Apperror.js';
export const userSignupService = async (email, password_hash, phone, name) => {
    try {
        if (!email || !password_hash || !name || !phone)
            throw new AppError(400,"Missing fields")
        const [findMail] = await db.query('Select * FROM users where email=?', [email]);

        if (findMail.length > 0) {
            throw new AppError(400,"Email already exists");
        }
        const [result] = await db.query(
            `INSERT INTO users 
        (email, password_hash, full_name, phone, email_verified)
        VALUES (?, ?, ?, ?, false)`,
            [email, password_hash, name, phone]
        );
        return result.insertId;
    } catch (error) {
        throw error
    }
}

