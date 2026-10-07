import mongoose from "mongoose";
import { Course } from "../models/course.model.js";
import { Lecture } from "../models/lecture.model.js";
import {
    deleteMediaFromCloudinary,
    deleteVideoFromCloudinary,
    uploadToCloudinary,
} from "../utils/cloudinary.js";
import sanitizeHtml from "sanitize-html";

// Course descriptions are rendered as HTML in the client, so strip
// anything beyond basic formatting before storing them.
const sanitizeDescription = (html) =>
    sanitizeHtml(html, {
        allowedTags: [
            "h1", "h2", "h3", "h4", "h5", "h6", "p", "a", "ul", "ol", "li",
            "b", "strong", "i", "em", "u", "s", "blockquote", "code", "pre", "br", "span",
        ],
        allowedAttributes: { a: ["href", "target", "rel"] },
        allowedSchemes: ["http", "https", "mailto"],
    });


// ============================
// CREATE COURSE
// ============================
export const createCourse = async (req, res) => {
    try {
        const { courseTitle, category } = req.body;

        if (!courseTitle || !category) {
            return res.status(400).json({
                message: "courseTitle and category are required",
            });
        }

        const course = await Course.create({
            courseTitle,
            category,
            creator: req.id,
        });

        return res.status(201).json({
            course,
            message: "Course created successfully",
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Failed to create course",
        });
    }
};


// ============================
// GET ALL COURSES
// ============================

export const searchCourse = async (req, res) => {
    try {
        const { query = "", categories = "", sortByPrice = "" } = req.query;

        // Parse categories - handle both array and comma-separated string
        const categoriesArray = categories ? (Array.isArray(categories) ? categories : categories.split(',').filter(c => c.trim())) : [];

        //create search query
        const searchCriteria = {
            isPublished: true,
            $or: [
                { courseTitle: { $regex: query, $options: "i" } },
                { subTitle: { $regex: query, $options: "i" } },
                { category: { $regex: query, $options: "i" } },
            ]
        };

        //if category is selected - add as separate condition (not overriding $or)
        if (categoriesArray.length > 0) {
            searchCriteria.$and = searchCriteria.$and || [];
            searchCriteria.$and.push({ category: { $in: categoriesArray } });
        }
        //define sorting
        const sortOptions = {};
        if (sortByPrice === "low") {
            sortOptions.coursePrice = 1; //sort by price in ascending order
        } else if (sortByPrice === "high") {
            sortOptions.coursePrice = -1; //sort by price in descending order
        }

        let courses = await Course.find(searchCriteria).populate({ path: "creator", select: "name photoUrl" }).sort(sortOptions);

        return res.status(200).json({
            success: true,
            courses: courses || []
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Failed to search course",
        });
    }
}



export const getPublishedCourses = async (req, res) => {
    try {
        const courses = await Course.find({ isPublished: true }).populate({ path: "creator", select: "name photoUrl" });
        if (!courses) {
            return res.status(404).json({
                message: "No courses found",
            });
        }
        return res.status(200).json({
            courses,
        });


    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Failed to fetch courses",
        });
    }

}
export const getCreatorCourses = async (req, res) => {
    try {
        const userId = req.id;

        const courses = await Course.find({ creator: userId }).populate("creator", "name photoUrl");

        return res.status(200).json({
            courses,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Failed to fetch courses",
        });
    }
};


// ============================
// EDIT COURSE
// ============================
export const editCourse = async (req, res) => {
    try {
        const { courseId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(courseId)) {
            return res.status(400).json({ message: "Invalid courseId" });
        }

        const {
            courseTitle,
            subTitle,
            description,
            category,
            courseLevel,
            coursePrice,
        } = req.body;

        const thumbnail = req.file;

        let course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({
                message: "Course not found",
            });
        }

        let courseThumbnail;

        if (thumbnail) {
            // delete old thumbnail
            if (course.courseThumbnail) {
                const publicId = course.courseThumbnail
                    .split("/")
                    .pop()
                    .split(".")[0];
                await deleteMediaFromCloudinary(publicId);
            }

            // upload new thumbnail
            const uploaded = await uploadToCloudinary(thumbnail.path);
            courseThumbnail = uploaded.secure_url;
        }

        const updateData = {
            ...(courseTitle && { courseTitle }),
            ...(subTitle && { subTitle }),
            ...(description && { description: sanitizeDescription(description) }),
            ...(category && { category }),
            ...(courseLevel && { courseLevel }),
            ...(coursePrice && { coursePrice }),
            ...(courseThumbnail && { courseThumbnail }),
        };

        course = await Course.findByIdAndUpdate(courseId, updateData, {
            new: true,
        });

        return res.status(200).json({
            course,
            message: "Course updated successfully",
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Failed to update course",
        });
    }
};


// ============================
// DELETE COURSE
// ============================
export const deleteCourse = async (req, res) => {
    try {
        const { courseId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(courseId)) {
            return res.status(400).json({ message: "Invalid courseId" });
        }
        const course = await Course.findByIdAndDelete(courseId);
        if (!course) {
            return res.status(404).json({
                message: "Course not found",
            });
        }

        return res.status(200).json({
            message: "Course deleted successfully",
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Failed to delete course",
        });
    }
};

