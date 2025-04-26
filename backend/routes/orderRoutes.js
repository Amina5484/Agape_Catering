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
import Order from '../models/orderModel.js';

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

// Chef routes
orderRouter.get(
  '/chef',
  protect,
  authorizeRoles(ROLES.CHEF, ROLES.EXECUTIVE_CHEF),
  async (req, res) => {
    try {
      // Fetch orders assigned to the current chef
      const orders = await Order.find({
        assignedToChef: req.user._id,
        status: { $in: ['pending', 'in-progress', 'completed'] },
      })
        .populate('customer', 'name email phone')
        .populate('userId', 'name email phone') // Also populate userId for compatibility
        .populate('items.item') // Populate menu items for simple orders
        .populate('menuItems.item') // Populate menu items for catering orders
        .select(
          '+specialInstructions +preparationInstructions +additionalNotes +notes'
        )
        .sort({ createdAt: -1 });

      // Log the first order's special instructions for debugging
      if (orders.length > 0) {
        console.log('First order special instructions:', {
          specialInstructions: orders[0].specialInstructions,
          preparationInstructions: orders[0].preparationInstructions,
          additionalNotes: orders[0].additionalNotes,
          notes: orders[0].notes,
          orderId: orders[0]._id,
        });
      }

      res.json(orders);
    } catch (error) {
      console.error('Error fetching chef orders:', error);
      res.status(500).json({ message: 'Server error fetching orders' });
    }
  }
);

// Update order status
orderRouter.put(
  '/:id/status',
  protect,
  authorizeRoles(ROLES.CHEF, ROLES.EXECUTIVE_CHEF),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      // Validate status
      if (
        !['pending', 'in-progress', 'completed', 'cancelled'].includes(status)
      ) {
        return res.status(400).json({ message: 'Invalid status' });
      }

      // Find the order and ensure it's assigned to this chef
      const order = await Order.findOne({
        _id: id,
        assignedToChef: req.user._id,
      });

      if (!order) {
        return res
          .status(404)
          .json({ message: 'Order not found or not assigned to you' });
      }

      // Update the status
      order.status = status;

      // Add status history
      order.statusHistory.push({
        status,
        updatedBy: req.user._id,
        timestamp: new Date(),
      });

      await order.save();

      res.json({ message: 'Order status updated successfully', order });
    } catch (error) {
      console.error('Error updating order status:', error);
      res.status(500).json({ message: 'Server error updating order status' });
    }
  }
);

// Chef order details route - allow chefs to view complete order details
orderRouter.get(
  '/chef/details/:orderId',
  protect,
  authorizeRoles(ROLES.CHEF, ROLES.EXECUTIVE_CHEF),
  async (req, res) => {
    try {
      const { orderId } = req.params;

      const order = await Order.findById(orderId)
        .populate('menuItems.item')
        .populate('userId', 'name email phone');

      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      // Check if order is assigned to this chef
      if (
        order.assignedToChef &&
        order.assignedToChef.toString() !== req.user._id.toString()
      ) {
        return res.status(403).json({ message: 'Order not assigned to you' });
      }

      res.json(order);
    } catch (error) {
      console.error('Error fetching chef order details:', error);
      res.status(500).json({ message: 'Server error fetching order details' });
    }
  }
);

// Assign order to chef endpoint
orderRouter.put(
  '/assign-chef/:orderId',
  protect,
  authorizeRoles(ROLES.CATERING_MANAGER),
  async (req, res) => {
    try {
      const { orderId } = req.params;
      const { chefId, preparationInstructions } = req.body;

      // Find the order
      const order = await Order.findById(orderId);

      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      // Assign to specific chef if chefId is provided, otherwise mark as assignedToChef: true
      // which will be visible to all chefs
      if (chefId) {
        order.assignedToChef = chefId;
      } else {
        order.assignedToChef = true;
      }

      // Add preparation instructions if provided
      if (preparationInstructions) {
        order.preparationInstructions = preparationInstructions;
      }

      // Add assignment metadata
      order.assignedAt = new Date();
      order.assignedBy = req.user._id;

      await order.save();

      res.json({
        message: 'Order successfully assigned to chef',
        order,
      });
    } catch (error) {
      console.error('Error assigning order to chef:', error);
      res.status(500).json({ message: 'Server error assigning order to chef' });
    }
  }
);

export default orderRouter;
