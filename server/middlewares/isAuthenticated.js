import jwt from "jsonwebtoken";

const isAuthenticated = (req, res, next) => {
    try {
        const token = req.cookies.token; // Get token from cookies
        if (!token) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        // Verify token
        const decoded = jwt.verify(token, process.env.SECRET_KEY); // Verify token using secret key
        if (!decoded) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        req.id = decoded.userId; // Attach decoded user data to request object for further use in controllers
        next(); // Proceed to next middleware or route handler
    }
    catch (error) {
        console.error('Error in authentication:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}
export default isAuthenticated;