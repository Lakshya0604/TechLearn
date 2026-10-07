import mongoose from "mongoose";
import { Course } from "../models/course.model.js";

// Requires isAuthenticated to run first (sets req.id).
// For routes keyed by lectureId only: finds the course containing the lecture
// and verifies the caller owns that course.
const requireLectureOwner = async (req, res, next) => {
    try {
        const { lectureId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(lectureId)) {
            return res.status(400).json({ success: false, message: "Invalid lectureId" });
        }
        const course = await Course.findOne({ lectures: lectureId }).select("creator");
        if (!course) {
            return res.status(404).json({ success: false, message: "Lecture not found" });
        }
        if (course.creator.toString() !== req.id) {
            return res.status(403).json({ success: false, message: "You do not own this lecture" });
        }
        next();
    } catch (error) {
        console.error("Error in requireLectureOwner:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

export default requireLectureOwner;
