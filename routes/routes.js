import express from 'express'
import { userSignup } from '../controllers/userSignup.js';
import { userLogin } from '../controllers/userLogin.js';
import { forgotPassword } from '../controllers/forgotPassword.js';

const router = express.Router();
router.post('/login',userLogin);
router.post('/signup',userSignup);
router.get('/',(req,res)=>{
    res.send(`<h1>Routes is running lawde</h1>`)                   
})
router.post('/forgot/password',forgotPassword);
export default router;