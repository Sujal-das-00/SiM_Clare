import express from 'express'
import dotenv from 'dotenv';
import GetAdminJwt from '../config/Adminauth.js';
import db from '../config/db.js'
import router from '../routes/routes.js';
import { errorhandler } from '../middlewares/error_handeler.js';
// const token = await GetAdminJwt();
// console.log(token);

const app = express();
const PORT = process.env.PORT || 3000

//middlewares

app.use(express.json());
// app.use(cors());

//routes
app.use('/api',router)

//error handeler
app.use(errorhandler);
app.get('/',(req,res)=>{
    res.send(`<h1>server is running lawde</h1>`)
})
app.listen(PORT,()=>{console.log(`Server is running in port ${PORT}`)})