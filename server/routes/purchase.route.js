import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { checkOutSession, getAllPurchasedCourse, getCourseDetailWithPurchaseStatus, verifyPayment } from "../controllers/coursePurchase.controller.js";

const router = express.Router();

// Create checkout session for course purchase
// Used by:
// - paymentService.js: POST /api/v1/purchase/checkout/create-checkout-session
// - purchaseApi.js: POST /api/v1/purchase/checkout/create-checkout-session
router.post("/checkout/create-checkout-session", isAuthenticated, checkOutSession);

// Verify payment status after redirect
// Used by:
// - paymentService.js: POST /api/v1/purchase/verify-payment
// - CourseProgress.jsx: POST /api/v1/purchase/verify-payment
router.post("/verify-payment", isAuthenticated, verifyPayment);

// Note: Webhook endpoint is handled directly in server/index.js
// because it needs raw body parsing and must be registered before other middleware
// Webhook URL: POST /api/v1/purchase/webhook
router.route("/course/:courseId/detail-with-status").get(isAuthenticated, getCourseDetailWithPurchaseStatus);
router.route('/').get(isAuthenticated, getAllPurchasedCourse);

export default router;