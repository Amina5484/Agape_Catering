import Menu from '../models/menu.js';
import Stock from '../models/stock.js';
import order from '../models/orderModel.js';
//import Order from '../models/order.js';
// import Schedule from '../models/schedule.js';
// import Feedback from '../models/feedback.js';


export const getMenu = async (req, res) => {
    try {
        const menu = await Menu.find().select('name price description category subcategory image');
        res.status(200).json(menu);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
};

// // STOCK MANAGEMENT
// export const addStockItem = async (req, res) => {
//     try {
//         const { name, quantity, unit } = req.body;
//         const stockItem = new Stock({ name, quantity, unit });
//         await stockItem.save();
//         res.status(201).json({ message: "Stock item added", stockItem });
//     } catch (error) {
//         res.status(500).json({ message: "Server Error", error });
//     }
// };

// export const updateStockItem = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const updatedStock = await Stock.findByIdAndUpdate(id, req.body, { new: true });
//         res.status(200).json({ message: "Stock updated", updatedStock });
//     } catch (error) {
//         res.status(500).json({ message: "Server Error", error });
//     }
// };

// export const deleteStockItem = async (req, res) => {
//     try {
//         const { id } = req.params;
//         await Stock.findByIdAndDelete(id);
//         res.status(200).json({ message: "Stock item deleted" });
//     } catch (error) {
//         res.status(500).json({ message: "Server Error", error });
//     }
// };

// export const getStock = async (req, res) => {
//     try {
//         const stock = await Stock.find();
//         res.status(200).json(stock);
//     } catch (error) {
//         res.status(500).json({ message: "Server Error", error });
//     }
// };

// export const getCurrentOrder = async (req, res) => {
//     console.log(req.user._id);
//     try {
//         if (!req.user._id) {
//             return res.status(400).json({ message: "User ID not found" });
//         }
//         const { userId } = req.user;
//         console.log(userId);
//         const userOrder = await order.findOne({ userId }).populate('items.itemId', 'name price '); // Populate with menu item details
//         if (!userOrder) {
//             return res.status(404).json({ message: "No current order found" });
//         }
//         res.status(200).json(userOrder);
//     } catch (error) {
//         res.status(500).json({ message: "Server Error", error });
//     }
// }
export const getCurrentOrder = async (req, res) => {
    try {
      const userId = req.user.id; // Assuming req.user is populated by middleware
  
      const currentOrder = await order.findOne({
        userId,
        orderStatus: { $nin: ['delivered', 'cancelled'] },
      }).populate('menuItems.item', 'name price');
  
      if (!currentOrder) {
        return res.status(404).json({ message: 'No current active order found' });
      }
  
      res.status(200).json(currentOrder);
    } catch (error) {
      console.error('Error getting current order:', error);
      res.status(500).json({ message: 'Server Error', error });
    }
  };

  export const getOrderHistory = async (req, res) => {
    try {
      const userId = req.user.id;
  
      const pastOrders = await order.find({
        userId,
        orderStatus: { $in: ['ready','delivered', 'cancelled'] },
      }).sort({ createdAt: -1 }).populate('menuItems.item', 'name price');
  
      res.status(200).json(pastOrders);
    } catch (error) {
      console.error('Error fetching order history:', error);
      res.status(500).json({ message: 'Server Error', error });
    }
  };
  export const OrderCancel= async (req, res) => {
    try {
      const userId = req.user.id;
  const { orderId } = req.body;

  const updatedOrder = await order.findOneAndUpdate(
    { _id: orderId, userId, orderStatus: { $nin: ['delivered', 'cancelled'] } },
    { orderStatus: 'cancelled' },
    { new: true }
  );
console.log(updatedOrder);
  if (!updatedOrder) {
    return res.status(404).json({ message: 'Order not found or cannot be cancelled' });
  }

  res.status(200).json({ message: 'Order cancelled successfully', updatedOrder });
      
    } catch (error) {
      console.error('Error fetching order history:', error);
      res.status(500).json({ message: 'Server Error', error });
    }
  };
  

