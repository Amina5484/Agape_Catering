import userModel from '../models/userModel.js';
import Cart from '../models/cartModel.js';
import order from '../models/orderModel.js';
import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const CHAPA_SECRET_KEY = process.env.CHAPA_SECRET_KEY;

export const createOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    const { Address, DeliveryDate, TypeOfOrder } = req.body;
    if (!Address || !DeliveryDate || !TypeOfOrder) {
      return res.status(400).json({ message: 'Address, DeliveryDate, and TypeOfOrder are required.' });
    }
    if (
      TypeOfOrder === 'scheduled' &&
      new Date(DeliveryDate) <= new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
    ) {
      return res
        .status(400)
        .json({ message: 'Scheduled delivery date must be at least 14 days in the future.' });
    }

    const cart = await Cart.findOne({ userId }).populate('items.menuItem');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Your cart is empty.' });
    }

    const total = cart.subtotal;
    const amountToPayNow = +(total * 0.4).toFixed(2);

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // 1. Initialize Chapa Payment
    const chapaPaymentData = {
      amount: amountToPayNow,
      currency: 'ETB',
      email: user.email,
      first_name: user.name || 'User',
      last_name: '',
      phone: user.phone || '0911121314',
      tx_ref: `order_${userId}_${Date.now()}`,
      callback_url: 'http://localhost:4000/payment-success',
      return_url: 'http://localhost:4000/payment-success',
    };

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

    const checkout_url = chapaResponse?.data?.data?.checkout_url;
    if (!checkout_url) {
      throw new Error('Failed to initialize payment');
    }

    // 2. Create order only if payment initialization is successful
    const orderItems = cart.items.map((item) => ({
      item: item.menuItem._id,
      quantity: item.quantity,
      price: item.price,
      totalPrice: item.totalPrice,
      specialInstructions: item.specialInstructions,
      deliveryFee: item.deliveryFee,
    }));

    const newOrder = new order({
      userId,
      Address,
      DeliveryDate,
      TypeOfOrder,
      menuItems: orderItems,
      totalAmount: total,
      paidAmount: 0,
      paymentStatus: 'pending',
      orderStatus: 'pending',
    });

    await newOrder.save();

    // 3. Update user’s previous orders
    const previousOrder = {
      items: orderItems,
      orderDate: new Date(),
      totalAmount: total,
    };

    user.previousOrders = user.previousOrders || [];
    user.previousOrders.push(previousOrder);
    await user.save();

    // 4. Clear cart and mark as ordered
    cart.items = [];
    cart.status = 'ordered';
    await cart.save();

    // 5. Notify manager
    notifyManager(newOrder);

    // 6. Return payment URL
    res.status(201).json({
      message: 'Order placed successfully. Please pay 40% to confirm.',
      orderId: newOrder._id,
      amountToPay: amountToPayNow,
      payment_url: checkout_url,
    });
  } catch (error) {
    console.error('Error creating order:', error.response?.data || error.message);
    res.status(500).json({ message: 'Something went wrong.', error: error.message });
  }
};


// Basic notify manager
const notifyManager = (order) => {

  console.log(`🚨 Manager Notified: New Order from user ${order.userId} with ID ${order._id}`);
};


// // 🛒 Place order with 50% initial payment
// const placeOrder = async (req, res) => {
//   try {
//     const { userId, items,totalAmount } = req.body;

//     if (!userId || !items  || !totalAmount) {
//       return res.status(400).json({ message: 'Missing required fields' });
//     }

//     const user = await userModel.findById(userId);
//     console.log(user.name);
//     if (!user) {
//       return res.status(404).json({ message: 'user not found' });
//     }


//     const halfAmount = totalAmount / 1.8;

//         console.log('first_name:', user.name);
//     // Process half payment
//     const chapaResponse = await processChapaPayment({
//       amount: halfAmount,
//       description: 'Initial 40% Payment',
//       user: {
//         first_name:  user.name.toString() || 'user',
//         last_name:  user.name || '',
//         email: user.email,
//         phone_number: user.phone || '0911121314',
//       },
//     });
//     console.log('chapaResponse:', chapaResponse);

//     if (!chapaResponse.success || !chapaResponse.transactionId) {
//       return res.status(400).json({
//         message: 'Payment failed',
//         error: chapaResponse.error || 'No transaction ID',
//       });
//     }

//     // Save order
//     const order = await orderModel.create({
//       userId,
//       items,
//       totalAmount,
//       paidAmount: halfAmount,
//       paymentStatus: 'Half Paid',
//       status: 'Pending',
//       paymentTxRefs: [
//         {
//           tx_ref: chapaResponse.transactionId.tx_ref,
//           amount: halfAmount,
//         },
//       ],
//     });

//     res.status(201).json({
//       message:
//         'Order placed with initial payment. Complete payment on delivery.',
//       order,
//       chapaResponse,
//     });
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// };

