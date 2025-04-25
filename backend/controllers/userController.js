import userModel from '../models/userModel.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import validator from 'validator';
import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import { sendOtpEmail } from '../utils/emailHelper.js'; // Send OTP email

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/profiles');
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
  },
});

// Create JWT Token
const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

// Get User Profile
const getProfile = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id).select('-password');
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, user });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Update User Profile
const updateProfile = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      gender,
      currentPassword,
      newPassword,
    } = req.body;

    const user = await userModel.findById(req.user.id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    }

    // Check if email is being changed and if it's already in use
    if (email !== user.email) {
      const emailExists = await userModel.findOne({ email });
      if (emailExists) {
        return res
          .status(400)
          .json({ success: false, message: 'Email is already in use' });
      }
    }

    // Check if phone is being changed and if it's already in use
    if (phone !== user.phone) {
      const phoneExists = await userModel.findOne({ phone });
      if (phoneExists) {
        return res
          .status(400)
          .json({ success: false, message: 'Phone number is already in use' });
      }
    }

    // Update basic info
    user.name = `${firstName} ${lastName}`;
    user.email = email;
    user.phone = phone;
    user.gender = gender;

    // Handle password change if requested
    if (newPassword) {
      if (!currentPassword) {
        return res
          .status(400)
          .json({ success: false, message: 'Current password is required' });
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res
          .status(400)
          .json({ success: false, message: 'Current password is incorrect' });
      }

      user.password = await bcrypt.hash(newPassword, 10);
    }

    // Handle profile photo upload
    if (req.file) {
      user.photo = `/profiles/${req.file.filename}`;
    }

    await user.save();

    // Return updated user without password
    const updatedUser = await userModel.findById(user._id).select('-password');
    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email or phone number is already in use',
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// Login User
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    console.log('Login attempt for email:', email);
    const user = await userModel.findOne({ email });
    if (!user) {
      console.log('User not found:', email);
      return res
        .status(404)
        .json({ success: false, message: "User doesn't exist" });
    }

    console.log('Found user, comparing passwords');
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match result:', isMatch);

    if (!isMatch) {
      console.log('Password mismatch for user:', email);
      return res
        .status(400)
        .json({ success: false, message: 'Invalid credentials' });
    }

    const token = createToken(user._id);
    console.log('Login successful for user:', email);
    res.json({
      success: true,
      token,
      user: { id: user._id, name: user.name, role: user.role },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Register User
const registerUser = async (req, res) => {
  const { name, password, email, phone, gender } = req.body;
  try {
    const exists = await userModel.findOne({ email });
    if (exists) {
      return res
        .status(400)
        .json({ success: false, message: 'User already exists' });
    }

    if (!validator.isEmail(email)) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid email format' });
    }

    if (password.length < 4) {
      return res
        .status(400)
        .json({ success: false, message: 'Please use strong password' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new userModel({ name, email, password: hashedPassword, phone, gender });

    const user = await newUser.save();
    const token = createToken(user._id);
    res.json({ success: true, token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: 'Error registering user' });
  }
};

// Request OTP for password reset
const requestOtp = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Generate OTP and set expiration time
    const otp = crypto.randomInt(100000, 999999);
    user.otp = otp;
    user.otpExpiration = Date.now() + 10 * 60 * 1000; // OTP expires in 10 minutes
    await user.save();

    // Send OTP to the user's email
    try {
      await sendOtpEmail(user.email, otp);
      res.status(200).json({ success: true, message: 'OTP sent to your email' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error sending OTP' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Verify the OTP
const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.otp !== parseInt(otp) || Date.now() > user.otpExpiration) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    // Generate token for resetting the password
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' }); // token expires in 15 minutes
    res.status(200).json({ success: true, message: 'OTP verified successfully', token });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Reset the password
const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    console.log('Password reset attempt');
    // Validate password
    if (!newPassword || newPassword.length < 8) {
      console.log('Invalid password length');
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long'
      });
    }

    // Verify JWT token for password reset
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token verified, user ID:', decoded.id);

    const user = await userModel.findById(decoded.id);
    if (!user) {
      console.log('User not found for ID:', decoded.id);
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    console.log('Found user, updating password');
    // Set the new password (will be hashed by the pre-save middleware)
    user.password = newPassword;
    user.otp = undefined; // Clear OTP after reset
    user.otpExpiration = undefined; // Clear OTP expiration

    await user.save();
    console.log('Password reset successful for user:', user.email);

    res.status(200).json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    console.error('Password reset error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
  const loginUser = async (req, res) => {
    const { email, password, twoFactor } = req.body;

    try {
      const user = await userModel.findOne({ email });
      if (!user)
        return res.status(404).json({ success: false, message: 'User not found' });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch)
        return res.status(400).json({ success: false, message: 'Invalid credentials' });

      if (twoFactor) {
        // If 2FA is requested
        const otp = crypto.randomInt(100000, 999999);
        user.otp = otp;
        user.otpExpiration = Date.now() + 10 * 60 * 1000;
        user.is2FAVerified = false;
        await user.save();

        await sendOtpEmail(user.email, otp);

        return res.status(200).json({
          success: true,
          message: 'OTP sent to email. Please verify to complete login.',
        });
      } else {
        // Regular login
        const token = createToken(user._id);
        return res.status(200).json({
          success: true,
          token,
          user: { id: user._id, name: user.name, role: user.role },
        });
      }
    } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
};
export {
  loginUser,
  registerUser,
  getProfile,
  updateProfile,
  requestOtp,
  verifyOtp,
  resetPassword,
  verify2FA,
};
