import Menu from '../models/menu.js';

/**
 * Get menu items filtered by category and subcategory
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getMenuByCategoryAndSubcategory = async (req, res) => {
    try {
        const { category, subcategory } = req.query;

        // Build the query object
        const query = {};

        if (category) {
            query.category = category;
        }

        if (subcategory) {
            query.subcategory = subcategory;
        }

        // Find menu items matching the query
        const menuItems = await Menu.find(query)
            .select('name description category subcategory subSubcategories image')
            .sort({ category: 1, subcategory: 1, name: 1 });

        if (!menuItems || menuItems.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No menu items found for the specified category and subcategory'
            });
        }

        res.status(200).json({
            success: true,
            count: menuItems.length,
            data: menuItems
        });

    } catch (error) {
        console.error('Error fetching filtered menu items:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
}; 