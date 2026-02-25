
import { userSignupOrchestors } from "../Orchestors/Orchestrator.Signup.js";
import { validateEmail } from "../utils/emailValidator.js";
import { handelResponse } from "../utils/errorHandeler.js";
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import zxcvbn from "zxcvbn";

export const userSignup = async (req, res, next) => {
    try {
        const { email, password, phone, name } = req.body;
        console.log("Name length:", name.length);
        if (!email || !phone || !name || !password)
            return handelResponse(res, 400, "All fields are required");

        if (email.length > 80 || phone.length > 20 || name.length > 50 || password.length > 80)
            return handelResponse(res, 400, "Fields are too long", 'fail');
        const emailCheck = await validateEmail(email);
        if (!emailCheck.valid) return handelResponse(res, 400, "Invalid Email Address")
        if(password.length<8) return handelResponse(res,400,"Password Mmust be 8 char long")
        const SecurePassword = zxcvbn(password);
        if (SecurePassword.score < 3) {
            return handelResponse(res,400,"Password is too weak. Please choose a stronger password")
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