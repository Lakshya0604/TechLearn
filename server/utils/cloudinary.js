import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
});

export const uploadToCloudinary = async (file) => {
    try {
        const uploadResponse = await cloudinary.uploader.upload(file, {
            resource_type: "auto",
        });

        return uploadResponse;
    } catch (error) {
        console.error("Error uploading to Cloudinary:", error);
        throw error;
    }
};

//  NEW — use this for all video uploads (handles large files)
export const uploadVideoToCloudinary = async (file) => {
    try {
        const uploadResponse = await cloudinary.uploader.upload_large(file, {
            resource_type: "video",
            chunk_size: 6000000,   // 6MB per chunk
            folder: "lectures",
            timeout: 300000,       // 5 minutes
        });
        return uploadResponse;
    } catch (error) {
        console.error("Error uploading video to Cloudinary:", error);
        throw error;
    }
};


export const deleteMediaFromCloudinary = async (publicId) => {
    try {
        await cloudinary.uploader.destroy(publicId);
    } catch (error) {
        console.error("Error deleting from Cloudinary:", error);
        throw error;
    }
};

export const deleteVideoFromCloudinary = async (publicId) => {
    try {
        await cloudinary.uploader.destroy(publicId, {
            resource_type: "video",
        });
    } catch (error) {
        console.error("Error deleting video:", error);
        throw error;
    }
};