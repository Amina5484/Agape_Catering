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
  updateSchedule,
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
catering_router.post('/order/accept/:orderId', (req, res) => {
  
  acceptOrder(req, res);
});

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
catering_router.put('/order/update-status/:orderId', (req, res) => {
  console.log('PUT /order/update-status route called with body:', req.body);
  updateOrderStatus(req, res);
});

// Schedule Management
catering_router.post('/schedule/assign', assignSchedule);
catering_router.put('/schedule/update', updateSchedule);
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
    console.log(
      '============================================================================='
    );
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

    const orders = await order
      .find()
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

// Get order details by ID for manager
catering_router.get('/order/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;

    const orderDetails = await order
      .findById(orderId)
      .populate({
        path: 'userId',
        select: 'name email phone',
      })
      .populate({
        path: 'menuItems.item',
        select: 'name price image description',
      });

    if (!orderDetails) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json(orderDetails);
  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

catering_router.post('/order/update-status/:orderId', async (req, res) => {
  // console.log('POST /order/update-status route called with body:', req.body);
  try {
    const { orderId } = req.params;
    const {
      status,
      notifyCustomer,
      customerEmail,
      customerName,
      customerPhone,
      message,
    } = req.body;

    // Validate the status
    const validStatuses = [
      'pending',
      'confirmed',
      'preparing',
      'ready',
      'delivered',
      'cancelled',
    ];

    const normalizedStatus = status.toLowerCase();
    if (!validStatuses.includes(normalizedStatus)) {
      return res.status(400).json({ message: 'Invalid order status' });
    }

    // Only trigger payment email when status is set to 'ready'
    if (normalizedStatus === 'ready') {
      let orderData;
      try {
        orderData = await order.findById(orderId).populate('menuItems.item');
        if (!orderData) {
          return res.status(404).json({ message: 'Order not found' });
        }
      } catch (dbErr) {
        return res.status(500).json({
          message: 'Error fetching order from database',
          error: dbErr.message,
        });
      }

      let user;
      try {
        user = await userModel.findById(orderData.userId);

        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }
      } catch (userErr) {
        return res.status(500).json({
          message: 'Error fetching user from database',
          error: userErr.message,
        });
      }
      // console.log('User found:', user);

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
        // console.log(chapaResponse);

        const paymentUrl = chapaResponse.data?.data?.checkout_url;
        if (!paymentUrl) {
          throw new Error('Payment URL not received from Chapa');
        }
        const order_date = new Date(orderData.createdAt).toLocaleString(
          'en-US',
          {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
          }
        );

        const remaning_amount = orderData.totalAmount - orderData.paidAmount;
        try {
          // console.log(
          //   user.name,
          //   orderId,
          //   new Date(orderData.createdAt).toLocaleString(), // Convert to human-readable date and time
          //   orderData.menuItems,
          //   orderData.totalAmount,
          //   orderData.paidAmount,
          //   orderData.totalAmount - orderData.paidAmount,
          //   paymentUrl
          // );
          await sendEmail({
            to: user.email,
            subject: 'Your Order is Ready for Pickup',
            html: orderSecondPaymentEmailHTML(
              user.name,
              orderId,
              order_date,
              orderData.menuItems,
              orderData.totalAmount,
              orderData.paidAmount,
              remaning_amount,
              paymentUrl
            ),
          });
          console.log('Email sent successfully');
  
          orderData.paymentHistory.push({
            recordedBy: user._id,
            amount: remaning_amount,
            date: new Date(),
            transactionId: chapaResponse.data.data.tx_ref || `txn_${Date.now()}`,
            status: 'success',
            method: 'chapa',
            paymentType: 'full',
            paymentDescription: 'Remaining payment for order',
          });

          console.log('==============================================');
          console.log('Payment history added to order:', orderData.paymentHistory);
          console.log('==============================================');

          orderData.status = 'paid'; // Set status to paid after processing payment

          // Save the updated order
          await orderData.save();
        } catch (emailError) {
          console.error('Failed to send email:', emailError.message);
          // Not throwing to allow order status update to proceed
        }
      } catch (chapaErr) {
        return res.status(500).json({
          message: 'Chapa payment initialization failed',
          error: chapaErr.message,
        });
      }
    }

    // Update order status - FIXING FIELD NAME FROM status TO orderStatus
    let updatedOrder;
    try {
      updatedOrder = await order
        .findByIdAndUpdate(
          orderId,
          { orderStatus: normalizedStatus }, // Changed field from status to orderStatus and normalized
          { new: true }
        )
        .populate('userId', 'name email phone');

      console.log('Updated order status result:', {
        orderId,
        newStatus: normalizedStatus,
        success: !!updatedOrder,
      });
    } catch (updateErr) {
      console.error('Error during status update:', updateErr);
      return res.status(500).json({
        message: 'Error updating order status',
        error: updateErr.message,
      });
    }

    if (!updatedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Handle customer notification if notifyCustomer flag is true
    if (notifyCustomer) {
      try {
        // Get user email either from the request or from the order
        const userEmail = customerEmail || updatedOrder.userId?.email;
        const userName =
          customerName || updatedOrder.userId?.name || 'Customer';

        if (userEmail) {
          // Import sendEmail
          const { sendEmail } = await import('../utils/sendEmail.js');

          // Create different email content based on status
          let emailSubject, emailHTML;

          switch (normalizedStatus) {
            case 'confirmed':
              emailSubject =
                'Great News! Your Agape Catering Order is Confirmed';
              emailHTML = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
                  <h2 style="color: #5c6bc0;">Order Confirmed!</h2>
                  <p>Hello ${userName},</p>
                  <p>Wonderful news! Your order has been <strong>CONFIRMED</strong> and our team is getting ready to prepare your delicious food.</p>
                  <p>Order ID: <strong>${orderId.substring(
                    0,
                    8
                  )}...</strong></p>
                  <p>We'll keep you updated as your order progresses. Thank you for choosing Agape Catering!</p>
                  <p>With gratitude,<br>Agape Catering Team</p>
                </div>
              `;
              break;
            case 'preparing':
              emailSubject = 'Your Agape Catering Order is Being Prepared';
              emailHTML = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
                  <h2 style="color: #5c6bc0;">Order Being Prepared</h2>
                  <p>Hello ${userName},</p>
                  <p>Our chefs are now preparing your order with care and the finest ingredients!</p>
                  <p>Order ID: <strong>${orderId.substring(
                    0,
                    8
                  )}...</strong></p>
                  <p>Thank you for your patience. We're putting our heart into making your food perfect.</p>
                  <p>Warm regards,<br>Agape Catering Team</p>
                </div>
              `;
              break;
            case 'ready':
              emailSubject = 'Your Agape Catering Order is Ready for Delivery';
              emailHTML = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
                  <h2 style="color: #5c6bc0;">Order Ready for Delivery</h2>
                  <p>Hello ${userName},</p>
                  <p>Great news! Your order is now ready and will soon be on its way to you.</p>
                  <p>Order ID: <strong>${orderId.substring(
                    0,
                    8
                  )}...</strong></p>
                  <p>Our delivery team will contact you shortly. Thank you for choosing Agape Catering!</p>
                  <p>Best regards,<br>Agape Catering Team</p>
                </div>
              `;
              break;
            case 'delivered':
              emailSubject = 'Your Agape Catering Order has been Delivered';
              emailHTML = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
                  <h2 style="color: #5c6bc0;">Order Successfully Delivered</h2>
                  <p>Hello ${userName},</p>
                  <p>Your order has been successfully delivered! We hope you enjoy your meal.</p>
                  <p>Order ID: <strong>${orderId.substring(
                    0,
                    8
                  )}...</strong></p>
                  <p>It was our pleasure to serve you. We'd love to hear your feedback about your experience.</p>
                  <p>With appreciation,<br>Agape Catering Team</p>
                </div>
              `;
              break;
            case 'cancelled':
              emailSubject = 'Your Agape Catering Order has been Cancelled';
              emailHTML = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
                  <h2 style="color: #5c6bc0;">Order Cancelled</h2>
                  <p>Hello ${userName},</p>
                  <p>We regret to inform you that your order has been cancelled.</p>
                  <p>Order ID: <strong>${orderId.substring(
                    0,
                    8
                  )}...</strong></p>
                  <p>If you have any questions or would like to place a new order, please contact our customer service.</p>
                  <p>Sincerely,<br>Agape Catering Team</p>
                </div>
              `;
              break;
            default:
              // Default for other statuses
              emailSubject = `Your Order Status: ${normalizedStatus.toUpperCase()}`;
              const statusMessage =
                message ||
                `Your order (ID: ${orderId.substring(
                  0,
                  8
                )}) status has been updated to: ${normalizedStatus.toUpperCase()}`;
              emailHTML = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
                  <h2 style="color: #5c6bc0;">Order Status Update</h2>
                  <p>Hello ${userName},</p>
                  <p>${statusMessage}</p>
                  <p>Thank you for choosing Agape Catering!</p>
                  <p>For any questions, please contact us.</p>
                  <p>Regards,<br>Agape Catering Team</p>
                </div>
              `;
          }

          await sendEmail({
            to: userEmail,
            subject: emailSubject,
            html: emailHTML,
          });

          console.log(`Status update email sent to customer: ${userEmail}`);
        } else {
          console.log('Customer email not available for notification');
        }
      } catch (emailErr) {
        console.error('Email notification error:', emailErr);
        // Continue with the response even if email fails
      }
    }

    res.status(200).json({
      message: 'Order status updated successfully',
      order: updatedOrder,
      notificationSent:
        notifyCustomer && updatedOrder.userId?.email ? true : false,
    });
  } catch (error) {
    console.error('Unhandled server error:', error);
    res
      .status(500)
      .json({ message: 'Unexpected Server Error', error: error.message });
  }
});

export default catering_router;
