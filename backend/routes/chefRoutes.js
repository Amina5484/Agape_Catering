import express from 'express';
import { protect, authorizeRoles } from '../config/authMiddleware.js';
import {
  updateStockItem,
  getStock,
  getScheduleById,
  getProfile,
  updateProfile,
} from '../controllers/chefController.js';
import ROLES from '../config/roles.js';
import multer from 'multer';
import path from 'path';
import Schedule from '../models/schedule.js';
import mongoose from 'mongoose';

const chef_router = express.Router();

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/profiles');
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

// Middleware: Only Executive Chefs can access these routes
chef_router.use(protect);

// Profile routes
chef_router.get('/profile', authorizeRoles(ROLES.EXECUTIVE_CHEF), getProfile);
chef_router.put(
  '/profile',
  authorizeRoles(ROLES.EXECUTIVE_CHEF),
  upload.single('photo'),
  updateProfile
);

// Existing routes
chef_router.get('/stock', authorizeRoles(ROLES.EXECUTIVE_CHEF), getStock);
chef_router.put(
  '/stock/update/:id',
  authorizeRoles(ROLES.EXECUTIVE_CHEF),
  updateStockItem
);
chef_router.get(
  '/schedule/:id',
  authorizeRoles(ROLES.EXECUTIVE_CHEF),
  getScheduleById
);

// Add route to get all schedules for a chef
chef_router.get('/schedules', async (req, res) => {
  try {
    // Log key information for debugging
    console.log('Schedules endpoint hit with user:', req.user?._id);
    console.log('Request headers:', req.headers);

    // Check if user exists
    if (!req.user || !req.user._id) {
      console.log('No authenticated user found in request');
      return res.status(401).json({
        message: 'Authentication required',
        error: 'No user found in request',
      });
    }

    // Find all schedules where the chefId matches the current user's ID
    const schedules = await Schedule.find({ chefId: req.user._id })
      .populate('orders')
      .sort({ date: 1 }); // Sort by date ascending

    console.log(`Found ${schedules.length} schedules for chef ${req.user._id}`);

    // Return the schedules, even if it's an empty array
    return res.status(200).json(schedules);
  } catch (error) {
    console.error('Error fetching chef schedules:', error);
    return res.status(500).json({
      message: 'Error fetching schedules',
      error: error.message,
      stack: error.stack,
    });
  }
});

// Add a new route to fetch orders for the chef
chef_router.get('/orders', async (req, res) => {
  try {
    console.log('Fetching orders assigned to chef ID:', req.user._id);

    const Order = mongoose.model('order');

    // Find all orders assigned to this chef
    const orders = await Order.find({
      assignedToChef: req.user._id,
    })
      .populate('userId', 'name email phone')
      .populate('menuItems.item')
      .sort({ createdAt: -1 });

    console.log(`Found ${orders.length} orders assigned to chef`);
    res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching chef orders:', error);
    res.status(500).json({
      message: 'Error fetching orders assigned to chef',
      error: error.message,
    });
  }
});

export default chef_router;
