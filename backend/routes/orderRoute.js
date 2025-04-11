import express from 'express';
import { protect, authorizeRoles } from '../config/authMiddleware.js';
import ROLES from '../config/roles.js';
import {
  getUserOrders,
  getOrderDetails,
  getAllOrders,
  updateOrderStatus,
} from '../controllers/orderController.js';

const order_router = express.Router();

// Get user's orders (for customers)
order_router.get(
  '/user/:userId',
  protect,
  authorizeRoles(ROLES.CUSTOMER),
  getUserOrders
);

// Get order details (for customers)
order_router.get(
  '/:orderId',
  protect,
  authorizeRoles(ROLES.CUSTOMER),
  getOrderDetails
);

// Get all orders (for managers and admins)
order_router.get(
  '/',
  protect,
  authorizeRoles(ROLES.CATERING_MANAGER, ROLES.SYSTEM_ADMIN),
  getAllOrders
);

// Update order status (for managers and admins)
order_router.put(
  '/:orderId/status',
  protect,
  authorizeRoles(ROLES.CATERING_MANAGER, ROLES.SYSTEM_ADMIN),
  updateOrderStatus
);

export default order_router;
