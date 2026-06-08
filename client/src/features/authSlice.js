import { createSlice } from "@reduxjs/toolkit";


// Initial state for the authentication slice
const initialState = {
    user: null,
    isAuthenticated: false,
};
const authSlice = createSlice({
    name: 'authSlice',
    initialState,
    reducers: {
        userLoggedIn: (state, action) => {
            state.user = action.payload.user;
            state.isAuthenticated = true;

            // Persist to localStorage
            localStorage.setItem('authState', JSON.stringify({
                user: action.payload.user,
                isAuthenticated: true
            }));
        },
        userLoggedout: (state) => {
            state.user = null;
            state.isAuthenticated = false;

            // Clear from localStorage
            localStorage.removeItem('authState');
        },
        restoreAuthState: (state, action) => {
            state.user = action.payload.user;
            state.isAuthenticated = action.payload.isAuthenticated;
        },
        updateUser: (state, action) => {
            state.user = { ...state.user, ...action.payload };

            // Update localStorage as well
            localStorage.setItem('authState', JSON.stringify({
                user: state.user,
                isAuthenticated: state.isAuthenticated
            }));
        }
    }
});

export const { userLoggedIn, userLoggedout, restoreAuthState, updateUser } = authSlice.actions;
export default authSlice.reducer;
