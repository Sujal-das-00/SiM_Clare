import express from 'express'
import cors from 'cors'
import helmet from 'helmet';
import db from '../config/db.js'
import router from '../routes/routes.js';
import { errorhandler } from '../middlewares/error_handeler.js';
import limiter from '../middlewares/rateLimiter.js';
import cookieParser from "cookie-parser";
import { stripe_webhook_verifyPayment } from '../stripe/stripeWebhook.js';

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
const defaultAllowedOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:5500',
    'http://127.0.0.1:5500',
    'https://simclaire.com',
    'https://www.simclaire.com'
];

const envOrigins = (process.env.CORS_ALLOWED_ORIGINS || '')
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean);

const allowedOrigins = new Set([...defaultAllowedOrigins, ...envOrigins]);

const corsOptions = {
    origin: (origin, callback) => {
        // Allow non-browser tools (curl/postman) with no Origin header
        if (!origin) return callback(null, true);
        if (allowedOrigins.has(origin)) return callback(null, true);
        return callback(new Error(`Not allowed by CORS: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
};
app.use(cors(corsOptions));

// Stripe requires raw request body for webhook signature verification.
app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), stripe_webhook_verifyPayment);

app.use(express.json());

//middlewares


app.use(cookieParser());
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
        console.log("Health check DB error:", error.message);
        res.status(500).json({
            status: "error",
            database: "sleeping or unreachable"
        });
    }
});
app.use(errorhandler);
app.listen(PORT, () => { console.log(`Server is running in port ${PORT}`) })
