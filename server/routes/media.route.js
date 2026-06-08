import express from "express";
import upload from "../utils/multer.js";
import { uploadVideoToCloudinary } from "../utils/cloudinary.js";
import fs from "fs";

const router = express.Router();

router.route("/upload-video").post(upload.single("file"), async (req, res) => {
    try {
        console.log("1. File received:", req.file);

        if (!req.file) {
            return res.status(400).json({ success: false, message: "No file received" });
        }

        console.log("2. File size:", (req.file.size / (1024 * 1024)).toFixed(2), "MB");
        console.log("3. File path:", req.file.path);
        console.log("4. Starting Cloudinary upload...");

        const result = await uploadVideoToCloudinary(req.file.path);

        console.log("5. Cloudinary upload success:", result.secure_url);

        // Delete temp file after upload
        if (fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        res.status(200).json({
            success: true,
            message: "File upload successfully",
            data: {
                url: result.secure_url,
                public_id: result.public_id
            }
        });

    } catch (error) {
        console.log("❌ Upload error message:", error.message);
        console.log("❌ Full error:", error);
        return res.status(500).json({
            message: "failed to upload file",
            error: error.message
        });
    }
});

export default router;