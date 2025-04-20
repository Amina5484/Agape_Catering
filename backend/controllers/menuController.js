import Menu from '../models/menu.js';
import Category , {SubSubcategory,Subcategory } from '../models/category.js';

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
    console.log("==========requested===========");
    console.log(req.body);
    try {
        const { name, price, description, category, subcategory, subSubcategory } = req.body;
        const image = req.file ? `/uploads/${req.file.filename}` : null;
        
        const missingFields = [];
        if (!name) missingFields.push("name");
        if (!price) missingFields.push("price");
        if (!description) missingFields.push("description");
        if (!category) missingFields.push("category");
        if (!subcategory) missingFields.push("subcategory");
        if (!subSubcategory) missingFields.push("SubSubcategory");
        if (!image) missingFields.push("image");
        
        if (missingFields.length > 0) {
            return res.status(400).json({ 
            message: "The following fields are required", 
            missingFields 
            });
        }
        const categoryCheck = await Category.findById(category);
        if (!categoryCheck) {
            return res.status(400).json({ message: "Category not found" });
        }
        const subcategoryCheck = await Subcategory.findById(subcategory);
        if (!subcategoryCheck) {    
            return res.status(400).json({ message: "Subcategory not found" });
        }
        const subSubcategoryCheck = await SubSubcategory.findById(subSubcategory);  
        if (!subSubcategoryCheck) {
            return res.status(400).json({ message: "SubSubcategory not found" });
        }
        // Check if the menu item already exists    
        const existingMenuItem = await Menu.findOne({ name,price, category, subcategory, SubSubcategory });
        if (existingMenuItem) {
            return res.status(400).json({ message: "Menu item already exists" });
        }
        // Create a new menu item   
        const menuItem = new Menu({
            name,
            price,
            description,
            category,
            subcategory,
            subSubcategory,
            image
        });

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
        const updatedMenuItem = await Menu.findByIdAndUpdate(id, req.body, { new: true });
        res.status(200).json({ message: "Menu item updated", updatedMenuItem });
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

export const getAllMenuItems = async (req, res) => {
    try {
        const menuItems = await Menu.find()
            .populate("category", "categoryName")
            .populate("subcategory", "subcategoryName")
            .populate("subSubcategory", "subSubcategoryName");

        res.status(200).json(menuItems);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
};

export const getMenuItemById = async (req, res) => {
    try {
        const { id } = req.params;
        const menuItem = await Menu.findById(id)
            .populate("category", "categoryName")
            .populate("subcategory", "subcategoryName")
            .populate("subSubcategory", "subSubcategoryName");

        if (!menuItem) return res.status(404).json({ message: "Menu item not found" });

        res.status(200).json(menuItem);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
};