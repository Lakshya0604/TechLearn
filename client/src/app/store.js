import { configureStore } from "@reduxjs/toolkit";
import rootReducer from "./rootReducer";
import { authApi } from "../features/api/authApi";
import { userLoggedIn, userLoggedout } from "../features/authSlice";
import { courseApi } from "@/features/api/courseApi";
import { purchaseApi } from "@/features/api/purchaseApi";
import { courseProgressApi } from "@/features/api/courseProgressApi";

export const store = configureStore({
    reducer: rootReducer,
    middleware: (DefaultMiddleware) => DefaultMiddleware().concat(authApi.middleware, courseApi.middleware, purchaseApi.middleware, courseProgressApi.middleware),
});

// Restore only a server-verified session. A stale local cache must not unlock UI routes.
store.dispatch(authApi.endpoints.loadUser.initiate({}, { forceRefetch: true })).then(result => {
    if (result.data?.user) store.dispatch(userLoggedIn({user: result.data.user}));
    else if (result.error?.status === 401 || result.error?.status === 403) store.dispatch(userLoggedout());
});
