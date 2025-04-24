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
chef_router.use(protect, authorizeRoles(ROLES.EXECUTIVE_CHEF));

// Profile routes
chef_router.get('/profile', getProfile);
chef_router.put('/profile', upload.single('photo'), updateProfile);

// Existing routes
chef_router.get('/stock', getStock);
chef_router.put('/stock/update/:id', updateStockItem);
chef_router.get('/schedule/:id', getScheduleById);

export default chef_router;
