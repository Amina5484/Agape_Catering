import orderModel from '../models/orderModel.js';
import userModel from '../models/userModel.js';
import Cart from '../models/cartModel.js';
import { processChapaPayment } from '../utils/chapaPayment.js';
import order from '../models/orderModel.js';

export const createOrder = async (req, res) => {
  try {
    const userId = req.user._id; 
    const Address = req.body.Address || "Test Address"; // Default address if not provided
    console.log(userId);

    // Get active cart for user
    const cart = await Cart.findOne({ userId, status: 'active' }).populate('items.menuItem');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Your cart is empty.' });
    }

    // Prepare order details
    const total = cart.subtotal;
    const amountToPayNow = +(total * 0.4).toFixed(2); // 40%
    console.log(cart)

    cart.items.forEach((item) => {
      console.log({
      itemId: item.menuItem._id,
      quantity: item.quantity,
      price: item.price,
      totalPrice: item.totalPrice,
      specialInstructions: item.specialInstructions,
      deliveryFee: item.deliveryFee,
      });
    });

    const orderItems = cart.items.map((item) => ({
      item: item.menuItem._id,
      quantity: item.quantity,
      price: item.price,
      totalPrice: item.totalPrice,
      specialInstructions: item.specialInstructions,
      deliveryFee: item.deliveryFee
    }));

    const newOrder = new order({
      userId,
      Address,
      menuItems: orderItems,
      totalAmount: total,
      paidAmount: 0,
      paymentStatus: 'pending',
      orderStatus: 'pending'
    });

    await newOrder.save();

    // Mark cart as ordered
    cart.status = 'ordered';
    await cart.save();

    // Notify manager (placeholder)
    notifyManager(newOrder);

    res.status(201).json({
      message: 'Order placed successfully. Please pay 40% to confirm.',
      orderId: newOrder._id,
      amountToPay: amountToPayNow
    });

  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Something went wrong.' });
  }
};

// Basic notify manager
const notifyManager = (order) => {
  console.log(`🚨 Manager Notified: New Order from user ${order.customerId} with ID ${order._id}`);
};


// 🛒 Place order with 50% initial payment
const placeOrder = async (req, res) => {
  try {
    const { userId, items,totalAmount } = req.body;

    if (!userId || !items  || !totalAmount) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const user = await userModel.findById(userId);
    console.log(user.name);
    if (!user) {
      return res.status(404).json({ message: 'user not found' });
    }


    const halfAmount = totalAmount / 1.8;

        console.log('first_name:', user.name);
    // Process half payment
    const chapaResponse = await processChapaPayment({
      amount: halfAmount,
      description: 'Initial 40% Payment',
      user: {
        first_name:  user.name.toString() || 'user',
        last_name:  user.name || '',
        email: user.email,
        phone_number: user.phone || '0911121314',
      },
    });
    console.log('chapaResponse:', chapaResponse);

    if (!chapaResponse.success || !chapaResponse.transactionId) {
      return res.status(400).json({
        message: 'Payment failed',
        error: chapaResponse.error || 'No transaction ID',
      });
    }

    // Save order
    const order = await orderModel.create({
      userId,
      items,
      totalAmount,
      paidAmount: halfAmount,
      paymentStatus: 'Half Paid',
      status: 'Pending',
      paymentTxRefs: [
        {
          tx_ref: chapaResponse.transactionId.tx_ref,
          amount: halfAmount,
        },
      ],
    });

    res.status(201).json({
      message:
        'Order placed with initial payment. Complete payment on delivery.',
      order,
      chapaResponse,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// 💰 Pay remaining 50% (on delivery)
const processFinalPayment = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await orderModel.findById(orderId).populate('customerId');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.paymentStatus !== 'Half Paid') {
      return res
        .status(400)
        .json({ message: 'Final payment not allowed at this stage' });
    }

    const remainingAmount = order.totalAmount - order.paidAmount;

    // Process remaining payment
    const chapaResponse = await processChapaPayment({
      amount: remainingAmount,
      description: 'Final 50% Payment on Delivery',
      user: {
        first_name: order.customerId.firstName || 'Customer',
        last_name: order.customerId.lastName || '',
        email: order.customerId.email,
        phone_number: order.customerId.phone || '0911121314',
      },
    });

    if (!chapaResponse.success || !chapaResponse.transactionId) {
      return res.status(400).json({
        message: 'Final payment failed',
        error: chapaResponse.error || 'No transaction ID',
      });
    }

    // Update order
    order.paidAmount += remainingAmount;
    order.paymentStatus = 'Paid';
    order.status = 'Completed';
    order.paymentTxRefs.push({
      tx_ref: chapaResponse.transactionId.tx_ref,
      amount: remainingAmount,
    });
    await order.save();

    res.status(200).json({
      message: 'Final payment successful and order completed',
      order,
      chapaResponse,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get user's orders
const getUserOrders = async (req, res) => {
  try {
    const { userId } = req.params;

    // Verify that the requesting user is the same as the userId in the params
    if (req.user._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view these orders',
      });
    }

    const orders = await orderModel
      .find({ customerId: userId })
      .sort({ createdAt: -1 }); // Sort by newest first

    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message,
    });
  }
};

// Get order details
const getOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await orderModel
      .findById(orderId)
      .populate('customerId', 'firstName lastName email phone');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Verify that the requesting user is the owner of the order
    if (req.user._id.toString() !== order.customerId._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this order',
      });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order details',
      error: error.message,
    });
  }
};

// Get all orders (for managers and admins)
const getAllOrders = async (req, res) => {
  try {
    const orders = await orderModel
      .find()
      .populate('customerId', 'firstName lastName email phone')
      .sort({ createdAt: -1 }); // Sort by newest first

    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error('Error fetching all orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message,
    });
  }
};

// Update order status (for managers and admins)
const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required',
      });
    }

    const order = await orderModel.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    order.status = status;
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      order,
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status',
      error: error.message,
    });
  }
};

// Checkout (placeholder)
const checkout = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart || cart.items.length === 0)
      return res.status(400).json({ message: 'Cart is empty' });

    cart.status = 'ordered';
    await cart.save();

    // TODO: create order, handle payment, etc.

    res.status(200).json({ message: 'Order placed successfully!' });
  } catch (err) {
    res.status(500).json({ message: 'Error during checkout', error: err });
  }
};


export {
  placeOrder,
  processFinalPayment,
  getUserOrders,
  getOrderDetails,
  getAllOrders,
  updateOrderStatus,

  // Checkout
  checkout
};
