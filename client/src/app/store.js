import { configureStore } from "@reduxjs/toolkit";
import rootReducer from "./rootReducer";
import { authApi } from "../features/api/authApi";
import { userLoggedIn, restoreAuthState } from "../features/authSlice";
import { courseApi } from "@/features/api/courseApi";
import { purchaseApi } from "@/features/api/purchaseApi";
import { courseProgressApi } from "@/features/api/courseProgressApi";

export const store = configureStore({
    reducer: rootReducer,
    middleware: (DefaultMiddleware) => DefaultMiddleware().concat(authApi.middleware, courseApi.middleware, purchaseApi.middleware, courseProgressApi.middleware),
});

const initializeApp = async () => {
    try {
        // Check if there's an existing session by calling the loadUser endpoint
        const result = await store.dispatch(authApi.endpoints.loadUser.initiate({}, { forceRefetch: true }));

        // If the user data is successfully loaded, update the Redux state
        if (result.data && result.data.user) {
            store.dispatch(userLoggedIn({ user: result.data.user }));
        } else {
            // Fallback: check localStorage for persisted auth state
            const persistedAuth = localStorage.getItem('authState');
            if (persistedAuth) {
                try {
                    const authState = JSON.parse(persistedAuth);
                    if (authState.isAuthenticated && authState.user) {
                        store.dispatch(restoreAuthState(authState));
                    }
                } catch (parseError) {
                    console.log('Error parsing persisted auth state:', parseError);
                }
            }
        }
    } catch (error) {
        console.log('No existing session found:', error);

        // Fallback: check localStorage for persisted auth state
        const persistedAuth = localStorage.getItem('authState');
        if (persistedAuth) {
            try {
                const authState = JSON.parse(persistedAuth);
                if (authState.isAuthenticated && authState.user) {
                    store.dispatch(restoreAuthState(authState));
                }
            } catch (parseError) {
                console.log('Error parsing persisted auth state:', parseError);
            }
        }
    }
};

// Initialize the app when the store is created
initializeApp();
