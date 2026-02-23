import express from 'express'
import { userSignup } from '../controllers/userSignup.js';
import { userLogin } from '../controllers/userLogin.js';
import { requestOtp } from '../controllers/forgotPassword.js';
import { verifyOtp } from '../controllers/verifyOtp.js';
import limiter from '../middlewares/rateLimiter.js';
import { resendOtp } from '../controllers/resendOtp.js';
import { fetchDestination } from '../controllers/fetchDestination.js';
import { getSimByDestination } from '../controllers/getSimByDestination.js';
import { resetPassword } from '../controllers/forgetPassword.js';

const router = express.Router();
router.post('/auth/login', limiter(15 * 60 * 1000, 10), userLogin);
router.post('/auth/signup', limiter(15 * 60 * 1000, 8), userSignup);
router.post('/auth/password/forgot/otp', limiter(10 * 60 * 1000, 5), requestOtp);
router.post('/auth/password/reset', limiter(5 * 60 * 1000, 5), resetPassword)
router.post('/auth/otp/verify', limiter(5 * 60 * 1000, 5), verifyOtp)
router.post('/auth/otp/resend', limiter(10 * 60 * 1000, 5), resendOtp)


router.get('/get/all-destination', fetchDestination)
router.get('/get/sims', getSimByDestination)

router.get('/', (req, res) => {
    res.send(`<h1>Routes is running lawde</h1>`)
})

export default router;