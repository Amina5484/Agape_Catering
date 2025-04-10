import Category from "../models/category.js";


export const addCategoryItem = async (req, res) => {

    try {
        console.log("Request Body:", req.body); // Debugging log
        console.log("Uploaded File:", req.file); // Debugging log

        const { name, price, description, category } = req.body;
        const image = req.file ? `/uploads/${req.file.filename}` : null;

        // Ensure all required fields exist
        if (!name || !image || !description) {
            return res.status(400).json({ message: "All fields are required" });
        }


        const categoryItem = new Category({ name, description, image });
        await categoryItem.save();

        res.status(201).json({ message: "category item added successfully", categoryItem });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error", error });
    }
};

export const updateCategoryItem = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedItem = await Category.findByIdAndUpdate(id, req.body, { new: true });
        res.status(200).json({ message: "category item updated", updatedItem });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
};

export const deleteCategoryItem = async (req, res) => {
    try {
        const { id } = req.params;
        await Category.findByIdAndDelete(id);
        res.status(200).json({ message: "category item deleted" });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
};

export const getCategory = async (req, res) => {
    try {
        const category = await Category.find();
        res.status(200).json(category);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
};

