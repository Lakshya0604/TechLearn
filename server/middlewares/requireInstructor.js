import { User } from "../models/user.model.js";

// Requires isAuthenticated to run first (sets req.id)
const requireInstructor = async (req, res, next) => {
    try {
        const user = await User.findById(req.id).select("role");
        if (!user || user.role !== "instructor") {
            return res.status(403).json({ success: false, message: "Instructor access required" });
        }
        next();
    } catch (error) {
        console.error("Error in requireInstructor:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

export default requireInstructor;
