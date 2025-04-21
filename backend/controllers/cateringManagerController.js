import Menu from '../models/menu.js';
import Stock from '../models/stock.js';
import Order from '../models/order.js';
import Schedule from '../models/schedule.js';
import Feedback from '../models/feedback.js';
import Food from '../models/foodmodel.js';


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
        if (!name || !description || !category || !subcategory || !subSubcategories || subSubcategories.length === 0) {
            return res.status(400).json({ message: "All fields including subSubcategories are required" });
        }

        // Validate subSubcategories
        for (const subSub of subSubcategories) {
            if (!subSub.name || subSub.price === undefined || subSub.price === null) {
                return res.status(400).json({ message: "Each subSubcategory must have a name and price" });
            }
            if (isNaN(subSub.price) || Number(subSub.price) <= 0) {
                return res.status(400).json({ message: "Price must be a positive number" });
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
            image
        });

        await menuItem.save();

        // Also add to Food collection for home page display
        const foodItem = new Food({
            name,
            description,
            category,
            subcategory,
            image,
            price: subSubcategories[0].price // Use the first subSubcategory price as default
        });
        await foodItem.save();

        res.status(201).json({
            message: "Menu item added successfully",
            menuItem: {
                ...menuItem.toObject(),
                image: image ? `/uploads/${image}` : null
            }
        });
    } catch (error) {
        console.error("Error adding menu item:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

export const updateMenuItem = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, category, subcategory, subSubcategories } = req.body;

        // Ensure all required fields exist
        if (!name || !description || !category || !subcategory || !subSubcategories) {
            return res.status(400).json({ message: "All fields including subSubcategories are required" });
        }

        // Update menu item
        const updatedItem = await Menu.findByIdAndUpdate(
            id,
            { name, description, category, subcategory, subSubcategories },
            { new: true }
        );

        if (!updatedItem) {
            return res.status(404).json({ message: "Menu item not found" });
        }

        // Also update in Food collection
        const foodItem = await Food.findOne({
            name: updatedItem.name,
            category: updatedItem.category
        });

        if (foodItem) {
            await Food.findByIdAndUpdate(
                foodItem._id,
                { name, description, category, subcategory },
                { new: true }
            );
        }

        res.status(200).json({
            message: "Menu item updated successfully",
            updatedItem
        });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
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
                category: menuItem.category
            });
        }

        res.status(200).json({ message: "Menu item deleted" });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
};

export const getMenu = async (req, res) => {
    try {
        const menu = await Menu.find().select('name description category subcategory subSubcategories image');
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
        const { quantity, initialQuantity } = req.body;

        // Calculate if stock is low (20% or less of initial quantity)
        const isLowStock = quantity <= (initialQuantity || quantity) * 0.2;

        const updatedStock = await Stock.findByIdAndUpdate(
            id,
            { ...req.body, isLowStock },
            { new: true }
        );

        res.status(200).json({
            message: "Stock updated",
            updatedStock,
            isLowStock
        });
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
