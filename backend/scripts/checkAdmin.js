import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/userModel.js';
import bcrypt from 'bcrypt';

dotenv.config();

const checkAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if admin exists
    const admin = await User.findOne({ email: 'admin@system.com' });
    if (!admin) {
      console.log('Admin user does not exist');
      process.exit(1);
    }

    console.log('Admin user found:', {
      name: admin.name,
      email: admin.email,
      role: admin.role,
      id: admin._id
    });

    // Check if password is correct
    const isPasswordValid = await admin.matchPassword('Admin@123');
    console.log('Password valid:', isPasswordValid);

    // If password is not valid, update it
    if (!isPasswordValid) {
      console.log('Updating admin password...');
      const salt = await bcrypt.genSalt(10);
      admin.password = await bcrypt.hash('Admin@123', salt);
      await admin.save();
      console.log('Admin password updated successfully');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error checking admin user:', error);
    process.exit(1);
  }
};

checkAdmin(); 