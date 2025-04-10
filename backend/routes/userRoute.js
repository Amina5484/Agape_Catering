import express from 'express';
import {
  loginUser,
  registerUser,
  updateProfile,
  getProfile,
} from '../controllers/userController.js';
import { protect } from '../config/authMiddleware.js';
import multer from 'multer';
import path from 'path';

const userRouter = express.Router();

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

userRouter.post('/login', loginUser); // ✅ Login Route
userRouter.post('/register', registerUser); // ✅ Register Route
userRouter.get('/profile', protect, getProfile);
userRouter.put('/profile', protect, upload.single('photo'), updateProfile);

export default userRouter;
