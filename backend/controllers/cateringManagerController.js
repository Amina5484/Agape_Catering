import Menu from '../models/menu.js';
import Stock from '../models/stock.js';
import Schedule from '../models/schedule.js';
import Feedback from '../models/feedback.js';
import Food from '../models/foodmodel.js';
import order from '../models/orderModel.js';
import userModel from '../models/userModel.js';
import schedule from '../models/schedule.js';

export const addMenuItem = async (req, res) => {
  try {
    const { name, description, category, subcategory } = req.body;
    let subSubcategories = [];

    // Parse subSubcategories from the form data
    if (req.body.subSubcategories) {
      if (typeof req.body.subSubcategories === 'string') {
        subSubcategories = JSON.parse(req.body.subSubcategories);
      } else {
        subSubcategories = req.body.subSubcategories;
      }
    }

    // Ensure all required fields exist
    if (
      !name ||
      !description ||
      !category ||
      !subcategory ||
      !subSubcategories ||
      subSubcategories.length === 0
    ) {
      return res.status(400).json({
        message: 'All fields including subSubcategories are required',
      });
    }

    // Validate subSubcategories
    for (const subSub of subSubcategories) {
      if (!subSub.name || subSub.price === undefined || subSub.price === null) {
        return res
          .status(400)
          .json({ message: 'Each subSubcategory must have a name and price' });
      }
      if (isNaN(subSub.price) || Number(subSub.price) <= 0) {
        return res
          .status(400)
          .json({ message: 'Price must be a positive number' });
      }
      subSub.price = Number(subSub.price);
    }

    // Handle image path
    let image = null;
    if (req.file) {
      image = req.file.filename;
    }

    // Create menu item
    const menuItem = new Menu({
      name,
      description,
      category,
      subcategory,
      subSubcategories,
      image,
    });

    await menuItem.save();

    // Also add to Food collection for home page display
    const foodItem = new Food({
      name,
      description,
      category,
      subcategory,
      image,
      price: subSubcategories[0].price, // Use the first subSubcategory price as default
    });
    await foodItem.save();

    res.status(201).json({
      message: 'Menu item added successfully',
      menuItem: {
        ...menuItem.toObject(),
        image: image ? `/uploads/${image}` : null,
      },
    });
  } catch (error) {
    console.error('Error adding menu item:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const updateMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, category, subcategory, subSubcategories } =
      req.body;

    // Ensure all required fields exist
    if (
      !name ||
      !description ||
      !category ||
      !subcategory ||
      !subSubcategories
    ) {
      return res.status(400).json({
        message: 'All fields including subSubcategories are required',
      });
    }

    // Update menu item
    const updatedItem = await Menu.findByIdAndUpdate(
      id,
      { name, description, category, subcategory, subSubcategories },
      { new: true }
    );

    if (!updatedItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    // Also update in Food collection
    const foodItem = await Food.findOne({
      name: updatedItem.name,
      category: updatedItem.category,
    });

    if (foodItem) {
      await Food.findByIdAndUpdate(
        foodItem._id,
        { name, description, category, subcategory },
        { new: true }
      );
    }

    res.status(200).json({
      message: 'Menu item updated successfully',
      updatedItem,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};

export const deleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params;

    // Get menu item before deleting to find corresponding food item
    const menuItem = await Menu.findById(id);

    if (menuItem) {
      // Delete from Menu collection
      await Menu.findByIdAndDelete(id);

      // Also delete from Food collection
      await Food.findOneAndDelete({
        name: menuItem.name,
        category: menuItem.category,
      });
    }

    res.status(200).json({ message: 'Menu item deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};

export const getMenu = async (req, res) => {
  try {
    const menu = await Menu.find().select(
      'name description category subcategory subSubcategories image'
    );
    res.status(200).json(menu);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};

// STOCK MANAGEMENT
export const addStockItem = async (req, res) => {
  try {
    const { name, quantity, unit } = req.body;
    const stockItem = new Stock({ name, quantity, unit });
    await stockItem.save();
    res.status(201).json({ message: 'Stock item added', stockItem });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};

export const updateStockItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, initialQuantity } = req.body;

    // Calculate if stock is low (20% or less of initial quantity)
    const isLowStock = quantity <= (initialQuantity || quantity) * 0.2;

    const updatedStock = await Stock.findByIdAndUpdate(
      id,
      { ...req.body, isLowStock },
      { new: true }
    );

    res.status(200).json({
      message: 'Stock updated',
      updatedStock,
      isLowStock,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};

export const deleteStockItem = async (req, res) => {
  try {
    const { id } = req.params;
    await Stock.findByIdAndDelete(id);
    res.status(200).json({ message: 'Stock item deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};

export const getStock = async (req, res) => {
  try {
    const stock = await Stock.find();

    // Ensure each stock item has initialQuantity
    const stockWithInitialQuantity = stock.map((item) => ({
      ...item.toObject(),
      initialQuantity: item.initialQuantity || item.quantity,
    }));

    res.status(200).json({
      success: true,
      stock: stockWithInitialQuantity,
    });
  } catch (error) {
    console.error('Error fetching stock:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
};

export const listNewOrders = async (req, res) => {
  try {
    const newOrders = await order.find({ status: 'Pending' });
    res.status(200).json(newOrders);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};
// ORDER MANAGEMENT
export const acceptOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const {
      notifyCustomer,
      customerEmail,
      customerName,
      customerPhone,
      message,
    } = req.body;

    // Use the normalized status 'confirmed' instead of 'Accepted'
    const normalizedStatus = 'confirmed';

    // Update the order status - FIXING FIELD NAME FROM status TO orderStatus
    const updatedOrder = await order
      .findByIdAndUpdate(
        orderId,
        { orderStatus: normalizedStatus },
        { new: true }
      )
      .populate('userId', 'name email phone');

    if (!updatedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Handle customer notification if requested
    if (notifyCustomer) {
      try {
        // Get user email either from the request or from the order
        const userEmail = customerEmail || updatedOrder.userId?.email;
        const userName =
          customerName || updatedOrder.userId?.name || 'Customer';

        if (userEmail) {
          // Import sendEmail at the top of your file
          const { sendEmail } = await import('../utils/sendEmail.js');

          // Use the same email template as in updateOrderStatus for 'confirmed' status
          const emailSubject =
            'Great News! Your Agape Catering Order is Confirmed';
          const emailHTML = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
              <h2 style="color: #5c6bc0;">Order Confirmed!</h2>
              <p>Hello ${userName},</p>
              <p>Wonderful news! Your order has been <strong>CONFIRMED</strong> and our team is getting ready to prepare your delicious food.</p>
              <p>Order ID: <strong>${orderId.substring(0, 8)}...</strong></p>
              <p>We'll keep you updated as your order progresses. Thank you for choosing Agape Catering!</p>
              <p>With gratitude,<br>Agape Catering Team</p>
            </div>
          `;

          await sendEmail({
            to: userEmail,
            subject: emailSubject,
            html: emailHTML,
          });
        } else {
          console.log('Customer email not available for notification');
        }
      } catch (emailError) {
        console.error('Error sending notification email:', emailError);
        // Continue with order acceptance even if email fails
      }
    }

    res.status(200).json({
      message: 'Order accepted successfully',
      order: updatedOrder,
      notificationSent:
        notifyCustomer && updatedOrder.userId?.email ? true : false,
    });
  } catch (error) {
    console.error('Error accepting order:', error);
    res.status(500).json({ message: 'Server Error', error: error.toString() });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    // Normalize the status
    const normalizedStatus = status.toLowerCase();

    // Validate the status
    const validStatuses = [
      'pending',

      'confirmed',
      'preparing',
      'ready',
      'delivered',
      'cancelled',
    ];

    if (!validStatuses.includes(normalizedStatus)) {
      return res.status(400).json({ message: 'Invalid order status' });
    }

    // Find the order with populated user details
    const orderToUpdate = await order
      .findById(orderId)
      .populate('userId', 'name email phone');
    if (!orderToUpdate) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Update the orderStatus field (not status field)
    orderToUpdate.orderStatus = normalizedStatus;
    orderToUpdate.updatedAt = new Date();

    // Add to status history
    orderToUpdate.statusHistory.push({
      status: normalizedStatus,
      updatedBy: req.user?._id || null,
      timestamp: new Date(),
    });

    await orderToUpdate.save();

    console.log(
      `Order status updated from ${orderToUpdate.orderStatus} to ${normalizedStatus} for order ${orderId}`
    );

    // Special handling for "ready" status - Payment Email
    let paymentEmailSent = false;
    if (normalizedStatus === 'ready') {
      try {
        const remainingAmount =
          orderToUpdate.totalAmount - orderToUpdate.paidAmount;
        if (remainingAmount > 0 && orderToUpdate.userId?.email) {
          // Import required modules
          const { sendEmail } = await import('../utils/sendEmail.js');
          const axios = await import('axios');

          // Generate payment link with Chapa
          let paymentUrl = '';
          try {
            // Create a unique transaction reference
            const txRef = `order_${orderId}_${Date.now()}`;

            // Prepare Chapa payment data - simplified to essential fields
            const chapaPaymentData = {
              amount: remainingAmount,
              currency: 'ETB',
              email: orderToUpdate.userId.email,
              first_name: 'Customer',
              last_name: '',
              tx_ref: txRef,
              callback_url: 'http://localhost:3000/payment-success',
              return_url: 'http://localhost:3000/payment-success',
              customization: {
                title: 'Agape Catering Payment',
                description: `Order #${orderId.substring(0, 8)}`,
              },
            };

            // Get the CHAPA_SECRET_KEY - hardcoding test key for reliability
            const CHAPA_SECRET_KEY =
              'CHASECK_TEST-g8OwwgOV3J3P4EzUcm7gbqCWoeQqnOP2';

            // Direct API call to Chapa
            console.log('Sending Chapa payment request...');
            const chapaResponse = await axios.default.post(
              'https://api.chapa.co/v1/transaction/initialize',
              chapaPaymentData,
              {
                headers: {
                  Authorization: `Bearer ${CHAPA_SECRET_KEY}`,
                  'Content-Type': 'application/json',
                },
              }
            );

            console.log('Chapa response received:', chapaResponse.data);

            if (chapaResponse.data?.data?.checkout_url) {
              paymentUrl = chapaResponse.data.data.checkout_url;
              console.log('SUCCESS - Payment URL generated:', paymentUrl);
            } else {
              console.error(
                'ERROR - No checkout_url in Chapa response',
                chapaResponse.data
              );
            }
          } catch (paymentError) {
            console.error(
              'ERROR generating payment URL:',
              paymentError.message
            );
            // Continue without payment link if there's an error
          }

          // Create simplified email with payment button
          const userName = orderToUpdate.userId?.name || 'Customer';
          const userEmail = orderToUpdate.userId?.email;

          let emailHTML = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
              <h2 style="color: #5c6bc0;">Complete Your Payment</h2>
              <p>Hello ${userName},</p>
              <p>Your order is ready! Please complete the remaining payment of <strong>${remainingAmount.toLocaleString(
                'en-ET'
              )} ETB</strong> to receive your order.</p>
          `;

          // Add payment button if URL was generated
          if (paymentUrl) {
            emailHTML += `
              <div style="text-align: center; margin: 30px 0;">
                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                  <tr>
                    <td align="center">
                      <table border="0" cellspacing="0" cellpadding="0">
                        <tr>
                          <td align="center" style="border-radius: 5px;" bgcolor="#4CAF50">
                            <a href="${paymentUrl}" target="_blank" style="font-size: 20px; font-family: Helvetica, Arial, sans-serif; color: #ffffff; text-decoration: none; padding: 15px 30px; border: 1px solid #4CAF50; display: inline-block; font-weight: bold; border-radius: 5px;">COMPLETE PAYMENT NOW</a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </div>
              <p style="text-align: center;">If the button doesn't work, copy and paste this link into your browser:</p>
              <p style="text-align: center; word-break: break-all;"><a href="${paymentUrl}">${paymentUrl}</a></p>
            `;
          } else {
            emailHTML += `
              <p>Please complete your payment when you pick up your order.</p>
            `;
          }

          emailHTML += `
              <p>Thank you for choosing Agape Catering!</p>
              <p>Best regards,<br>Agape Catering Team</p>
            </div>
          `;

          await sendEmail({
            to: userEmail,
            subject: 'Complete Payment for Your Order',
            html: emailHTML,
          });

          console.log(
            `Payment email sent to ${userEmail} with payment URL: ${
              paymentUrl || 'NONE'
            }`
          );
          paymentEmailSent = true;
        }
      } catch (paymentEmailError) {
        console.error('Error sending payment email:', paymentEmailError);
        // Continue with status update even if payment email fails
      }
    }

    // Always send status notification email to the customer
    let notificationSent = false;
    try {
      const customerEmail = orderToUpdate.userId?.email;
      const customerName = orderToUpdate.userId?.name || 'Customer';

      if (customerEmail) {
        // Import sendEmail
        const { sendEmail } = await import('../utils/sendEmail.js');

        // Create email content based on status
        let emailSubject, emailHTML;

        switch (normalizedStatus) {
          case 'accepted':
          case 'confirmed':
            emailSubject = 'Your Order has been Accepted';
            emailHTML = `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
                <h2 style="color: #5c6bc0;">Order Accepted!</h2>
                <p>Hello ${customerName},</p>
                <p>Great news! Your order has been accepted and our team is preparing to serve you.</p>
                <p>Order ID: <strong>${orderId.substring(0, 8)}...</strong></p>
                <p>We'll keep you updated on your order's progress.</p>
                <p>Thank you for choosing Agape Catering!</p>
                <p>Best regards,<br>Agape Catering Team</p>
              </div>
            `;
            break;
          case 'preparing':
            emailSubject = 'Your Order is Being Prepared';
            emailHTML = `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
                <h2 style="color: #5c6bc0;">Order in Progress</h2>
                <p>Hello ${customerName},</p>
                <p>Our chefs are now preparing your order with care.</p>
                <p>Order ID: <strong>${orderId.substring(0, 8)}...</strong></p>
                <p>We'll notify you when your order is ready for delivery.</p>
                <p>Thank you for your patience!</p>
                <p>Warm regards,<br>Agape Catering Team</p>
              </div>
            `;
            break;
          case 'ready':
            emailSubject = 'Your Order is Ready for Delivery';
            emailHTML = `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
                <h2 style="color: #5c6bc0;">Order Ready!</h2>
                <p>Hello ${customerName},</p>
                <p>Great news! Your order is ready and will be delivered soon.</p>
                <p>Order ID: <strong>${orderId.substring(0, 8)}...</strong></p>
                <p>Our delivery team will contact you shortly.</p>
                ${
                  orderToUpdate.totalAmount - orderToUpdate.paidAmount > 0
                    ? `<p><strong>Note:</strong> There is a remaining balance to be paid. Please check your email for payment details.</p>`
                    : ''
                }
                <p>Thank you for choosing Agape Catering!</p>
                <p>Best regards,<br>Agape Catering Team</p>
              </div>
            `;
            break;
          case 'delivered':
            emailSubject = 'Your Order has been Delivered';
            emailHTML = `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
                <h2 style="color: #5c6bc0;">Order Delivered!</h2>
                <p>Hello ${customerName},</p>
                <p>Your order has been successfully delivered.</p>
                <p>Order ID: <strong>${orderId.substring(0, 8)}...</strong></p>
                <p>We hope you enjoy your meal!</p>
                <p>Thank you for choosing Agape Catering!</p>
                <p>Best regards,<br>Agape Catering Team</p>
              </div>
            `;
            break;
          case 'cancelled':
            emailSubject = 'Your Order has been Cancelled';
            emailHTML = `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
                <h2 style="color: #5c6bc0;">Order Cancelled</h2>
                <p>Hello ${customerName},</p>
                <p>We regret to inform you that your order has been cancelled.</p>
                <p>Order ID: <strong>${orderId.substring(0, 8)}...</strong></p>
                <p>If you have any questions, please contact our customer service.</p>
                <p>Sincerely,<br>Agape Catering Team</p>
              </div>
            `;
            break;
          default:
            emailSubject = `Order Status Update: ${normalizedStatus.toUpperCase()}`;
            emailHTML = `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
                <h2 style="color: #5c6bc0;">Order Status Update</h2>
                <p>Hello ${customerName},</p>
                <p>Your order status has been updated to: <strong>${normalizedStatus.toUpperCase()}</strong></p>
                <p>Order ID: <strong>${orderId.substring(0, 8)}...</strong></p>
                <p>Thank you for choosing Agape Catering!</p>
                <p>Best regards,<br>Agape Catering Team</p>
              </div>
            `;
        }

        // Send the email
        await sendEmail({
          to: customerEmail,
          subject: emailSubject,
          html: emailHTML,
        });

        console.log(`Status update email sent to customer: ${customerEmail}`);
        notificationSent = true;
      } else {
        console.log('Customer email not found for notification');
      }
    } catch (emailError) {
      console.error('Error sending notification email:', emailError);
      // Continue with status update even if email fails
    }

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      order: orderToUpdate,
      notificationSent: notificationSent,
      paymentEmailSent: paymentEmailSent,
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.toString(),
    });
  }
};

export const updateOrderScheduleStatus = async (req, res) => {
  try {
    const { scheduleId } = req.params;
    const { status } = req.body;

    const validStatuses = ['preparing', 'completed'];

    // Validate the status
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid schedule status' });
    }

    // Find the schedule by ID
    const scheduleStatus = await Schedule.findById(scheduleId);
    if (!scheduleStatus) {
      return res.status(404).json({ message: 'Schedule not found' });
    }

    // Update the status
    scheduleStatus.status = status;
    await scheduleStatus.save();

    res.status(200).json({
      message: 'Schedule status updated successfully',
      schedule: scheduleStatus,
    });
  } catch (error) {
    console.error('Error updating schedule status:', error);
    res.status(500).json({ message: 'Server Error', error: error.toString() });
  }
};

// CHEF SCHEDULING
export const assignSchedule = async (req, res) => {
  console.log('Assigning schedule with request body:', req.body);
  try {
    const { chefId, date, orderId } = req.body;
    const findOrder = await order.findById(orderId);
    if (!findOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }
    findOrder.assignedToChef = chefId;
    await findOrder.save();
    // Check if the chef is already scheduled for that date and time
    // const existingSchedule = await Schedule.findOne({
    //   chefId,

    //   date,
    //   findOrder,
    // });
    // if (existingSchedule) {
    //   return res.status(400).json({
    //     message: 'Chef is already scheduled for this date and time',
    //   });
    // }
    // Create a new schedule entry
    const schedule = new Schedule({
      chefId,

      date,
      orders: findOrder,
    });
    await schedule.save();
    res.status(201).json({ message: 'Schedule assigned', schedule });
  } catch (error) {
    console.error('Error assigning schedule:', error);
    res.status(500).json({ message: 'Server Error', error });
  }
};
export const getSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.find().populate({
      path: 'orders',
      populate: {
        path: 'menuItems.item',
        model: 'Menu',
      },
    });
    res.status(200).json(schedule);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};
export const updateSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const { chefId, date, orderId } = req.body;

    // Find the schedule by ID
    const schedule = await Schedule.findById(id);
    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }

    // Check if the order exists
    const findOrder = await order.findById(orderId);
    if (!findOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if the chef is already scheduled for the new date and time
    // const existingSchedule = await Schedule.findOne({
    //   chefId,
    //   shiftTime,
    //   date,
    //   _id: { $ne: id }, // Exclude the current schedule being updated
    // });
    // if (existingSchedule) {
    //   return res.status(400).json({
    //     message: 'Chef is already scheduled for this date and time',
    //   });
    // }

    // Update the schedule
    schedule.chefId = chefId;
    // schedule.shiftTime = shiftTime;
    schedule.date = date;
    schedule.orders = findOrder;

    await schedule.save();

    res
      .status(200)
      .json({ message: 'Schedule updated successfully', schedule });
  } catch (error) {
    console.error('Error updating schedule:', error);
    res.status(500).json({ message: 'Server Error', error });
  }
};
export const deleteSchedule = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the schedule by ID
    const schedule = await Schedule.findById(id);
    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }

    // Delete the schedule
    await Schedule.findByIdAndDelete(id);

    res.status(200).json({ message: 'Schedule deleted successfully' });
  } catch (error) {
    console.error('Error deleting schedule:', error);
    res.status(500).json({ message: 'Server Error', error });
  }
};

// VIEW CUSTOMER LOCATION
export const viewCustomerLocation = async (req, res) => {
  try {
    const { customerId } = req.params;
    const customer = await order
      .findOne({ customerId })
      .populate('customer', 'location');
    res.status(200).json(customer?.customer?.location || {});
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};

// VIEW FEEDBACK
export const viewFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.find();
    res.status(200).json(feedback);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};

// GENERATE REPORT
export const generateReport = async (req, res) => {
  try {
    const orders = await order.find();
    const stock = await Stock.find();
    res.status(200).json({ orders, stock });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};

export const cleanupOrderFields = async (req, res) => {
  try {
    // Remove the specified fields from all orders
    const result = await order.updateMany(
      {},
      {
        $unset: {
          preparationInstructions: '',
          assignedAt: null,
          assignedBy: null,
        },
      }
    );

    res.status(200).json({
      success: true,
      message: 'Fields removed successfully',
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error('Error removing fields:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing fields',
      error: error.toString(),
    });
  }
};
