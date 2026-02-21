import express from 'express'
import { userSignup } from '../controllers/userSignup.js';
import { userLogin } from '../controllers/userLogin.js';
import { forgotPassword } from '../controllers/forgotPassword.js';
import { verifyOtp } from '../controllers/verifyOtp.js';
import limiter from '../middlewares/rateLimiter.js';
import { resendOtp } from '../controllers/resendOtp.js';
import { fetchDestination } from '../controllers/fetchDestination.js';
import { getSimByDestination } from '../controllers/getSimByDestination.js';

const router = express.Router();
router.post('/login',limiter,userLogin);
router.post('/signup',userSignup);
router.post('/forgot/password',forgotPassword);
router.post('/verify/otp',verifyOtp)
router.post('/resend/otp',resendOtp)

router.get('/get/all-destination',fetchDestination)
router.get('/get/sims',getSimByDestination)

router.get('/',(req,res)=>{
    res.send(`<h1>Routes is running lawde</h1>`)                   
})

export default router;