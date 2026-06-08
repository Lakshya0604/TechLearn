import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
const COURSE_PURCHASE_API = "http://localhost:8080/api/v1/purchase";

export const purchaseApi = createApi({
    reducerPath: "purchaseApi",    // Unique key for the API slice in the Redux store
    baseQuery: fetchBaseQuery({
        baseUrl: COURSE_PURCHASE_API,
        credentials: "include"  // Include cookies for authentication
    }), // Base URL for the API
    tagTypes: ["CourseDetail"], // Define tag types for cache invalidation
    endpoints: (builder) => ({
        createCheckoutSession: builder.mutation({         // builder.mutation is used for POST/PUT/DELETE requests
            query: (courseId) => ({
                url: "/checkout/create-checkout-session",
                method: "POST",
                body: { courseId }  // Send as object with courseId property
            }),
            invalidatesTags: (result, error, courseId) => [{ type: "CourseDetail", id: courseId }]
        }),
        getCourseDetailWithStatus: builder.query({
            query: (courseId) => (
                {
                    url: `/course/${courseId}/detail-with-status`,
                    method: "GET",
                }),
            providesTags: (result, error, courseId) => [{ type: "CourseDetail", id: courseId }],
            // Ensure fresh data is fetched each time by not using stale cache
            keepUnusedDataFor: 0
        }),
        getPurchasedCourses: builder.query({
            query: () => ({
                url: "/",
                method: "GET",
            })
        }),
        verifyPayment: builder.mutation({
            query: ({ sessionId }) => ({
                url: "/verify-payment",
                method: "POST",
                body: { sessionId }
            }),
            invalidatesTags: (result, error, { courseId }) => [{ type: "CourseDetail", id: courseId }]
        })
    })
});

export const { useCreateCheckoutSessionMutation, useGetPurchasedCoursesQuery, useGetCourseDetailWithStatusQuery, useVerifyPaymentMutation } = purchaseApi;
