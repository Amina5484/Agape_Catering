import Menu from '../models/menu.js';
import Stock from '../models/stock.js';
import Order from '../models/order.js';
import Schedule from '../models/schedule.js';
import Feedback from '../models/feedback.js';
import category_router from '../routes/categoryRoute.js';

export const addMenuItem = async (req, res) => {

    try {
        console.log("Request Body:", req.body); // Debugging log
        console.log("Uploaded File:", req.file); // Debugging log

        const { name, price, description, category } = req.body;

        // Ensure all required fields exist
        if (!name || !price || !description || !category) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const image = req.file ? `/uploads/${req.file.filename}` : null;

        const menuItem = new Menu({ name, price, description, category, image });
        await menuItem.save();

        res.status(201).json({ message: "Menu item added successfully", menuItem });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error", error });
    }
};

export const updateMenuItem = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedItem = await Menu.findByIdAndUpdate(id, req.body, { new: true });
        res.status(200).json({ message: "Menu item updated", updatedItem });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
};

export const deleteMenuItem = async (req, res) => {
    try {
        const { id } = req.params;
        await Menu.findByIdAndDelete(id);
        res.status(200).json({ message: "Menu item deleted" });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
};

export const getMenu = async (req, res) => {
    try {
        const menu = await Menu.find();
        res.status(200).json(menu);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
};

// STOCK MANAGEMENT
export const addStockItem = async (req, res) => {
    try {
        const { name, quantity, unit } = req.body;
        const stockItem = new Stock({ name, quantity, unit });
        await stockItem.save();
        res.status(201).json({ message: "Stock item added", stockItem });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
};

export const updateStockItem = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedStock = await Stock.findByIdAndUpdate(id, req.body, { new: true });
        res.status(200).json({ message: "Stock updated", updatedStock });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
};

export const deleteStockItem = async (req, res) => {
    try {
        const { id } = req.params;
        await Stock.findByIdAndDelete(id);
        res.status(200).json({ message: "Stock item deleted" });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
};

export const getStock = async (req, res) => {
    try {
        const stock = await Stock.find();
        res.status(200).json(stock);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
};

// ORDER MANAGEMENT
export const acceptOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await Order.findByIdAndUpdate(orderId, { status: "Accepted" }, { new: true });
        res.status(200).json({ message: "Order accepted", order });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
};

export const updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;
        const order = await Order.findByIdAndUpdate(orderId, { status }, { new: true });
        res.status(200).json({ message: "Order status updated", order });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
};

// CHEF SCHEDULING
export const assignSchedule = async (req, res) => {
    try {
        const { chefId, shiftTime, date } = req.body;
        const schedule = new Schedule({ chefId, shiftTime, date });
        await schedule.save();
        res.status(201).json({ message: "Schedule assigned", schedule });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
};
export const getSchedule = async (req, res) => {
    try {
        const schedule = await Schedule.find();
        res.status(200).json(schedule);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
};

// VIEW CUSTOMER LOCATION
export const viewCustomerLocation = async (req, res) => {
    try {
        const { customerId } = req.params;
        const customer = await Order.findOne({ customerId }).populate("customer", "location");
        res.status(200).json(customer?.customer?.location || {});
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
};

// VIEW FEEDBACK
export const viewFeedback = async (req, res) => {
    try {
        const feedback = await Feedback.find();
        res.status(200).json(feedback);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
};

// GENERATE REPORT
export const generateReport = async (req, res) => {
    try {
        const orders = await Order.find();
        const stock = await Stock.find();
        res.status(200).json({ orders, stock });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
};
