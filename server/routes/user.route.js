import express from "express";
import { getUserProfile, register } from "../controllers/user.controller.js";
import { login, logout } from "../controllers/user.controller.js";
import { updateUserProfile } from "../controllers/user.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import upload from "../utils/multer.js";
const router = express.Router();

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/profile").get(isAuthenticated, getUserProfile); // Example of a protected route that requires authentication
router.route("/profile/update").put(isAuthenticated, upload.single("profilePhoto"), updateUserProfile); // Example of a protected route for updating user profile

export default router;
