import userModel from '../models/userModel.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import validator from 'validator';
import multer from 'multer';
import path from 'path';

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
    console.log('Update profile request body:', req.body);
    console.log('Update profile request file:', req.file);

    const {
      firstName,
      lastName,
      email,
      phone,
      gender,
      currentPassword,
      newPassword,
    } = req.body;

    // Find user and exclude password from the query
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
    const user = await userModel.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User doesn't exist" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid credentials' });
    }

    const token = createToken(user._id);
    res.json({
      success: true,
      token,
      user: { id: user._id, name: user.name, role: user.role },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Register User
const registerUser = async (req, res) => {
  const { name, password, email } = req.body;
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
    const newUser = new userModel({ name, email, password: hashedPassword });

    const user = await newUser.save();
    const token = createToken(user._id);
    res.json({ success: true, token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: 'Error registering user' });
  }
};

export { loginUser, registerUser, getProfile, updateProfile };
