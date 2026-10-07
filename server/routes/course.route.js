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
import {socialState,likeCourse,addComment,removeComment} from "../controllers/social.controller.js";
import rateLimit from "express-rate-limit";
import upload from "../utils/multer.js";

const router = express.Router();

const socialLimiter=rateLimit({windowMs:60000,max:20,standardHeaders:true,legacyHeaders:false});
router.get('/social/:courseId',socialState);
router.get('/social/:courseId/mine',isAuthenticated,socialState);
router.put('/social/:courseId/like',isAuthenticated,socialLimiter,likeCourse);
router.post('/social/:courseId/comments',isAuthenticated,socialLimiter,addComment);
router.delete('/comments/:commentId',isAuthenticated,removeComment);
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
