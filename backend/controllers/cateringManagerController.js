import Menu from '../models/menu.js';
import Stock from '../models/stock.js';
import Schedule from '../models/schedule.js';
import Feedback from '../models/feedback.js';
import Food from '../models/foodmodel.js';
import order from '../models/orderModel.js';
import userModel from '../models/userModel.js';

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
    const {
      status,
      notifyCustomer,
      customerEmail,
      customerName,
      customerPhone,
      message,
    } = req.body;

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

    // Special handling for "ready" status to notify for remaining payment
    if (normalizedStatus === 'ready') {
      // Get order details with populated menu items
      const orderData = await order
        .findById(orderId)
        .populate('menuItems.item');
      if (!orderData) {
        return res.status(404).json({ message: 'Order not found' });
      }

      // Check if there's a remaining payment due
      const remainingAmount = orderData.totalAmount - orderData.paidAmount;
      if (remainingAmount > 0) {
        // Get user details
        const user = await userModel.findById(orderData.userId);
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }

        try {
          // Import required modules
          const { sendEmail } = await import('../utils/sendEmail.js');
          const orderSecondPaymentEmailHTML = (
            await import('../email_templates/orderSecondPaymentEmailHTML.js')
          ).default;
          const axios = (await import('axios')).default;

          // Initialize Chapa payment
          const chapaPaymentData = {
            amount: remainingAmount,
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
          };

          // Make API call to Chapa
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

          // Get payment URL
          const paymentUrl = chapaResponse.data?.data?.checkout_url;
          if (!paymentUrl) {
            console.error('Payment URL not received from Chapa');
          } else {
            // Format order date
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

            // Send payment email
            await sendEmail({
              to: user.email,
              subject: 'Your Order is Ready for Pickup - Payment Required',
              html: orderSecondPaymentEmailHTML(
                user.name,
                orderId,
                order_date,
                orderData.menuItems,
                orderData.totalAmount,
                orderData.paidAmount,
                remainingAmount,
                paymentUrl
              ),
            });
            console.log('==============================================');
            console.log(`Payment request email sent to: ${user.email}`);
            console.log('==============================================');

            orderData.paymentHistory.push({
              recordedBy: user._id,
              amount: remainingAmount,
              date: new Date(),
              transactionId: chapaResponse.data.data.tx_ref || `txn_${Date.now()}`,
              status: 'success',
              method: 'chapa',
              paymentType: 'Full',
              paymentDescription: 'Remaining payment for order',
            });

            console.log('==============================================');
            console.log('Payment history added to order:', orderData.paymentHistory);
            console.log('==============================================');

            orderData.status = 'paid'; // Set status to paid after processing payment

            // Save the updated order
            await orderData.save();
          }
            // Add payment history to the order
            
        } catch (paymentError) {
          console.error('Error processing payment notification:', paymentError);
          // Continue with status update even if payment notification fails
        }
      }
    }

    // Update the order status
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

    console.log('Updated order status:', {
      previousStatus: status,
      newStatus: updatedOrder.orderStatus,
      orderId,
    });

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
                  <p>If you have any remaining balance to pay, you will receive a separate email with payment instructions.</p>
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

          console.log(`Status update email sent to: ${userEmail}`);

        } else {
          console.log('Customer email not available for notification');
        }
      } catch (emailError) {
        console.error('Error sending notification email:', emailError);
        // Continue with status update even if email fails
      }
    }

    res.status(200).json({
      message: 'Order status updated successfully',
      order: updatedOrder,
      notificationSent:
        notifyCustomer && updatedOrder.userId?.email ? true : false,
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Server Error', error: error.toString() });
  }
};

// CHEF SCHEDULING
export const assignSchedule = async (req, res) => {
  console.log('Assigning schedule with request body:', req.body);
  try {
    const { chefId, shiftTime, date, orderId } = req.body;
    const findOrder = await order.findById(orderId);
    if (!findOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }
    // Check if the chef is already scheduled for that date and time
    const existingSchedule = await Schedule.findOne({
      chefId,
      shiftTime,
      date,
      findOrder,
    });
    if (existingSchedule) {
      return res.status(400).json({
        message: 'Chef is already scheduled for this date and time',
      });
    }
    // Create a new schedule entry
    const schedule = new Schedule({ chefId, shiftTime, date, orders:findOrder }); 
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
    const { chefId, shiftTime, date, orderId } = req.body;

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
    const existingSchedule = await Schedule.findOne({
      chefId,
      shiftTime,
      date,
      _id: { $ne: id }, // Exclude the current schedule being updated
    });
    if (existingSchedule) {
      return res.status(400).json({
        message: 'Chef is already scheduled for this date and time',
      });
    }

    // Update the schedule
    schedule.chefId = chefId;
    schedule.shiftTime = shiftTime;
    schedule.date = date;
    schedule.orders = findOrder;

    await schedule.save();

    res.status(200).json({ message: 'Schedule updated successfully', schedule });
  } catch (error) {
    console.error('Error updating schedule:', error);
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
