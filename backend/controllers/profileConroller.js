import User from '../models/userModel.js';
import path from 'path';
import fs from 'fs';

const updateProfile = async (req, res) => {
  const { userId } = req.params;
  const { name, email, phone, gender, role } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Update text fields if provided
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (gender) user.gender = gender;
    if (role) user.role = role;

    // Handle profile photo upload if file is present
    if (req.file) {
      // Delete old photo if it exists
      if (user.photo) {
        const oldPhotoPath = path.join('uploads', user.photo);
        if (fs.existsSync(oldPhotoPath)) {
          fs.unlinkSync(oldPhotoPath);
        }
      }

      user.photo = req.file.path.replace(/\\/g, '/'); // Normalize slashes for cross-platform
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        gender: user.gender,
        role: user.role,
        photo: user.photo,
      },
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating profile',
    });
  }
};

export { updateProfile };
