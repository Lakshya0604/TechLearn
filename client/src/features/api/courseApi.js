import { fetchBaseQuery } from "@reduxjs/toolkit/query";
import { createApi } from "@reduxjs/toolkit/query/react";

const COURSE_API = "http://localhost:8080/api/v1/course";

export const courseApi = createApi({
    reducerPath: "courseApi",

    baseQuery: fetchBaseQuery({
        baseUrl: COURSE_API,
        credentials: "include",
    }),

    tagTypes: ["Refetch_Course", "Refetch_Lecture"],

    endpoints: (builder) => ({
        // CREATE COURSE
        createCourse: builder.mutation({
            query: ({ courseTitle, category }) => ({
                url: "/",
                method: "POST",
                body: { courseTitle, category },
            }),
            invalidatesTags: ["Refetch_Course"],
        }),
        //search courses
        getSearchCourse: builder.query({
            query: ({ searchQuery, categories, shortByPrice }) => {
                //build query string
                let queryString = `/search?query=${encodeURIComponent(searchQuery || '')}`
                //append category - send as comma-separated string
                if (categories && categories.length > 0) {
                    const categoriesString = categories.map(c => encodeURIComponent(c)).join(",");
                    queryString += `&categories=${categoriesString}`;
                }
                //Append sort by price (fixed typo: shortByPrice -> sortByPrice)
                if (shortByPrice) {
                    queryString += `&sortByPrice=${encodeURIComponent(shortByPrice)}`;
                }
                return {
                    url: queryString,
                    method: "GET"
                }
            }
        }),
        // GET PUBLISHED COURSES
        getPublishedCourses: builder.query({
            query: () => ({
                url: "/published-courses",
                method: "GET",
            }),
        }),


        // GET CREATOR COURSES
        getCreatorCourse: builder.query({
            query: () => ({
                url: "",
                method: "GET",
            }),
            providesTags: ["Refetch_Course"],
        }),
        editCourse: builder.mutation({
            query: ({ formData, courseId }) => ({
                url: `/${courseId}`,
                method: "PUT",
                body: formData
            }),
            invalidatesTags: ["Refetch_Course"],
        }),
        getCourseById: builder.query({
            query: (courseId) => ({

                url: `/${courseId}`,
                method: "GET"

            })
        }),
        deleteCourse: builder.mutation({
            query: (courseId) => ({
                url: `/${courseId}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Refetch_Course"],
        }),
        createLecture: builder.mutation({
            query: ({ lectureTitle, courseId }) => ({
                url: `/${courseId}/lecture`,
                method: "POST",
                body: { lectureTitle }
            })
        }),
        getCourseLecture: builder.query({
            query: (courseId) => ({
                url: `/${courseId}/lecture`,
                method: "GET",
            }),
            providesTags: ["Refetch_Lecture"],
        }),
        editLecture: builder.mutation({
            query: ({ lectureTitle, videoInfo, isPreviewFree, courseId, lectureId }) => ({
                url: `/${courseId}/lecture/${lectureId}`,
                method: 'PUT',
                body: { lectureTitle, videoInfo, isPreviewFree }

            })
        }),
        removeLecture: builder.mutation({
            query: (lectureId) => ({
                url: `/lecture/${lectureId}`,
                method: 'DELETE',

            }),
            invalidatesTags: ["Refetch_Lecture"],
        }),
        getLectureById: builder.query({
            query: (lectureId) => ({
                url: `/lecture/${lectureId}`,
                method: 'GET',
            }),
        }),
        publishCourse: builder.mutation({
            query: ({ courseId, query }) => ({
                url: `/${courseId}?publish=${query}`,
                method: 'PATCH',
            }),
        }),
    }),
});

export const {
    useCreateCourseMutation,
    useGetSearchCourseQuery,
    useGetCreatorCourseQuery,
    useEditCourseMutation,
    useGetCourseByIdQuery,
    useCreateLectureMutation,
    useGetCourseLectureQuery,
    useEditLectureMutation,
    useRemoveLectureMutation,
    useGetLectureByIdQuery,
    usePublishCourseMutation,
    useGetPublishedCoursesQuery,
    useDeleteCourseMutation,
} = courseApi;
