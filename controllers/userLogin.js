import bcrypt from 'bcrypt';
import { handelResponse } from '../utils/errorHandeler.js';
import { userLoginService } from '../models/models.userLoginService.js';

export const   userLogin = async(req,res,next)=>{
    try {
        const {email,password} = req.body;
        if(!email||!password){
            return handelResponse(res,404,"Please provide the username and password");
        }
        const user = await userLoginService(email,password)
        if (user.status === "UNVERIFIED_EMAIL") {
            return res.status(200).json(user);
        }
        res.status(200).json({status:"success",message:"user looged in successfuly",jwt:user})
    } 
    catch (error) {
        next(error)
    }
}