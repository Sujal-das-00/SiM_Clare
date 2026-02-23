import express from 'express'
import cors from 'cors'
import helmet from 'helmet';
import db from '../config/db.js'
import router from '../routes/routes.js';
import { errorhandler } from '../middlewares/error_handeler.js';
import limiter from '../middlewares/rateLimiter.js';


const app = express();
app.use(helmet());
app.disable('x-powered-by');

// const frontendOrigin = [
//     'http://localhost:3000',
//     'https://www.simclaire.com',
//     'https://simclaire.com'
// ];

// const corsOptions = {
//     origin: function (origin, callback) {
//         if (!origin || frontendOrigin.includes(origin)) {
//             callback(null, true);
//         } else {
//             callback(new Error('Not allowed by CORS'));
//         }
//     },
//     credentials: true,
//     methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
//     optionsSuccessStatus: 200
// };

// app.use(cors(corsOptions));
app.use(cors({
    origin: (origin, callback) => {
        callback(null, true); // dynamically allow all origins
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

//middlewares

//routes
app.use('/api', router)

//error handeler
const PORT = process.env.PORT || 7000;

app.get('/', (req, res) => {
    res.send(`<h1>server is running lawde</h1>`)
})
app.get("/health",limiter(5*60*1000,6), async (req, res) => {
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