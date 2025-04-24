import express from 'express';
import { protect, authorizeRoles } from '../config/authMiddleware.js';
import ROLES from '../config/roles.js';
import {
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
  getMenu,
  addStockItem,
  updateStockItem,
  deleteStockItem,
  getStock,
  acceptOrder,
  assignSchedule,
  updateOrderStatus,
  viewCustomerLocation,
  viewFeedback,
  generateReport,
  getSchedule,
  listNewOrders,
} from '../controllers/cateringManagerController.js';
import { upload } from '../middleware/multer.js';
import order from '../models/orderModel.js';
import userModel from '../models/userModel.js';
import { sendEmail } from '../utils/sendEmail.js';
import orderSecondPaymentEmailHTML from '../email_templates/orderSecondPaymentEmailHTML.js';
import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const CHAPA_SECRET_KEY = process.env.CHAPA_SECRET_KEY;
const catering_router = express.Router();

// Middleware: Only Catering Managers and Executive Chefs can access these routes
catering_router.use(
  protect,
  authorizeRoles(ROLES.CATERING_MANAGER, ROLES.EXECUTIVE_CHEF)
);

// Menu Management

/**
 * @swagger
 * tags:
 *   name: Menu Management
 *   description: API for managing menu items
 */

/**
 * @swagger
 * /api/catering/menu:
 *   post:
 *     summary: Add a new menu item
 *     tags: [Menu Management]
 *     description: Upload a menu item with an image
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *               - description
 *               - category
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the menu item
 *               price:
 *                 type: number
 *                 description: Price of the menu item
 *               description:
 *                 type: string
 *                 description: Description of the menu item
 *               category:
 *                 type: string
 *                 description: Category of the menu item
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Image of the menu item
 *     responses:
 *       201:
 *         description: Menu item added successfully
 *       500:
 *         description: Server error
 */
catering_router.post('/menu', upload.single('image'), addMenuItem);

catering_router.post('/listorders', listNewOrders);

/**
 * @swagger
 * /api/catering/menu/update/{id}:
 *   put:
 *     summary: Update a menu item
 *     tags: [Menu Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Menu item updated
 */
catering_router.put('/menu/update/:id', updateMenuItem);

/**
 * @swagger
 * /api/catering/menu/delete/{id}:
 *   delete:
 *     summary: Delete a menu item
 *     tags: [Menu Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Menu item deleted
 */
catering_router.delete('/menu/delete/:id', deleteMenuItem);

/**
 * @swagger
 * /api/catering/menu:
 *   get:
 *     summary: Retrieve the menu
 *     tags: [Menu Management]
 *     responses:
 *       200:
 *         description: A list of menu items
 */
catering_router.get('/menu', getMenu);

// Stock Management

/**
 * @swagger
 * /api/catering/stock:
 *   get:
 *     summary: Retrieve stock items
 *     tags: [Stock Management]
 *     responses:
 *       200:
 *         description: A list of stock items
 */
catering_router.get('/stock', getStock);

/**
 * @swagger
 * /api/catering/stock/add:
 *   post:
 *     summary: Add a new stock item
 *     tags: [Stock Management]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Stock item added successfully
 */
catering_router.post('/stock/add', addStockItem);

/**
 * @swagger
 * /api/catering/stock/update/{id}:
 *   put:
 *     summary: Update a stock item
 *     tags: [Stock Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Stock item updated
 */
catering_router.put('/stock/update/:id', updateStockItem);

/**
 * @swagger
 * /api/catering/stock/delete/{id}:
 *   delete:
 *     summary: Delete a stock item
 *     tags: [Stock Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Stock item deleted
 */
catering_router.delete('/stock/delete/:id', deleteStockItem);

// Order Management

/**
 * @swagger
 * /api/catering/order/accept/{orderId}:
 *   post:
 *     summary: Accept an order
 *     tags: [Order Management]
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order accepted
 */
catering_router.post('/order/accept/:orderId', acceptOrder);

/**
 * @swagger
 * /api/catering/order/update-status/{orderId}:
 *   put:
 *     summary: Update order status
 *     tags: [Order Management]
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order status updated
 */
catering_router.put('/order/update-status/:orderId', updateOrderStatus);

// Schedule Management
catering_router.post('/schedule/assign', assignSchedule);
catering_router.get('/schedule', getSchedule);

// Customer Location
catering_router.get('/customer/:customerId/location', viewCustomerLocation);

// Feedback
catering_router.get('/feedback', viewFeedback);

