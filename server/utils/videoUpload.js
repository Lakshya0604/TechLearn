import { v2 as cloudinary } from 'cloudinary';
import crypto from 'node:crypto';
let cachedLimit;
let cachedAt = 0;
export async function getVideoUploadLimit() {
    if (cachedLimit && Date.now() - cachedAt < 3600000) return cachedLimit;
    const usage = await cloudinary.api.usage();
    const limit = usage.media_limits?.video_max_size_bytes;
    if (!Number.isFinite(limit) || limit <= 0) throw new Error('Video upload limit unavailable');
    cachedLimit = limit;
    cachedAt = Date.now();
    return limit;
}
export function signVideoUpload(userId) {
    const params = {
        timestamp: Math.floor(Date.now() / 1000),
        folder: 'lectures',
        public_id: `techlearn-${userId}-${crypto.randomUUID()}`,
        overwrite: false,
    };
    return {
        ...params,
        signature: cloudinary.utils.api_sign_request(params, process.env.API_SECRET),
        apiKey: process.env.API_KEY,
        cloudName: process.env.CLOUD_NAME,
    };
}
