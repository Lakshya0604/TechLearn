import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import connectDB from './database/db.js';
import userRoute from './routes/user.route.js';
import courseRoute from './routes/course.route.js';
import mediaRoute from './routes/media.route.js';
import purchaseRoute from './routes/purchase.route.js';
import { webhookController } from './controllers/coursePurchase.controller.js';
import courseProgressRoute from './routes/courseProgress.route.js';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config({});

const app = express();
const port = process.env.PORT || 5000;

const isProduction = process.env.NODE_ENV === 'production';

// Security headers
app.use(helmet({
    contentSecurityPolicy: false, // client bundle + inline styles from the React build
    crossOriginEmbedderPolicy: false,
}));

// CORS: in production the client is served same-origin, so only the
// configured FRONTEND_URL (and local dev servers) may call cross-origin.
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5175',
    ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
];
app.use(cors({
    origin: (origin, callback) => {
        // same-origin / server-to-server requests carry no Origin header
        if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
}));

// Stripe webhook must be raw and before the json parser
app.post(
    "/api/v1/purchase/webhook",
    express.raw({ type: "application/json" }),
    webhookController
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());

// Rate limiting on credential and payment endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many attempts, please try again later' },
});
app.use("/api/v1/user/login", authLimiter);
app.use("/api/v1/user/register", authLimiter);

// APIs
app.use("/api/v1/media", mediaRoute);
app.use("/api/v1/user", userRoute);
app.use("/api/v1/course", courseRoute);
app.use("/api/v1/purchase", purchaseRoute);
app.use("/api/v1/course-progress", courseProgressRoute);

// Unknown API paths get JSON 404s, not the React app
app.use("/api", (_, res) => {
    res.status(404).json({ success: false, message: "Not found" });
});

if (isProduction) {
    app.use(express.static(path.join(process.cwd(), 'client', 'dist')));
    app.use((_, res) => {
        res.sendFile(path.join(process.cwd(), 'client', 'dist', 'index.html'));
    });
}

export default app;

// Only connect and listen when run directly, not when imported by tests
const isMain = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isMain) {
    connectDB();
    const server = app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
    server.timeout = 600000;          // 10 minutes - large video uploads
    server.keepAliveTimeout = 620000; // must be higher than timeout
    server.headersTimeout = 630000;   // must be highest
}
