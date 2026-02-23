
import { userSignupOrchestors } from "../Orchestors/Orchestrator.Signup.js";
import { validateEmail } from "../utils/emailValidator.js";
import { handelResponse } from "../utils/errorHandeler.js";
import { parsePhoneNumberFromString } from 'libphonenumber-js';

export const userSignup = async (req, res, next) => {
    try {
        const { email, password, phone, name } = req.body;
        console.log("Name length:", name.length);
        if (!email || !phone || !name || !password)
            return handelResponse(res, 400, "All fields are required");

        if (email.length>80 || phone.length>20 || name.length>50 || password.length>50)
            return handelResponse(res, 400, "Fields are too long",'fail');
        const emailCheck = await validateEmail(email);
        if(!emailCheck.valid) return handelResponse(res,400,"Invalid Email Address")

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
        const newUser = await userSignupOrchestors(req.body);

        return handelResponse(res, 201, "User Created Successfully", newUser)
    } catch (error) {
        next(error)
    }
}