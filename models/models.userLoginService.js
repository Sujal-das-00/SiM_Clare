import bcrypt from 'bcrypt'
import db from '../config/db.js'
import { createJwt } from '../services/Authentication._Client.js';
export const userLoginService = async (email, password) => {
    try {
        const query = `SELECT * FROM users WHERE email=?`;
        const [rows] = await db.query(query, [email]);
        if (rows.length === 0) {
            const error = new Error("User not found");
            error.status = 404;
            throw error;
        }

        const user = rows[0];
        const match = await bcrypt.compare(password, user.password_hash);
        if (!match) {
            const error = new Error("Invalid password")
            error.status=401;
            throw error
        }
        const jwttoken = await createJwt(user)
        return (jwttoken);
    } catch (error) {
        throw error
    }
}