import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

export const connectDB = async () => {
  try {
    // Use the MongoDB URI from the environment variable
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ '; // fallback to local DB
    await mongoose.connect(uri); // No need for useNewUrlParser & useUnifiedTopology options anymore
    console.log('MongoDB connected successfully!');
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1); // Exit the process if the DB connection fails
  }
};
