import express from 'express';
import { protect, authorizeRoles } from '../config/authMiddleware.js';
import ROLES from '../config/roles.js';
import {
  // getUserOrders,
  // getOrderDetails,
  // getAllOrders,
  // updateOrderStatus,
  createOrder,
} from '../controllers/orderController.js';
import Order from '../models/orderModel.js';

const order_router = express.Router();
order_router.use(protect, authorizeRoles(ROLES.CUSTOMER));

order_router.post('/checkout', createOrder);

// // Get user's orders (for customers)
// order_router.get(
//   '/user/:userId',
//   protect,
//   authorizeRoles(ROLES.CUSTOMER),
//   getUserOrders
// );

// // Get order details (for customers)
// order_router.get(
//   '/:orderId',
//   protect,
//   authorizeRoles(ROLES.CUSTOMER),
//   getOrderDetails
// );

// // Get all orders (for managers and admins)
// order_router.get(
//   '/',
//   protect,
//   authorizeRoles(ROLES.CATERING_MANAGER, ROLES.SYSTEM_ADMIN),
//   getAllOrders
// );

// // Update order status (for managers and admins)
// order_router.put(
//   '/:orderId/status',
//   protect,
//   authorizeRoles(ROLES.CATERING_MANAGER, ROLES.SYSTEM_ADMIN),
//   updateOrderStatus
// );

// Get orders for a specific user
order_router.get('/user/:userId', protect, async (req, res) => {
  try {
    // Verify that the requesting user is the same as the userId in the params
    if (req.user._id.toString() !== req.params.userId) {
      return res.status(403).json({
        message: 'You are not authorized to view these orders',
      });
    }

    const orders = await Order.find({ userId: req.params.userId })
      .sort({ orderedDate: -1 })
      .populate('menuItems.item', 'name price');

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: 'No orders found for this user' });
    }

    res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

export default order_router;
