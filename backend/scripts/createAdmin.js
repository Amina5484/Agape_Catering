import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/userModel.js';
import ROLES from '../config/roles.js';

dotenv.config();

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const adminExists = await User.findOne({ email: 'admin@system.com' });
    if (adminExists) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    // Create admin user
    const adminUser = new User({
      name: 'System Admin',
      email: 'admin@system.com',
      phone: 1234567890, // Using a placeholder phone number
      password: 'Admin@123',
      role: ROLES.SYSTEM_ADMIN
    });

    await adminUser.save();
    console.log('Admin user created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
};

createAdmin(); 