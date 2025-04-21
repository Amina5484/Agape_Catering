import Menu from '../models/menu.js';
import Category from '../models/category.js';

// /**
//  * Get menu items filtered by category and subcategory
//  * @param {Object} req - Express request object
//  * @param {Object} res - Express response object
//  */
// export const getMenuByCategoryAndSubcategory = async (req, res) => {
//     try {
//         const { category, subcategory } = req.query;

//         // Build the query object
//         const query = {};

//         if (category) {
//             query.category = category;
//         }

//         if (subcategory) {
//             query.subcategory = subcategory;
//         }

//         // Find menu items matching the query
//         const menuItems = await Menu.find(query)
//             .select('name description category subcategory subSubcategories image')
//             .sort({ category: 1, subcategory: 1, name: 1 });

//         if (!menuItems || menuItems.length === 0) {
//             return res.status(404).json({
//                 success: false,
//                 message: 'No menu items found for the specified category and subcategory'
//             });
//         }

//         res.status(200).json({
//             success: true,
//             count: menuItems.length,
//             data: menuItems
//         });

//     } catch (error) {
//         console.error('Error fetching filtered menu items:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Server Error',
//             error: error.message
//         });
//     }
// }; 

export const addMenuItem = async (req, res) => {
    try {
        const { name, price, description, category } = req.body;
        const image = req.file ? `/uploads/${req.file.filename}` : null;

        if (!name || !price || !description || !category || !image) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Check if category exists
        const categoryExists = await Category.findById(category);
        if (!categoryExists) {
            return res.status(404).json({ message: "Category not found" });
        }

        const newMenuItem = new Menu({
            name,
            price,
            description,
            image,
            category
        });

        await newMenuItem.save();
        res.status(201).json({ message: "Menu item added successfully", menuItem: newMenuItem });
    } catch (error) {
        console.error("Add Menu Item Error:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

export const updateMenuItem = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, price, description, category } = req.body;
        const image = req.file ? `/uploads/${req.file.filename}` : null;

        const updateData = { name, price, description };
        if (category) {
            // Check if new category exists
            const categoryExists = await Category.findById(category);
            if (!categoryExists) {
                return res.status(404).json({ message: "Category not found" });
            }
            updateData.category = category;
        }
        if (image) updateData.image = image;

        const updatedItem = await Menu.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        ).populate('category', 'categoryName');

        if (!updatedItem) {
            return res.status(404).json({ message: "Menu item not found" });
        }

        res.status(200).json({
            message: "Menu item updated successfully",
            menuItem: updatedItem
        });
    } catch (error) {
        console.error("Update Menu Item Error:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

export const deleteMenuItem = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedItem = await Menu.findByIdAndDelete(id);

        if (!deletedItem) {
            return res.status(404).json({ message: "Menu item not found" });
        }

        res.status(200).json({ message: "Menu item deleted successfully" });
    } catch (error) {
        console.error("Delete Menu Item Error:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

export const getAllMenuItems = async (req, res) => {
    try {
        const menuItems = await Menu.find()
            .populate('category', 'categoryName')
            .sort({ createdAt: -1 });
        res.status(200).json(menuItems);
    } catch (error) {
        console.error("Get Menu Items Error:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

export const getMenuItemById = async (req, res) => {
    try {
        const { id } = req.params;
        const menuItem = await Menu.findById(id).populate('category', 'categoryName');

        if (!menuItem) {
            return res.status(404).json({ message: "Menu item not found" });
        }

        res.status(200).json(menuItem);
    } catch (error) {
        console.error("Get Menu Item Error:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};