// ============================
// GET COURSE BY ID
// ============================
export const getCourseById = async (req, res) => {
    try {
        const { courseId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(courseId)) {
            return res.status(400).json({ message: "Invalid courseId" });
        }

        const course = await Course.findById(courseId).populate("creator", "name photoUrl");

        if (!course) {
            return res.status(404).json({
                message: "Course not found",
            });
        }

        return res.status(200).json({
            course,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Failed to fetch course",
        });
    }
};


// ============================
// CREATE LECTURE
// ============================
export const createLecture = async (req, res) => {
    try {
        const { lectureTitle } = req.body;
        const { courseId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(courseId)) {
            return res.status(400).json({ message: "Invalid courseId" });
        }

        if (!lectureTitle) {
            return res.status(400).json({
                message: "Lecture title is required",
            });
        }

        const lecture = await Lecture.create({ lectureTitle });

        const course = await Course.findById(courseId).populate("creator", "name photoUrl");
        if (!course) {
            return res.status(404).json({
                message: "Course not found",
            });
        }

        course.lectures.push(lecture._id);
        await course.save({ validateBeforeSave: false });

        return res.status(201).json({
            lecture,
            message: "Lecture created successfully",
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Failed to create lecture",
        });
    }
};


// ============================
// GET COURSE LECTURES
// ============================
export const getCourseLecture = async (req, res) => {
    try {
        const { courseId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(courseId)) {
            return res.status(400).json({ message: "Invalid courseId" });
        }

        const course = await Course.findById(courseId).populate("lectures");

        if (!course) {
            return res.status(404).json({
                message: "Course not found",
            });
        }

        return res.status(200).json({
            lectures: course.lectures,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Failed to fetch lectures",
        });
    }
};


// ============================
// EDIT LECTURE
// ============================
export const editLecture = async (req, res) => {
    try {
        const { lectureTitle, videoInfo, isPreviewFree } = req.body;
        const { courseId, lectureId } = req.params;

        if (
            !mongoose.Types.ObjectId.isValid(courseId) ||
            !mongoose.Types.ObjectId.isValid(lectureId)
        ) {
            return res.status(400).json({ message: "Invalid IDs" });
        }

        const lecture = await Lecture.findById(lectureId);
        if (!lecture) {
            return res.status(404).json({
                message: "Lecture not found",
            });
        }

        if (lectureTitle) lecture.lectureTitle = lectureTitle;
        if (videoInfo?.videoUrl) lecture.videoUrl = videoInfo.videoUrl;
        if (videoInfo?.publicId) lecture.publicId = videoInfo.publicId;
        if (typeof isPreviewFree === "boolean")
            lecture.isPreviewFree = isPreviewFree;

        await lecture.save();

        const course = await Course.findById(courseId).populate("creator", "name photoUrl");
        if (course && !course.lectures.includes(lecture._id)) {
            course.lectures.push(lecture._id);
            await course.save();
        }

        return res.status(200).json({
            lecture,
            message: "Lecture updated successfully",
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Failed to update lecture",
        });
    }
};


// ============================
// REMOVE LECTURE
// ============================
export const removeLecture = async (req, res) => {
    try {
        const { lectureId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(lectureId)) {
            return res.status(400).json({ message: "Invalid lectureId" });
        }

        const lecture = await Lecture.findByIdAndDelete(lectureId);
        if (!lecture) {
            return res.status(404).json({
                message: "Lecture not found",
            });
        }

        // delete video from cloudinary
        if (lecture.publicId) {
            await deleteVideoFromCloudinary(lecture.publicId);
        }

        // remove lecture from course
        await Course.updateOne(
            { lectures: lectureId },
            { $pull: { lectures: lectureId } }
        );

        return res.status(200).json({
            message: "Lecture removed successfully",
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Failed to remove lecture",
        });
    }
};


// ============================
// GET LECTURE BY ID
// ============================
export const getlectureById = async (req, res) => {
    try {
        const { lectureId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(lectureId)) {
            return res.status(400).json({ message: "Invalid lectureId" });
        }

        const lecture = await Lecture.findById(lectureId);

        if (!lecture) {
            return res.status(404).json({
                message: "Lecture not found",
            });
        }

        return res.status(200).json({
            lecture,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Failed to fetch lecture",
        });
    }
};

// ============================
// publish unpublish course CONTROLLER
// ============================

export const togglePublishCourse = async (req, res) => {
    try {
        const { courseId } = req.params;
        const { publish } = req.query;

        if (!mongoose.Types.ObjectId.isValid(courseId)) {
            return res.status(400).json({ message: "Invalid courseId" });
        }

        const course = await Course.findByIdAndUpdate(
            courseId,
            { isPublished: publish === "true" },
            { returnDocument: "after" }
        );

        if (!course) {
            return res.status(404).json({
                message: "Course not found",
            });
        }

        return res.status(200).json({
            success: true,
            course,
            message: `Course ${course.isPublished ? "published" : "unpublished"} successfully`,
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Failed to publish course",
        });
    }
};
