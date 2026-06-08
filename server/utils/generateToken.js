import jwt from 'jsonwebtoken';

export const generateToken = (res, user, message) => {
    const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, { expiresIn: '1d' });// Generate JWT token with user ID and secret key, set to expire in 1 days

    const safeUser = {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        photoUrl: user.photoUrl
    };

    // Set token in HTTP-only cookie
    return res.status(200).cookie('token', token, {    // cookie name is token and value is token generated above 
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
        sameSite: 'strict', // Prevent CSRF attacks
        maxAge: 24 * 60 * 60 * 1000 // Cookie expires in 24 hours (1 day)
    }).json({ success: true, message, user: safeUser }); // Send response with success message and user data
};
