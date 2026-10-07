import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import requireInstructor from "../middlewares/requireInstructor.js";
import requireCourseOwner from "../middlewares/requireCourseOwner.js";
import requireLectureOwner from "../middlewares/requireLectureOwner.js";
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

// Static routes FIRST (before any dynamic /:param routes)
router.route("/").post(isAuthenticated, requireInstructor, createCourse);
router.route("/").get(isAuthenticated, getCreatorCourses);
router.route("/search").get(searchCourse);
router.route("/published-courses").get(getPublishedCourses);
router.route("/:courseId").delete(isAuthenticated, requireCourseOwner, deleteCourse);

// Static-prefixed lecture route BEFORE /:courseId
router.route("/lecture/:lectureId")
    .get(isAuthenticated, requireLectureOwner, getlectureById)
    .delete(isAuthenticated, requireLectureOwner, removeLecture);

// Dynamic :courseId routes AFTER all static routes
router.route("/:courseId")
    .get(isAuthenticated, getCourseById)
    .put(isAuthenticated, requireCourseOwner, upload.single("courseThumbnail"), editCourse)
    .patch(isAuthenticated, requireCourseOwner, togglePublishCourse);

router.route("/:courseId/lecture")
    .post(isAuthenticated, requireCourseOwner, createLecture)
    .get(isAuthenticated, requireCourseOwner, getCourseLecture);

router.route("/:courseId/lecture/:lectureId")
    .put(isAuthenticated, requireCourseOwner, editLecture);

export default router;
