import express from 'express'
import { userSignup } from '../controllers/userSignup.js';
import { userLogin } from '../controllers/userLogin.js';
import { forgotPassword } from '../controllers/forgotPassword.js';
import { verifyOtp } from '../controllers/verifyOtp.js';
import limiter from '../middlewares/rateLimiter.js';
import { resendOtp } from '../controllers/resendOtp.js';
import { fetchDestination } from '../controllers/fetchDestination.js';
import { getSimByDestination } from '../controllers/getSimByDestination.js';
import { resetPassword } from '../controllers/forgetPassword.js';

const router = express.Router();
router.post('/login', limiter(15 * 60 * 1000, 10), userLogin);
router.post('/signup', limiter(15 * 60 * 1000, 8), userSignup);
router.post('/forgot/password-initiate', limiter(10 * 60 * 1000, 5), forgotPassword);
router.post('/forgot-password/verify', limiter(5 * 60 * 1000, 5), resetPassword)
router.post('/verify/otp', limiter(5 * 60 * 1000, 5), verifyOtp)
router.post('/resend/otp', limiter(10 * 60 * 1000, 5), resendOtp)


router.get('/get/all-destination', fetchDestination)
router.get('/get/sims', getSimByDestination)

router.get('/', (req, res) => {
    res.send(`<h1>Routes is running lawde</h1>`)
})

export default router;