// Reports
catering_router.get('/report', generateReport);

// Get all orders
catering_router.get('/orders', async (req, res) => {
  try {
    console.log('=============================================================================');
    console.log('Fetching orders...');
    // console.log('Request headers:', req.headers);
    // console.log('User:', req.user);

    // if (!req.user) {
    //   console.log('No user found in request');
    //   return res.status(401).json({ message: 'Not authorized' });
    // }

    // Check if user has the correct role
    // if (!['Catering Manager', 'Executive Chef'].includes(req.user.role)) {
    //   console.log('User role not authorized:', req.user.role);
    //   return res
    //     .status(403)
    //     .json({ message: 'You do not have permission to view orders' });
    // }

    const orders = await order.find()
      .sort({ orderedDate: -1 })
      .populate({
        path: 'userId',
        select: 'name email phone',
      })
      .populate({
        path: 'menuItems.item',
        select: 'name price image',
      });

    console.log('Found orders:', orders.length);

    if (!orders || orders.length === 0) {
      return res.status(200).json([]);
    }

    res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

catering_router.post('/order/update-status/:orderId', async (req, res) => {
  console.log("called")
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    // Validate the status
    const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'delivered'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid order status' });
    }

    // Only trigger payment email when status is set to 'ready'
    if (status === 'ready') {
      let orderData;
      try {
        orderData = await order.findById(orderId).populate('menuItems.item');;
        if (!orderData) {
          return res.status(404).json({ message: 'Order not found' });
        }
      } catch (dbErr) {
        return res.status(500).json({ message: 'Error fetching order from database', error: dbErr.message });
      }

      let user;
      try {
        user = await userModel.findById(orderData.userId);
        
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }
      } catch (userErr) {
        return res.status(500).json({ message: 'Error fetching user from database', error: userErr.message });
      }
      console.log('User found:', user);

      const chapaPaymentData = {
        amount: orderData.totalAmount - orderData.paidAmount,
        currency: 'ETB',
        email: user.email,
        first_name: user.name || 'User',
        last_name: '',
        phone: user.phone || '0911121314',
        tx_ref: `order_${user._id}_${Date.now()}`,
        callback_url: 'http://localhost:3000/payment-success',
        return_url: 'http://localhost:3000/payment-success',
        customization: {
          title: 'Agape Catering',
          description: 'Payment for your catering order',
        },
        // meta: {
        //   userId: user.userId.toString(),
        // },
      };

      try {
        const chapaResponse = await axios.post(
          'https://api.chapa.co/v1/transaction/initialize',
          chapaPaymentData,
          {
            headers: {
              Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
              'Content-Type': 'application/json',
            },
          }
        );
        console.log(chapaResponse);
        
        const paymentUrl = chapaResponse.data?.data?.checkout_url;
        if (!paymentUrl) {
          throw new Error('Payment URL not received from Chapa');
        }
        const order_date = new Date(orderData.createdAt).toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });
      
      const remaning_amount = orderData.totalAmount - orderData.paidAmount;
        try {
            console.log(
            user.name,
            orderId,
            new Date(orderData.createdAt).toLocaleString(), // Convert to human-readable date and time
            orderData.menuItems,
            orderData.totalAmount,
            orderData.paidAmount,
            orderData.totalAmount - orderData.paidAmount,
            paymentUrl
            );
          await sendEmail({
            to: user.email,
            subject: 'Your Order is Ready for Pickup',
            html: orderSecondPaymentEmailHTML(
              user.name,
              orderId,
              order_date  ,
              orderData.menuItems,
              orderData.totalAmount,
              orderData.paidAmount,
              remaning_amount,
              paymentUrl
            ),
          });
          console.log('Email sent successfully');
        } catch (emailError) {
          console.error('Failed to send email:', emailError.message);
          // Not throwing to allow order status update to proceed
        }
      } catch (chapaErr) {
        return res.status(500).json({ message: 'Chapa payment initialization failed', error: chapaErr.message });
      }
    }

    // Update order status
    let updatedOrder;
    try {
      updatedOrder = await order.findByIdAndUpdate(
        orderId,
        { orderStatus: status },
        { new: true }
      );
    } catch (updateErr) {
      return res.status(500).json({ message: 'Error updating order status', error: updateErr.message });
    }

    if (!updatedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json({ message: 'Order status updated successfully', order: updatedOrder });

  } catch (error) {
    console.error('Unhandled server error:', error);
    res.status(500).json({ message: 'Unexpected Server Error', error: error.message });
  }
});

export default catering_router;
