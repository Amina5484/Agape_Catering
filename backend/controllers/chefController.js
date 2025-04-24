import Stock from '../models/stock.js';
import Schedule from '../models/schedule.js';
import userModel from '../models/userModel.js';
import bcrypt from 'bcrypt';

// Profile Management
export const getProfile = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, email, phone, currentPassword, newPassword } = req.body;
    const user = await userModel.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if email is being changed and if it's already in use
    if (email !== user.email) {
      const emailExists = await userModel.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: 'Email is already in use' });
      }
    }

    // Check if phone is being changed and if it's already in use
    if (phone !== user.phone) {
      const phoneExists = await userModel.findOne({ phone });
      if (phoneExists) {
        return res
          .status(400)
          .json({ message: 'Phone number is already in use' });
      }
    }

    // Update basic info
    user.name = name;
    user.email = email;
    user.phone = phone;

    // Handle password change if requested
    if (newPassword) {
      if (!currentPassword) {
        return res
          .status(400)
          .json({ message: 'Current password is required' });
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res
          .status(400)
          .json({ message: 'Current password is incorrect' });
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
    res.status(200).json({
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: 'Email or phone number is already in use' });
    }
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// STOCK MANAGEMENT
export const updateStockItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    const stockItem = await Stock.findById(id);
    if (!stockItem) {
      return res.status(404).json({ message: 'Stock item not found' });
    }
    if (quantity > stockItem.quantity) {
      return res
        .status(400)
        .json({ message: 'Quantity to decrement exceeds available stock' });
    }

    const updatedStock = await Stock.findByIdAndUpdate(
      id,
      { $inc: { quantity: -quantity } },
      { new: true }
    );
    res.status(200).json({ message: 'Stock updated', updatedStock });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};

export const getStock = async (req, res) => {
  try {
    console.log('Fetching stock for chef');
    const stock = await Stock.find();
    console.log('Found stock items:', stock.length);
    res.status(200).json(stock);
  } catch (error) {
    console.error('Error fetching stock:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stock',
      error: error.message,
    });
  }
};

// scheduleSchema MANAGEMENT

export const getScheduleById = async (req, res) => {
  try {
    const { id } = req.params;
    const schedule = await Schedule.findById(id);
    if (!schedule) {
      return res.status(200).json({ message: 'Schedule not found' });
    }
    res.status(200).json(schedule);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};
