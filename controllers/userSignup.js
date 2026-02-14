import { userSignupService } from "../models/model.userSignup.js";
import { handelResponse } from "../utils/errorHandeler.js";
import bcrypt from 'bcrypt'
import { parsePhoneNumberFromString } from 'libphonenumber-js';

export const userSignup = async (req, res, next) => {
    try {

        const { email, password, phone, name } = req.body;
        if (!email || !phone || !name || !password)
            return handelResponse(res, 404, "All fields are required");

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
        if (!emailRegex.test(email)) {
            return handelResponse(res, 400, "Invalid email format");
        }

        const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(password)) {
            return handelResponse(
                res,
                400,
                "Password must be at least 8 characters long and include 1 uppercase letter, 1 number, and 1 special character"
            );
        }
        const phoneNumber = parsePhoneNumberFromString(phone);
        if (!phoneNumber || !phoneNumber.isValid() || phoneNumber.number !== phoneNumber.format('E.164')) {
            return handelResponse(res, 400, "Phone must be valid E.164 format");
        }

        const saltRounds = 10;
        const hashed_password = await bcrypt.hash(password, saltRounds);

        // console.log("controller data ")
        // console.log(phone," ",email," ",name," ",password)
        const newUser = await userSignupService(email, hashed_password, phone, name)
        return handelResponse(res, 201, "User Created Successfully", newUser)
    } catch (error) {
        next(error)
    }
}