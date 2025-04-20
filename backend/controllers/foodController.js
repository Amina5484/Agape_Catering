import Food from '../models/foodModel.js';

export const addFood = async (req, res) => {
    try {
        const { name, description, price, category } = req.body;
        const image = req.file ? req.file.filename : null;

        const newFood = new Food({
            name,
            description,
            price,
            category,
            image
        });

        await newFood.save();
        res.status(201).json({ message: 'Food item added successfully', food: newFood });
    } catch (error) {
        res.status(500).json({ message: 'Error adding food item', error: error.message });
    }
};

export const listFood = async (req, res) => {
    try {
        const foods = await Food.find();
        res.status(200).json(foods);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching food items', error: error.message });
    }
};

export const removeFood = async (req, res) => {
    try {
        const { id } = req.params;
        await Food.findByIdAndDelete(id);
        res.status(200).json({ message: 'Food item deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting food item', error: error.message });
    }
};

export const updateFood = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, category } = req.body;
        const image = req.file ? req.file.filename : null;

        const updateData = {
            name,
            description,
            price,
            category,
            ...(image && { image })
        };

        const updatedFood = await Food.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );

        res.status(200).json({ message: 'Food item updated successfully', food: updatedFood });
    } catch (error) {
        res.status(500).json({ message: 'Error updating food item', error: error.message });
    }
};
