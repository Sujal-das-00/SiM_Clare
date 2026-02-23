
import { handelResponse } from '../utils/errorHandeler.js';
import { userLoginService } from '../models/models.userLoginService.js';

export const userLogin = async (req, res, next) => {
    try {
        const { email: rawEmail, password: rawPassword } = req.body;
        console.log(rawEmail," ", rawPassword);
        if (typeof rawEmail !== 'string' || typeof rawPassword !== 'string') {
            return handelResponse(res, 400, 'Invalid input');
        }
        const email = rawEmail.trim().toLowerCase();
        const password = rawPassword.trim();

        if (!email || !password) {
            return handelResponse(res, 400, "Please provide the username and password");
        }
        if (password.length < 8 || password.length > 72) {
            return handelResponse(res, 400, "Invaid Input");
        }
        if (email.length > 254) {
            return handelResponse(res, 400, 'Invalid input');
        }

        const user = await userLoginService(email, password)
        if (user.status === "UNVERIFIED_EMAIL") {
            return res.status(200).json(user);
        }
        res.cookie('token', user, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 3600000,
        });
        res.status(200).json({ status: "success", message: "user looged in successfuly", jwt: user })
    }
    catch (error) {
        next(error)
    }
}