import {consumeInstructorInvite} from './invite.controller.js';
import { User } from '../models/user.model.js';
import { Course } from '../models/course.model.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { generateToken } from '../utils/generateToken.js';
import { uploadToCloudinary, deleteMediaFromCloudinary } from '../utils/cloudinary.js';

// User registration controller
export const register = async (req, res) => {
    try {
        let { name, email, password, role, inviteCode } = req.body;

        email = email?.toLowerCase().trim();
        password = password?.trim();
        role = role?.replace(/"/g, "").trim();
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Role is whitelisted: nobody can register as anything but student/instructor,
        // and instructor signup requires the invite code when one is configured.
        if (role === "instructor") {
            const configuredCode = process.env.INSTRUCTOR_INVITE_CODE;
            if (process.env.INSTRUCTOR_EMAIL_ENABLED === 'true' ? !(await consumeInstructorInvite(email, inviteCode)) : (configuredCode && inviteCode !== configuredCode)) {
                return res.status(403).json({ success: false, message: "A valid instructor invite code is required" });
            }
        } else {
            role = "student";
        }

        // Check if user already exists
        const user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ success: false, message: "User already exists" });
        }

        // Create new user
        const hashedPassword = await bcrypt.hash(password, 10);// Hash the password before saving
        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            role
        });

        // Generate token for the new user
        const token = jwt.sign({ userId: newUser._id }, process.env.SECRET_KEY, { expiresIn: '1d' });

        const safeUser = {
            _id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
            photoUrl: newUser.photoUrl
        };

        // Set token in HTTP-only cookie and return user data
        return res.status(201)
            .cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 24 * 60 * 60 * 1000
            })
            .json({
                success: true,
                message: "User registered successfully",
                user: safeUser
            });

    } catch (error) {
        console.error('Error in user registration:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}

export const login = async (req, res) => {
    try {
        let { email, password } = req.body;

        email = email.toLowerCase().trim();
        password = password.trim();

        if (!email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const user = await User.findOne({ email });
        if (!user || user.isDemo) {
            return res.status(400).json({ success: false, message: "Invalid email or password" });
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(400).json({ success: false, message: "Invalid email or password" });
        }

        return generateToken(res, user, `welcome back ${user.name}`);
    } catch (error) {
        console.error('Error in user login:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}
export const logout = async (_, res) => {
    try {
        return res.status(200).cookie('token', '', { maxAge: 0 }).json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
        console.error('Error in user logout:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}

export const getUserProfile = async (req, res) => {
    try {
        const userId = req.id;

        const user = await User.findById(userId).select('-password').populate({
            path: "enrolledCourses",
            populate: {
                path: "creator",
                select: "name photoUrl"
            }
        });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // ✅ Fetch created courses only if instructor
        let createdCourses = [];
        if (user.role === "instructor") {
            createdCourses = await Course.find({ creator: userId }).populate("creator", "name photoUrl");
        }

        res.status(200).json({
            success: true,
            user: {
                ...user._doc,
                createdCourses, // [] for students, full array for instructors
            }
        });

    } catch (error) {
        console.error('Error in getting user profile:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}

export const updateUserProfile = async (req, res) => {
    try {

        const userId = req.id;
        const { name } = req.body;
        const profilePhoto = req.file;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        let photoUrl = user.photoUrl;

        // if new photo uploaded
        if (profilePhoto) {

            // delete old photo
            if (user.photoUrl) {
                const publicId = user.photoUrl.split('/').pop().split('.')[0];
                await deleteMediaFromCloudinary(publicId);
            }

            // upload new photo
            const cloudResponse = await uploadToCloudinary(profilePhoto.path);
            photoUrl = cloudResponse.secure_url;
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { name, photoUrl },
            { new: true }
        ).select("-password");

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user: updatedUser
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};
