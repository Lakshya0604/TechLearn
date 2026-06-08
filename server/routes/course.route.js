import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import {
    createCourse,
    createLecture,
    editCourse,
    deleteCourse,
    editLecture,
    getCourseById,
    getCourseLecture,
    getCreatorCourses,
    getlectureById,
    getPublishedCourses,
    removeLecture,
    searchCourse,
    togglePublishCourse,
} from "../controllers/course.controller.js";
import upload from "../utils/multer.js";

const router = express.Router();

// ✅ 1. Static routes FIRST (before any dynamic /:param routes)
router.route("/").post(isAuthenticated, createCourse);
router.route("/").get(isAuthenticated, getCreatorCourses);
router.route("/search").get(isAuthenticated, searchCourse);
router.route("/published-courses").get(getPublishedCourses);
router.route("/:courseId").delete(isAuthenticated, deleteCourse);

// ✅ 2. Static-prefixed lecture route BEFORE /:courseId
//    Without this, Express matches "lecture" as a :courseId value
router.route("/lecture/:lectureId")
    .get(isAuthenticated, getlectureById)
    .delete(isAuthenticated, removeLecture);

// ✅ 3. Dynamic :courseId routes AFTER all static routes
router.route("/:courseId")
    .get(isAuthenticated, getCourseById)
    .put(isAuthenticated, upload.single("courseThumbnail"), editCourse)
    .patch(isAuthenticated, togglePublishCourse);   // ✅ Chained, not separate

router.route("/:courseId/lecture")
    .post(isAuthenticated, createLecture)
    .get(isAuthenticated, getCourseLecture);        // ✅ Chained, not separate

router.route("/:courseId/lecture/:lectureId")
    .put(isAuthenticated, editLecture);

export default router;