import { useSelector } from "react-redux"
import { Navigate } from "react-router-dom";

export const ProtectedRoute = ({ children }) => {
    const { isAuthenticated } = useSelector(store => store.auth);
    if (!isAuthenticated) {
        return <Navigate to='/login' />
    }
    return children;

}

export const AuthenticatedUser = ({ children }) => {
    const { isAuthenticated } = useSelector(store => store.auth);
    if (isAuthenticated) {
        return <Navigate to='/' />
    }
    return children;
}

export const AdminRoute = ({ children }) => {
    const { user, isAuthenticated } = useSelector(store => store.auth);

    // If not authenticated, redirect to login
    if (!isAuthenticated) {
        return <Navigate to='/login' />
    }

    // If user is not an instructor, redirect to home
    if (!user || user.role !== "instructor") {
        return <Navigate to="/" />
    }

    return children;
}
