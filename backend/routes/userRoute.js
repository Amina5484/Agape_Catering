import express from 'express';
import { loginUser, registerUser, updateProfile, getProfile, requestOtp, verifyOtp, resetPassword } from '../controllers/userController.js';
import { protect } from '../config/authMiddleware.js';

const userRouter = express.Router();

userRouter.post('/login', loginUser); // ✅ Login Route
userRouter.post('/register', registerUser); // ✅ Register Route
userRouter.get('/profile', protect, getProfile); // ✅ Get Profile
userRouter.put('/profile', protect, updateProfile); // ✅ Update Profile

// Forgot password routes
userRouter.post('/forgot-password', requestOtp); // Request OTP
userRouter.post('/verify-otp', verifyOtp); // Verify OTP
userRouter.post('/reset-password', resetPassword); // Reset password


export default userRouter;
