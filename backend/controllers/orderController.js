import userModel from '../models/userModel.js';
import Cart from '../models/cartModel.js';
import Order from '../models/orderModel.js';
import axios from 'axios';
import dotenv from 'dotenv';
import { sendEmail } from '../utils/sendEmail.js';
import orderReceiptEmailHTML from '../email_templates/orderEmail.js';
import mongoose from 'mongoose';

dotenv.config();

const CHAPA_SECRET_KEY = process.env.CHAPA_SECRET_KEY;

export const createOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      Address,
      DeliveryDate,
      TypeOfOrder,
      NumberOfGuest,
      specialInstructions,
    } = req.body;

    if (!Address || !DeliveryDate || !TypeOfOrder || !NumberOfGuest) {
      return res.status(400).json({
        message:
          'Address, DeliveryDate, TypeOfOrder, and NumberOfGuest are required.',
      });
    }

    if (
      TypeOfOrder === 'scheduled' &&
      new Date(DeliveryDate) <= new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
    ) {
      return res.status(400).json({
        message:
          'Scheduled delivery date must be at least 14 days in the future.',
      });
    }
    if (
      TypeOfOrder === 'urgent'
    ) {
      const cart = await Cart.findOne({ userId }).populate('items.menuItem');
      if (!cart || cart.items.length === 0) {
        return res.status(400).json({ message: 'Your cart is empty.' });
      }
  
      const total = cart.subtotal;
      const amountToPayNow = total;
  
      const user = await userModel.findById(userId);
      if (!user) return res.status(404).json({ message: 'User not found.' });
  
      const orderItems = cart.items.map((item) => ({
        item: item.menuItem._id,
        quantity: item.quantity,
        price: item.price,
        totalPrice: item.totalPrice,
        specialInstructions: item.specialInstructions,
        deliveryFee: item.deliveryFee,
      }));
  
      // Create the order first
      const newOrder = new Order({
        userId,
        Address,
        typeOfOrder:TypeOfOrder,
        menuItems: orderItems,
        totalAmount: total,
        paidAmount: 0, // Will be updated after payment
        paymentStatus: 'paid',
        orderStatus: 'pending',
        deliveryDateValue: DeliveryDate,
        specialInstructions:specialInstructions,
        numberOfGuest: NumberOfGuest,
      });
  
      await newOrder.save();
  
      // Now initialize Chapa payment with the order ID
      const chapaPaymentData = {
        amount: amountToPayNow,
        currency: 'ETB',
        email: user.email,
        first_name: user.name || 'User',
        last_name: '',
        phone: user.phone || '0911121314',
        tx_ref: `order_${newOrder._id}_${Date.now()}`,
        callback_url: `${
          process.env.FRONTEND_URL || 'http://localhost:3000'
        }/payment-success`,
        return_url: `${
          process.env.FRONTEND_URL || 'http://localhost:3000'
        }/payment-success`,
        customization: {
          title: 'Agape Catering',
          description: 'Payment for your catering order',
        },
        meta: {
          userId: userId.toString(),
          orderId: newOrder._id.toString(),
        },
      };
  
      console.log('Initializing Chapa payment with data:', {
        ...chapaPaymentData,
        amount: amountToPayNow,
        email: user.email,
      });
  
      const chapaResponse = await axios.post(
        'https://api.chapa.co/v1/transaction/initialize',
        chapaPaymentData,
        {
          headers: {
            Authorization: `Bearer ${CHAPA_SECRET_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );
  
      console.log('Chapa response:', chapaResponse.data);
  
      const checkout_url = chapaResponse?.data?.data?.checkout_url;
      if (!checkout_url) {
        console.error(
          'Failed to get checkout URL from Chapa:',
          chapaResponse.data
        );
        throw new Error('Failed to initialize payment');
      }
  
      // Update order with payment information
      newOrder.paidAmount = amountToPayNow;
      newOrder.paymentStatus = 'partially_paid';
      newOrder.paymentHistory = [
        {
          recordedBy: userId,
          amount: amountToPayNow,
          date: new Date(),
          transactionId: chapaResponse.data.data.tx_ref || `txn_${Date.now()}`,
          status: 'success',
          method: 'chapa',
          paymentType: 'partial',
          paymentDescription: 'Initial payment for order',
        },
      ];
  
      await newOrder.save();
  
      // Update user's previous orders
      user.previousOrders = user.previousOrders || [];
      user.previousOrders.push({
        items: orderItems,
        orderDate: new Date(),
        totalAmount: total,
      });
      await user.save();
  
      // Clear cart
      cart.items = [];
      cart.status = 'ordered';
      await cart.save();
  
      // Send email notification
      try {
        await sendEmail({
          to: user.email,
          subject: 'Order Receipt',
          html: orderReceiptEmailHTML(
            user.name || 'User',
            newOrder._id,
            new Date().toDateString(),
            orderItems,
            total,
            amountToPayNow,
            total
          ),
          });
        } catch (error) {
          console.error(
            'Error creating order:',
            error.response?.data || error.message
          );
          res
            .status(500)
            .json({ message: 'Something went wrong.', error: error.message });
        }
      return res.status(200).json({ message: 'Order placed successfully. Please pay 100% to confirm.',
      orderId: newOrder._id,
      amountToPay: amountToPayNow,
      payment_url: checkout_url,
    });
    }
    const cart = await Cart.findOne({ userId }).populate('items.menuItem');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Your cart is empty.' });
    }

    const total = cart.subtotal;
    const amountToPayNow = +(total * 0.4).toFixed(2);

    const user = await userModel.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const orderItems = cart.items.map((item) => ({
      item: item.menuItem._id,
      quantity: item.quantity,
      price: item.price,
      totalPrice: item.totalPrice,
      specialInstructions: item.specialInstructions,
      deliveryFee: item.deliveryFee,
    }));

    // Create the order first
    const newOrder = new Order({
      userId,
      Address,
      typeOfOrder:TypeOfOrder,
      menuItems: orderItems,
      totalAmount: total,
      paidAmount: 0, // Will be updated after payment
      paymentStatus: 'pending',
      orderStatus: 'pending',
      deliveryDateValue: DeliveryDate,
      specialInstructions:specialInstructions,
      numberOfGuest: NumberOfGuest,
    });

    await newOrder.save();

    // Now initialize Chapa payment with the order ID
    const chapaPaymentData = {
      amount: amountToPayNow,
      currency: 'ETB',
      email: user.email,
      first_name: user.name || 'User',
      last_name: '',
      phone: user.phone || '0911121314',
      tx_ref: `order_${newOrder._id}_${Date.now()}`,
      callback_url: `${
        process.env.FRONTEND_URL || 'http://localhost:3000'
      }/payment-success`,
      return_url: `${
        process.env.FRONTEND_URL || 'http://localhost:3000'
      }/payment-success`,
      customization: {
        title: 'Agape Catering',
        description: 'Payment for your catering order',
      },
      meta: {
        userId: userId.toString(),
        orderId: newOrder._id.toString(),
      },
    };

    console.log('Initializing Chapa payment with data:', {
      ...chapaPaymentData,
      amount: amountToPayNow,
      email: user.email,
    });

    const chapaResponse = await axios.post(
      'https://api.chapa.co/v1/transaction/initialize',
      chapaPaymentData,
      {
        headers: {
          Authorization: `Bearer ${CHAPA_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('Chapa response:', chapaResponse.data);

    const checkout_url = chapaResponse?.data?.data?.checkout_url;
    if (!checkout_url) {
      console.error(
        'Failed to get checkout URL from Chapa:',
        chapaResponse.data
      );
      throw new Error('Failed to initialize payment');
    }

    // Update order with payment information
    newOrder.paidAmount = amountToPayNow;
    newOrder.paymentStatus = 'partially_paid';
    newOrder.paymentHistory = [
      {
        recordedBy: userId,
        amount: amountToPayNow,
        date: new Date(),
        transactionId: chapaResponse.data.data.tx_ref || `txn_${Date.now()}`,
        status: 'success',
        method: 'chapa',
        paymentType: 'partial',
        paymentDescription: 'Initial payment for order',
      },
    ];

    await newOrder.save();

    // Update user's previous orders
    user.previousOrders = user.previousOrders || [];
    user.previousOrders.push({
      items: orderItems,
      orderDate: new Date(),
      totalAmount: total,
    });
    await user.save();

    // Clear cart
    cart.items = [];
    cart.status = 'ordered';
    await cart.save();

    // Send email notification
    try {
      await sendEmail({
        to: user.email,
        subject: 'Order Receipt',
        html: orderReceiptEmailHTML(
          user.name || 'User',
          newOrder._id,
          new Date().toDateString(),
          orderItems,
          total,
          amountToPayNow,
          total - amountToPayNow
        ),
      });
    } catch (err) {
      console.error('Email sending failed:', err.message);
    }

    res.status(201).json({
      message: 'Order placed successfully. Please pay 40% to confirm.',
      orderId: newOrder._id,
      amountToPay: amountToPayNow,
      payment_url: checkout_url,
    });
  } catch (error) {
    console.error(
      'Error creating order:',
      error.response?.data || error.message
    );
    res
      .status(500)
      .json({ message: 'Something went wrong.', error: error.message });
  }
};

export const getUserOrders = async (req, res) => {
  try {
    const { userId } = req.params;
    if (req.user._id.toString() !== userId) {
      return res.status(403).json({ message: 'Unauthorized access to orders' });
    }

    const orders = await Order.find({ userId })
      .sort({ orderedDate: -1 })
      .populate('menuItems.item', 'name price');

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: 'No orders found' });
    }

    res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId).populate(
      'menuItems.item',
      'name price'
    );
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (order.userId.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: 'Unauthorized access to order details' });
    }

    res.status(200).json(order);
  } catch (error) {
    console.error('Error fetching order details:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching all orders:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const {
      status,
      orderStatus,
      notifyCustomer,
      customerEmail,
      customerName,
      customerPhone,
      message,
    } = req.body;

    // Use orderStatus or status, whichever is provided
    const newStatus = orderStatus || status;

    if (!newStatus)
      return res.status(400).json({ message: 'Status is required' });

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Update order status
    order.orderStatus = newStatus;
    await order.save();

    let emailSent = false;
    let emailTo = null;
    let userName = 'Customer';

    // Send email when status is confirmed (backward compatibility)
    if (newStatus === 'confirmed') {
      const user = await userModel.findById(order.userId);
      if (!user) {
        console.log('User not found for order confirmation notification');
      } else {
        emailTo = user.email;
        userName = user.name || 'Customer';

        const orderItems = order.menuItems.map((item) => ({
          name: item.item.name,
          quantity: item.quantity,
          price: item.price,
          totalPrice: item.totalPrice,
        }));

        try {
          await sendEmail({
            to: user.email,
            subject: 'Your Order Has Been Confirmed!',
            html: orderReceiptEmailHTML(
              user.name || 'User',
              order._id,
              order.orderedDate.toDateString(),
              orderItems,
              order.totalAmount,
              order.paidAmount,
              order.totalAmount - order.paidAmount
            ),
          });
          console.log('Confirmation email sent successfully.');
          emailSent = true;
        } catch (err) {
          console.error('Error sending confirmation email:', err.message);
        }
      }
    }

    // Handle customer notification for status updates if notifyCustomer flag is true
    if (notifyCustomer) {
      emailTo = customerEmail;
      userName = customerName || 'Customer';

      // If email not provided in request, try to get it from the user associated with the order
      if (!emailTo) {
        const user = await userModel.findById(order.userId);
        if (user) {
          emailTo = user.email;
          userName = user.name || 'Customer';
        }
      }

      if (emailTo) {
        try {
          // Custom message if provided, otherwise use default
          const statusMessage =
            message ||
            `Your order (ID: ${order._id
              .toString()
              .substring(
                0,
                8
              )}...) status has been updated to: <strong>${newStatus.toUpperCase()}</strong>.`;

          // Status-specific email templates
          let emailSubject = `Order Status Update: ${newStatus.toUpperCase()}`;
          let emailHTML = '';

          // Create different email content based on status
          switch (newStatus.toLowerCase()) {
            case 'accepted':
            case 'confirmed':
              emailSubject =
                'Great News! Your Agape Catering Order is Confirmed';
              emailHTML = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
                  <h2 style="color: #5c6bc0;">Order Confirmed!</h2>
                  <p>Hello ${userName},</p>
                  <p>Wonderful news! Your order has been <strong>CONFIRMED</strong> and our team is getting ready to prepare your delicious food.</p>
                  <p>Order ID: <strong>${order._id
                    .toString()
                    .substring(0, 8)}...</strong></p>
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
                  <p>Order ID: <strong>${order._id
                    .toString()
                    .substring(0, 8)}...</strong></p>
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
                  <p>Order ID: <strong>${order._id
                    .toString()
                    .substring(0, 8)}...</strong></p>
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
                  <p>Order ID: <strong>${order._id
                    .toString()
                    .substring(0, 8)}...</strong></p>
                  <p>It was our pleasure to serve you. We'd love to hear your feedback about your experience.</p>
                  <p>With appreciation,<br>Agape Catering Team</p>
                </div>
              `;
              break;

            default:
              // Default template for any other status
              emailHTML = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
                  <h2 style="color: #FFEE00D0;">Order Status Update</h2>
                  <p>Hello ${userName},</p>
                  <p>${statusMessage}</p>
                  <p>Thank you for choosing Agape Catering!</p>
                  <p>For any questions, please contact us.</p>
                  <p>Regards,<br>Agape Catering Team</p>
                </div>
              `;
          }

          await sendEmail({
            to: emailTo,
            subject: emailSubject,
            html: emailHTML,
          });
          console.log(`Status update email sent to customer: ${emailTo}`);
          emailSent = true;
        } catch (err) {
          console.error('Error sending status update email:', err.message);
        }
      } else {
        console.log('Customer email not available for notification');
      }
    }

    res.status(200).json({
      message: 'Order status updated',
      order,
      notificationSent: emailSent,
      recipientEmail: emailTo,
    });
  } catch (error) {
    console.error('Error updating order status:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const notifyManager = (order) => {
  console.log(
    `🚨 Manager Notified: New Order from user ${order.userId} with ID ${order._id}`
  );
};

export const verifyPayment = async (req, res) => {
  try {
    const { tx_ref, transaction_id } = req.query;

    if (!tx_ref) {
      return res.status(400).json({
        success: false,
        message: 'Transaction reference is required',
      });
    }

    // Extract order ID from tx_ref (format: order_userId_timestamp)
    const orderId = tx_ref.split('_')[1];

    // Verify the transaction with Chapa (optional, can be added later)
    // const verificationResponse = await axios.get(
    //   `https://api.chapa.co/v1/transaction/verify/${transaction_id}`,
    //   {
    //     headers: {
    //       Authorization: `Bearer ${CHAPA_SECRET_KEY}`,
    //     },
    //   }
    // );

    // Find the order
    const order = await Order.findOne({
      _id: mongoose.Types.ObjectId.isValid(orderId) ? orderId : null,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Update payment status
    const previousPaymentStatus = order.paymentStatus;
    const remainingAmount = order.totalAmount - order.paidAmount;

    // If the remaining amount is 0 or very small (accounting for rounding errors)
    if (remainingAmount <= 1) {
      order.paymentStatus = 'paid';
    } else {
      order.paymentStatus = 'partially_paid';
    }

    // Add payment to history
    if (!order.paymentHistory) {
      order.paymentHistory = [];
    }

    order.paymentHistory.push({
      amount: remainingAmount,
      date: new Date(),
      transactionId: transaction_id || tx_ref,
      status: 'success',
    });

    // Update the paid amount
    order.paidAmount = order.totalAmount;

    await order.save();

    // Notify managers about the payment
    try {
      // Get all catering managers
      const managers = await userModel.find({
        role: { $in: ['Catering Manager', 'Executive Chef'] },
      });

      if (managers && managers.length > 0) {
        const { sendEmail } = await import('../utils/sendEmail.js');

        // Send notifications to managers
        for (const manager of managers) {
          await sendEmail({
            to: manager.email,
            subject: 'Payment Received for Order',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
                <h2 style="color: #5c6bc0;">Payment Notification</h2>
                <p>Hello ${manager.name},</p>
                <p>A payment has been received for order #${order._id
                  .toString()
                  .substring(0, 8)}...</p>
                <p><strong>Amount Paid:</strong> ${remainingAmount.toLocaleString(
                  'en-ET',
                  { style: 'currency', currency: 'ETB' }
                )}</p>
                <p><strong>Payment Status:</strong> ${order.paymentStatus}</p>
                <p>The order status is currently: <strong>${
                  order.orderStatus
                }</strong></p>
                <p>You can check the order details in the management dashboard.</p>
                <p>Regards,<br>Agape Catering System</p>
              </div>
            `,
          });
        }
      }
    } catch (notificationError) {
      console.error(
        'Failed to notify managers about payment:',
        notificationError
      );
      // Continue even if notification fails
    }

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      order: {
        _id: order._id,
        orderStatus: order.orderStatus,
        paymentStatus: order.paymentStatus,
        totalAmount: order.totalAmount,
        paidAmount: order.paidAmount,
        TypeOfOrder: order.TypeOfOrder,
        DeliveryDate: order.DeliveryDate,
      },
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

export const addPaymentRecord = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { amount, transactionId, paymentMethod } = req.body;

    if (!amount || amount <= 0) {
      return res
        .status(400)
        .json({ message: 'Valid payment amount is required' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Validate the payment amount doesn't exceed the remaining balance
    const remainingBalance = order.totalAmount - order.paidAmount;
    if (amount > remainingBalance) {
      return res.status(400).json({
        message: `Payment amount cannot exceed the remaining balance of ${remainingBalance}`,
      });
    }

    // Add to payment history
    if (!order.paymentHistory) {
      order.paymentHistory = [];
    }

    order.paymentHistory.push({
      amount,
      date: new Date(),
      transactionId: transactionId || `manual_${Date.now()}`,
      status: 'success',
      method: paymentMethod || 'manual',
      recordedBy: req.user._id,
    });

    // Update paid amount
    order.paidAmount += amount;

    // Update payment status
    if (order.paidAmount >= order.totalAmount) {
      order.paymentStatus = 'paid';
    } else {
      order.paymentStatus = 'partially_paid';
    }

    await order.save();

    res.status(200).json({
      message: 'Payment record added successfully',
      order: {
        _id: order._id,
        paymentStatus: order.paymentStatus,
        totalAmount: order.totalAmount,
        paidAmount: order.paidAmount,
        remainingBalance: order.totalAmount - order.paidAmount,
      },
    });
  } catch (error) {
    console.error('Error adding payment record:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
