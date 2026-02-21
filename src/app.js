import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv';
import GetAdminJwt from '../config/Adminauth.js';
import db from '../config/db.js'
import router from '../routes/routes.js';
import { errorhandler } from '../middlewares/error_handeler.js';
// const token = await GetAdminJwt();
// console.log(token);

const app = express();
// app.use(cors());
app.use(cors({
    origin: "*",
    methods: "*",
    allowedHeaders: "*"
}));
const PORT = process.env.PORT || 9000

// const frontendOrigin = [
//     'http://localhost:3000',
//     'https://www.simclaire.com',
//     'https://simclaire.com', '*'
// ];
// const corsOptions = {
//     origin: frontendOrigin,
//     credentials: true,
//     methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
//     optionsSuccessStatus: 200
// };



app.use(express.json());

//middlewares

//routes
app.use('/api', router)

//error handeler


app.get('/', (req, res) => {
    res.send(`<h1>server is running lawde</h1>`)
})
app.get("/health", async (req, res) => {
    try {
        await db.query("SELECT 1");
        res.status(200).json({
            status: "ok",
            database: "active",
            timestamp: new Date()
        });
    } catch (error) {
        console.error("Health check DB error:", error.message);
        res.status(500).json({
            status: "error",
            database: "sleeping or unreachable"
        });
    }
});
app.use(errorhandler);
app.listen(PORT, () => { console.log(`Server is running in port ${PORT}`) })