
import { handelResponse } from '../utils/errorHandeler.js';
import { userForgetPasswordOrchestrator } from '../Orchestors/Orchestrator.Forgotpassword.js';

export const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body
        if(!email) return handelResponse(res,400,"Please provide the email") 
        //call the orchestor 
        const response = await userForgetPasswordOrchestrator(email)
        return handelResponse(res,200,"OTP sent to mail",response)
    } catch (error) {
        next(error)
    }
}