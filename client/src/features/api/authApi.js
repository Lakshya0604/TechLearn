import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { userLoggedIn, userLoggedout } from "../authSlice";

const USER_API = 'http://localhost:8080/api/v1/user/';

export const authApi = createApi({
    reducerPath: 'authApi',
    baseQuery: fetchBaseQuery({
        baseUrl: USER_API,
        credentials: 'include'
    }),
    endpoints: (builder) => ({
        loginUser: builder.mutation({
            query: (inputData) => ({
                url: 'login',
                method: 'POST',
                body: inputData,
            }),
            async onQueryStarted(_, { dispatch, queryFulfilled }) {
                try {
                    const result = await queryFulfilled;
                    dispatch(userLoggedIn({ user: result.data.user }));
                } catch (err) {
                    console.log("Login error:", err);
                }
            },
        }),

        logoutUser: builder.mutation({
            query: () => ({
                url: "logout",
                method: "GET"
            }),
            async onQueryStarted(_, { dispatch, queryFulfilled }) {
                try {
                    await queryFulfilled;
                    dispatch(userLoggedout());
                } catch (err) {
                    console.log("Logout error:", err);
                }
            },
        }),

        registerUser: builder.mutation({
            query: (inputData) => ({
                url: 'register',
                method: 'POST',
                body: inputData,
            }),
        }),

        loadUser: builder.query({
            query: () => ({
                url: 'profile',
                method: 'GET',
            }),
        }),

        updateUser: builder.mutation({
            query: (formData) => ({
                url: 'profile/update',
                method: 'PUT',
                body: formData,
            }),
        }),
    }),
});

export const {
    useLoginUserMutation,
    useLogoutUserMutation,
    useRegisterUserMutation,
    useLoadUserQuery,
    useUpdateUserMutation,
} = authApi;