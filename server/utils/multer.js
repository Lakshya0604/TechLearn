import multer from "multer";
import fs from "fs";

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (!fs.existsSync("uploads/")) fs.mkdirSync("uploads/");
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const upload = multer({
    storage,
    limits: {
        fileSize: 1024 * 1024 * 1024 // ✅ 1GB limit
    }
});

export default upload;