import { ismailExistService } from "../models/ismailExistService.js";
import { handelResponse } from "../utils/errorHandeler.js";


export const resendOtp = async (req,res,next)=>{
    try {
        const {email} = req.body;
        if(!email) return handelResponse(res,404,"Please provide the email ")
        const ismailExist = await ismailExistService(email);
        if(!ismailExist){}
    } catch (error) {
        next(error)
    }
}