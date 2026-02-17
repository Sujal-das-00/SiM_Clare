import express from 'express'
import { userSignup } from '../controllers/userSignup.js';
import { userLogin } from '../controllers/userLogin.js';
import { forgotPassword } from '../controllers/forgotPassword.js';
import { verifyOtp } from '../controllers/verifyOtp.js';

const router = express.Router();
router.post('/login',userLogin);
router.post('/signup',userSignup);
router.post('/forgot/password',forgotPassword);
router.post('/verify/otp',verifyOtp)

router.get('/',(req,res)=>{
    res.send(`<h1>Routes is running lawde</h1>`)                   
})

export default router;