// // 💰 Pay remaining 50% (on delivery)
// const processFinalPayment = async (req, res) => {
//   try {
//     const { orderId } = req.params;

//     const order = await orderModel.findById(orderId).populate('customerId');
//     if (!order) {
//       return res.status(404).json({ message: 'Order not found' });
//     }

//     if (order.paymentStatus !== 'Half Paid') {
//       return res
//         .status(400)
//         .json({ message: 'Final payment not allowed at this stage' });
//     }

//     const remainingAmount = order.totalAmount - order.paidAmount;

//     // Process remaining payment
//     const chapaResponse = await processChapaPayment({
//       amount: remainingAmount,
//       description: 'Final 50% Payment on Delivery',
//       user: {
//         first_name: order.customerId.firstName || 'Customer',
//         last_name: order.customerId.lastName || '',
//         email: order.customerId.email,
//         phone_number: order.customerId.phone || '0911121314',
//       },
//     });

//     if (!chapaResponse.success || !chapaResponse.transactionId) {
//       return res.status(400).json({
//         message: 'Final payment failed',
//         error: chapaResponse.error || 'No transaction ID',
//       });
//     }

//     // Update order
//     order.paidAmount += remainingAmount;
//     order.paymentStatus = 'Paid';
//     order.status = 'Completed';
//     order.paymentTxRefs.push({
//       tx_ref: chapaResponse.transactionId.tx_ref,
//       amount: remainingAmount,
//     });
//     await order.save();

//     res.status(200).json({
//       message: 'Final payment successful and order completed',
//       order,
//       chapaResponse,
//     });
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// };

// // Get user's orders
// const getUserOrders = async (req, res) => {
//   try {
//     const { userId } = req.params;

//     // Verify that the requesting user is the same as the userId in the params
//     if (req.user._id.toString() !== userId) {
//       return res.status(403).json({
//         success: false,
//         message: 'You are not authorized to view these orders',
//       });
//     }

//     const orders = await orderModel
//       .find({ customerId: userId })
//       .sort({ createdAt: -1 }); // Sort by newest first

//     res.status(200).json({
//       success: true,
//       orders,
//     });
//   } catch (error) {
//     console.error('Error fetching user orders:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch orders',
//       error: error.message,
//     });
//   }
// };

// // Get order details
// const getOrderDetails = async (req, res) => {
//   try {
//     const { orderId } = req.params;

//     const order = await orderModel
//       .findById(orderId)
//       .populate('customerId', 'firstName lastName email phone');

//     if (!order) {
//       return res.status(404).json({
//         success: false,
//         message: 'Order not found',
//       });
//     }

//     // Verify that the requesting user is the owner of the order
//     if (req.user._id.toString() !== order.customerId._id.toString()) {
//       return res.status(403).json({
//         success: false,
//         message: 'You are not authorized to view this order',
//       });
//     }

//     res.status(200).json({
//       success: true,
//       order,
//     });
//   } catch (error) {
//     console.error('Error fetching order details:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch order details',
//       error: error.message,
//     });
//   }
// };

// // Get all orders (for managers and admins)
// const getAllOrders = async (req, res) => {
//   try {
//     const orders = await orderModel
//       .find()
//       .populate('customerId', 'firstName lastName email phone')
//       .sort({ createdAt: -1 }); // Sort by newest first

//     res.status(200).json({
//       success: true,
//       orders,
//     });
//   } catch (error) {
//     console.error('Error fetching all orders:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch orders',
//       error: error.message,
//     });
//   }
// };

// // Update order status (for managers and admins)
// const updateOrderStatus = async (req, res) => {
//   try {
//     const { orderId } = req.params;
//     const { status } = req.body;

//     if (!status) {
//       return res.status(400).json({
//         success: false,
//         message: 'Status is required',
//       });
//     }

//     const order = await orderModel.findById(orderId);

//     if (!order) {
//       return res.status(404).json({
//         success: false,
//         message: 'Order not found',
//       });
//     }

//     order.status = status;
//     await order.save();

//     res.status(200).json({
//       success: true,
//       message: 'Order status updated successfully',
//       order,
//     });
//   } catch (error) {
//     console.error('Error updating order status:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to update order status',
//       error: error.message,
//     });
//   }
// };

// // Checkout (placeholder)
// const checkout = async (req, res) => {
//   try {
//     const cart = await Cart.findOne({ userId: req.user._id });
//     if (!cart || cart.items.length === 0)
//       return res.status(400).json({ message: 'Cart is empty' });

//     cart.status = 'ordered';
//     await cart.save();

//     // TODO: create order, handle payment, etc.

//     res.status(200).json({ message: 'Order placed successfully!' });
//   } catch (err) {
//     res.status(500).json({ message: 'Error during checkout', error: err });
//   }
// };


export {
  // placeOrder,
  // processFinalPayment,
  // getUserOrders,
  // getOrderDetails,
  // getAllOrders,
  // updateOrderStatus,

  // Checkout
  // createOrder,
};
