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
import mongoose from 'mongoose';
import Schedule from '../models/schedule.js';

const orderRouter = express.Router();

// Protected routes
orderRouter.use(protect);

// Create new order
orderRouter.post('/create', createOrder);

// Get orders for a user
orderRouter.get('/user/:userId', getUserOrders);

// Get order details
orderRouter.get('/details/:orderId', getOrderDetails);

// Get all orders
orderRouter.get('/all', getAllOrders);

// Update order status (Manager or Chef)
orderRouter.put(
  '/update-status/:orderId',
  authorizeRoles(ROLES.CATERING_MANAGER, ROLES.CHEF, ROLES.EXECUTIVE_CHEF),
  updateOrderStatus
);

// Payment routes - require manager/chef role
orderRouter.post(
  '/payment/:orderId',
  authorizeRoles(ROLES.CATERING_MANAGER, ROLES.EXECUTIVE_CHEF),
  addPaymentRecord
);

// Payment verification route - public (for payment gateway)
orderRouter.get('/verify', verifyPayment);

// Chef specific routes

// Get orders assigned to the chef
orderRouter.get(
  '/chef',
  authorizeRoles(ROLES.CHEF, ROLES.EXECUTIVE_CHEF),
  async (req, res) => {
    try {
      const orders = await Order.find({
        assignedToChef: req.user._id,
        status: { $in: ['pending', 'in-progress', 'completed'] },
      })
        .populate('customer', 'name email phone')
        .populate('userId', 'name email phone')
        .populate('items.item')
        .populate('menuItems.item')
        .select(
          '+specialInstructions +preparationInstructions +additionalNotes +notes'
        )
        .sort({ createdAt: -1 });

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

// Update status of an order by chef
orderRouter.put(
  '/:id/status',
  authorizeRoles(ROLES.CHEF, ROLES.EXECUTIVE_CHEF, ROLES.CATERING_MANAGER),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (
        !['pending', 'in-progress', 'completed', 'cancelled'].includes(status)
      ) {
        return res.status(400).json({ message: 'Invalid status' });
      }

      // Find the order by ID without requiring assignedToChef match
      const order = await Order.findById(id);

      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      order.status = status;

      // Initialize statusHistory if it doesn't exist
      if (!order.statusHistory) {
        order.statusHistory = [];
      }

      order.statusHistory.push({
        status,
        updatedBy: req.user._id,
        timestamp: new Date(),
      });

      await order.save();

      // If the status is completed, also update the corresponding schedule
      if (status === 'completed') {
        try {
          // Find the schedule that references this order
          const scheduleUpdate = await Schedule.findOne({ orders: id });

          if (scheduleUpdate) {
            console.log(
              `Found schedule for order ${id}, updating status to completed`
            );
            scheduleUpdate.status = 'completed';
            await scheduleUpdate.save();
            console.log(`Schedule ${scheduleUpdate._id} updated to completed`);
          } else {
            console.log(`No schedule found for order ${id}`);
          }
        } catch (scheduleError) {
          console.error('Error updating schedule status:', scheduleError);
          // Don't return an error, we still want to update the order status
        }
      }

      res.json({ message: 'Order status updated successfully', order });
    } catch (error) {
      console.error('Error updating order status:', error);
      res.status(500).json({ message: 'Server error updating order status' });
    }
  }
);

// Get detailed view of an order by chef
orderRouter.get(
  '/chef/details/:orderId',
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

// Assign order to chef
orderRouter.put(
  '/assign-chef/:orderId',
  authorizeRoles(ROLES.CATERING_MANAGER),
  async (req, res) => {
    try {
      const { orderId } = req.params;
      const { chefId, preparationInstructions } = req.body;

      const order = await Order.findById(orderId);

      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      if (chefId) {
        order.assignedToChef = chefId;
      } else {
        order.assignedToChef = true;
      }

      if (preparationInstructions) {
        order.preparationInstructions = preparationInstructions;
      }

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
