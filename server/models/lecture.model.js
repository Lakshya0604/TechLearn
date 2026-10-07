import mongoose from "mongoose";
const lectureSchema = new mongoose.Schema({
    isDemo: {type:Boolean,default:false},
    content: {type:String},
    lectureTitle: {
        type: String,
        required: true,
    },
    videoUrl: {
        type: String,
    },
    publicId: {
        type: String,
    },
    isPreviewFree: {
        type: Boolean,
    },

}, { timestamps: true });

export const Lecture = mongoose.model("Lecture", lectureSchema)
