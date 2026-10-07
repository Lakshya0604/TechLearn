import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import requireInstructor from "../middlewares/requireInstructor.js";
import upload from "../utils/multer.js";
import { uploadVideoToCloudinary } from "../utils/cloudinary.js";
import fs from "fs";
import requireLectureOwner from "../middlewares/requireLectureOwner.js";
import {getVideoUploadLimit, signVideoUpload} from "../utils/videoUpload.js";

const router = express.Router();

// The browser sends video bytes directly to Cloudinary in chunks. Only the
// lecture owner may obtain a signed upload, and the API secret never leaves here.
router.get('/video-upload-config/:lectureId', isAuthenticated, requireInstructor, requireLectureOwner, async (req, res) => {
    try {
        const maxBytes = await getVideoUploadLimit();
        res.set('Cache-Control', 'no-store');
        res.json({success:true, maxBytes, chunkBytes: 6 * 1024 * 1024});
    } catch {
        res.status(503).json({message:'Unable to check video storage limits. Please try again.'});
    }
});
router.post('/video-upload-signature/:lectureId', isAuthenticated, requireInstructor, requireLectureOwner, async (req, res) => {
    try {
        const maxBytes = await getVideoUploadLimit();
        const size = Number(req.body?.size);
        if (!Number.isSafeInteger(size) || size <= 0) return res.status(400).json({message:'Choose a non-empty video file.'});
        if (size > maxBytes) return res.status(413).json({message:`Cloudinary limits each video to ${Math.round(maxBytes / 1024 / 1024)} MiB on this account. Compress the file or split it into lectures.`,maxBytes});
        res.set('Cache-Control', 'no-store');
        res.json({success:true, maxBytes, ...signVideoUpload(req.id)});
    } catch {
        res.status(503).json({message:'Unable to prepare the video upload. Please try again.'});
    }
});

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
        if (req.file?.path && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        console.log("Upload error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Failed to upload file",
            error: error.message
        });
    }
});

export default router;
