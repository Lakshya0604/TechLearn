import mongoose from "mongoose";
import { Course } from "../models/course.model.js";

// Requires isAuthenticated to run first (sets req.id).
// Verifies the course in req.params.courseId exists and belongs to the caller.
const requireCourseOwner = async (req, res, next) => {
    try {
        const { courseId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(courseId)) {
            return res.status(400).json({ success: false, message: "Invalid courseId" });
        }
        const course = await Course.findById(courseId).select("creator");
        if (!course) {
            return res.status(404).json({ success: false, message: "Course not found" });
        }
        if (course.creator.toString() !== req.id) {
            return res.status(403).json({ success: false, message: "You do not own this course" });
        }
        next();
    } catch (error) {
        console.error("Error in requireCourseOwner:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

export default requireCourseOwner;
