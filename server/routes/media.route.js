import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import requireInstructor from "../middlewares/requireInstructor.js";
import upload from "../utils/multer.js";
import { uploadVideoToCloudinary } from "../utils/cloudinary.js";
import fs from "fs";

const router = express.Router();

// Video uploads are instructor-only: these end up as paid course content.
router.route("/upload-video").post(isAuthenticated, requireInstructor, upload.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No file received" });
        }

        const result = await uploadVideoToCloudinary(req.file.path);

        // Delete temp file after upload
        if (fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        res.status(200).json({
            success: true,
            message: "File uploaded successfully",
            data: {
                url: result.secure_url,
                public_id: result.public_id
            }
        });

    } catch (error) {
        console.log("Upload error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Failed to upload file",
            error: error.message
        });
    }
});

export default router;
