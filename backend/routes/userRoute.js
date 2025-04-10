 import express from 'express';
 import { loginUser, registerUser } from '../controllers/userController.js';

 const userRouter = express.Router();

 userRouter.post('/login', loginUser); // ✅ Login Route
 userRouter.post('/register', registerUser); // ✅ Register Route

 export default userRouter;
