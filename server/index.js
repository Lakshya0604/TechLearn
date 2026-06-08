import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import connectDB from './database/db.js';
import userRoute from './routes/user.route.js';
import courseRoute from './routes/course.route.js';
import mediaRoute from './routes/media.route.js';
import purchaseRoute from './routes/purchase.route.js';
import { webhookController } from './controllers/coursePurchase.controller.js';
import courseProgressRoute from './routes/courseProgress.route.js';
import path from 'path';

dotenv.config({});


const app = express();
const __dirname = path.resolve(); // Get the absolute path of the current directory
const port = process.env.PORT || 5000;
connectDB(); // Connect to MongoDB database

// CORS configuration - must come before other middleware
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5175'], // Allow requests from these origins (React app)
    credentials: true, // Allow cookies to be sent with requests
}));

//  Stripe webhook must be raw and before json parser
// This is the ONLY webhook endpoint - configured in Stripe Dashboard
app.post(
    "/api/v1/purchase/webhook",
    express.raw({ type: "application/json" }),
    webhookController
);

app.use(express.json({ limit: '1gb' }));                          //  increased limit
app.use(express.urlencoded({ limit: '1gb', extended: true }));
app.use(cookieParser()); // Middleware to parse cookies

// APIs
app.use("/api/v1/media", mediaRoute);
app.use("/api/v1/user", userRoute);
app.use("/api/v1/course", courseRoute);
app.use("/api/v1/purchase", purchaseRoute);
app.use("/api/v1/course-progress", courseProgressRoute);

app.use(express.static(path.join(__dirname, '/client/dist'))); // Serve static files from the "public" directory
app.use((_, res) => {
    res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
}); // Catch-all route to serve index.html for any unmatched routes (for React Router)


//  Capture server and increase timeout for large video uploads
const server = app.listen(port, () => {
    console.log(`Server is running on port http://localhost:${port}`);
});
server.timeout = 600000; //  10 minutes — prevents timeout on large video uploads
server.keepAliveTimeout = 620000;  //  must be higher than timeout
server.headersTimeout = 630000;    //  must be highest