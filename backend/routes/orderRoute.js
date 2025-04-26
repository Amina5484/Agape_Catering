import express from 'express';
import { protect, authorizeRoles } from '../config/authMiddleware.js';
import ROLES from '../config/roles.js';
import {
  getUserOrders,
  getOrderDetails,
  getAllOrders,
  updateOrderStatus,
  createOrder,
} from '../controllers/orderController.js';

const order_router = express.Router();

// Customer: Create an order
order_router.post(
  '/checkout',
  protect,
  authorizeRoles(ROLES.CUSTOMER),
  createOrder
);

// Customer: Get user's orders
order_router.get(
  '/user/:userId',
  protect,
  authorizeRoles(ROLES.CUSTOMER),
  getUserOrders
);

// Customer: Get order details
order_router.get(
  '/:orderId',
  protect,
  authorizeRoles(ROLES.CUSTOMER),
  getOrderDetails
);

// Manager/Admin: Get all orders
order_router.get(
  '/',
  protect,
  authorizeRoles(ROLES.CATERING_MANAGER, ROLES.SYSTEM_ADMIN),
  getAllOrders
);

// Manager/Admin: Update order status
order_router.put(
  '/:orderId/status',
  protect,
  authorizeRoles(ROLES.CATERING_MANAGER, ROLES.SYSTEM_ADMIN),
  updateOrderStatus
);

export default order_router;
