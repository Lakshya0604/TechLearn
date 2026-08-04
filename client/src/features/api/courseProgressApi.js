import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_BASE_URL } from "../../config/apiConfig";

const COURSE_PROGRESS_API = `${API_BASE_URL}/api/v1`;

export const courseProgressApi = createApi({
    reducerPath: "courseProgressApi",
    baseQuery: fetchBaseQuery({
        baseUrl: COURSE_PROGRESS_API,
        credentials: "include",
    }),
    endpoints: (builder) => ({
        getCourseProgress: builder.query({
            query: (courseId) => ({
                url: `/course-progress/${courseId}`,
                method: "GET",
            }),
        }),
        updateLectureProgress: builder.mutation({
            query: ({ courseId, lectureId }) => ({
                url: `/course-progress/${courseId}/lecture/${lectureId}/view`,
                method: "POST",
            }),
        }),
        completeCourse: builder.mutation({
            query: (courseId) => ({
                url: `/course-progress/${courseId}/complete`,
                method: "POST",
            }),
        }),
        incompleteCourse: builder.mutation({
            query: (courseId) => ({
                url: `/course-progress/${courseId}/incomplete`,
                method: "POST",
            }),
        }),
    }),
});

export const {
    useGetCourseProgressQuery,
    useUpdateLectureProgressMutation,
    useCompleteCourseMutation,
    useIncompleteCourseMutation,
} = courseProgressApi;

