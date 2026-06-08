import { CourseProgress } from "../models/courseProgress.model.js";
import { Course } from "../models/course.model.js";
export const getCourseProgress = async (req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.id;

        //step 1: fetch course progress for the user and course
        let courseProgress = await CourseProgress.findOne({ courseId, userId }).populate("courseId").populate("lectureProgress.lectureId");
        const courseDetails = await Course.findById(courseId).populate("lectures");

        if (!courseDetails) {
            return res.status(404).json({ message: "Course not found" });
        }

        //step 2 if no progress found return course detaile with empty progress
        if (!courseProgress) {
            return res.status(200).json({
                data: {
                    courseDetails,
                    progress: [],
                    completed: false
                },
            })

        }

        //step 3: if progress found return course details with progress
        return res.status(200).json({
            data: {
                courseDetails,
                progress: courseProgress.lectureProgress,
                completed: courseProgress.completed
            },
        })

    } catch (error) {
        console.log("Error fetching course progress:", error);
        return res.status(500).json({ message: "Failed to fetch course progress" });
    }
};

export const updateLectureProgress = async (req, res) => {
    try {
        const { courseId, lectureId } = req.params;
        const userId = req.id;

        //step 1: fetch course progress and create progress
        let courseProgress = await CourseProgress.findOne({ courseId, userId });
        if (!courseProgress) {
            //if no progress found create new progress
            courseProgress = new CourseProgress({
                userId,
                courseId,
                completed: false,
                lectureProgress: []
            });
        }

        //find the lecture progress in the course progress
        const lectureIndex = courseProgress.lectureProgress.findIndex((lecture) =>
            lecture.lectureId.toString() === lectureId
        );

        if (lectureIndex !== -1) {
            //if lecture progress found update the viewed status to true
            courseProgress.lectureProgress[lectureIndex].viewed = true;
        } else {
            //if no lecture progress found create new lecture progress with viewed status true
            courseProgress.lectureProgress.push({
                lectureId,
                viewed: true
            });
        }

        //if all lecture viewed then mark the course progress as completed
        const lectureProgressLength = courseProgress.lectureProgress.filter((lectureProg) => lectureProg.viewed).length;

        const course = await Course.findById(courseId).populate("lectures");
        if (course && lectureProgressLength === course.lectures.length) {
            courseProgress.completed = true;
        }
        await courseProgress.save();

        return res.status(200).json({
            message: "Lecture progress updated successfully",
        });

    } catch (error) {
        console.log("Error updating course progress:", error);
        return res.status(500).json({ message: "Failed to update course progress" });
    }

};

export const markAsCompleted = async (req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.id;

        const courseProgress = await CourseProgress.findOne({ courseId, userId });
        if (!courseProgress) {
            return res.status(404).json({ message: "Course progress not found" });
        }
        courseProgress.lectureProgress.forEach((lectureProgress) => {
            lectureProgress.viewed = true;
        });
        courseProgress.completed = true;
        await courseProgress.save();
        return res.status(200).json({
            message: "Course marked as completed successfully",
        });

    } catch (error) {
        console.log("Error marking course as completed:", error);
        return res.status(500).json({ message: "Failed to mark course as completed" });
    }
}

export const markAsInCompleted = async (req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.id;

        const courseProgress = await CourseProgress.findOne({ courseId, userId });
        if (!courseProgress) {
            return res.status(404).json({ message: "Course progress not found" });
        }
        courseProgress.lectureProgress.forEach((lectureProgress) => {
            lectureProgress.viewed = false;
        });
        courseProgress.completed = false;
        await courseProgress.save();
        return res.status(200).json({
            message: "Course marked as incompleted successfully",
        });

    } catch (error) {
        console.log("Error marking course as incompleted:", error);
        return res.status(500).json({ message: "Failed to mark course as incompleted" });
    }
}