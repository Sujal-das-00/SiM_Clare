import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv';
import GetAdminJwt from '../config/Adminauth.js';
import router from '../routes/routes.js';
import { errorhandler } from '../middlewares/error_handeler.js';
// const token = await GetAdminJwt();
// console.log(token);

const app = express();
const PORT = process.env.PORT || 3000

const frontendOrigin = [
  'http://localhost:3000',
  'https://si-m-claire.vercel.app'
]; 
const corsOptions = {
  origin: frontendOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

app.use(express.json());

//middlewares

//routes
app.use('/api',router)

//error handeler


app.get('/',(req,res)=>{
    res.send(`<h1>server is running lawde</h1>`)
})
app.use(errorhandler);
app.listen(PORT,()=>{console.log(`Server is running in port ${PORT}`)})