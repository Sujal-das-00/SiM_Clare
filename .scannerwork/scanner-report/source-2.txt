
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config();

export const createJwt = async (user) => {
    try {
        const Jwt = jwt.sign(
            { id: user.id, email: user.email },
            process.env.TOKEN_SECRET,
            { expiresIn: "1h" }
        )
        return Jwt;
    } catch (error) {
        console.error(error)
        throw error.message;
    }

}