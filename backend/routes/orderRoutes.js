import express from 'express';
import { protect, authorizeRoles } from '../config/authMiddleware.js';
import ROLES from '../config/roles.js';
import {
  createOrder,
  getUserOrders,
  getOrderDetails,
  getAllOrders,
  updateOrderStatus,
  verifyPayment,
  addPaymentRecord,
} from '../controllers/orderController.js';

const orderRouter = express.Router();

// Protected routes
orderRouter.use(protect);
orderRouter.post('/create', createOrder);
orderRouter.get('/user/:userId', getUserOrders);
orderRouter.get('/details/:orderId', getOrderDetails);
orderRouter.get('/all', getAllOrders);
orderRouter.put('/update-status/:orderId', updateOrderStatus);

// Payment routes - require manager/chef role
orderRouter.post(
  '/payment/:orderId',
  authorizeRoles(ROLES.CATERING_MANAGER, ROLES.EXECUTIVE_CHEF),
  addPaymentRecord
);

// Payment verification route - no need auth as called by payment gateway
orderRouter.get('/verify', verifyPayment);

export default orderRouter;
