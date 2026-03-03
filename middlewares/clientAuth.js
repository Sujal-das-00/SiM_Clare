import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config();
export const authenticateUser = (req, res, next) => {
    try {
        const token = req.cookies?.token;
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        const decoded = jwt.verify(token, process.env.TOKEN_SECRET);

        // Attach safe user info to request object
        req.user = {
            id: decoded.userId,
            email: decoded.email
        };

        return next();

    } catch (error) {

        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                message: "Access token expired"
            });
        }

        return res.status(403).json({
            success: false,
            message: "Invalid token"
        });
    }
};