import bcrypt from 'bcrypt'
import { userSignupService } from '../models/model.userSignup.js';
import { generateAndSaveOtp } from '../services/otpGrenerator.js'
import { sendMail } from '../services/mailer.js';
import { validateEmail } from '../utils/emailValidator.js';
export const userSignupOrchestors = async (data) => {
    //trycatch do not make sense here 
    const { email, password, phone, name } = data;
    const hashed_password = await bcrypt.hash(password, 10);

    const checkEmail = await validateEmail(email);
    if (!checkEmail.valid) throw new AppError(400, checkEmail.reason)

    const user_id = await userSignupService(email, hashed_password, phone, name)
    //generate otp

    const otp = await generateAndSaveOtp(user_id, 'EMAIL_VERIFICATION');

    await sendMail(name, email, otp)

    return ({ status: 'success' })
}