import Category from "../models/category.js";

export const addCategoryItem = async (req, res) => {
  try {
    const { categoryName } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    if (!categoryName) {
      return res.status(400).json({ message: "Category name is required" });
    }

    if (!image) {
      return res.status(400).json({ message: "Category image is required" });
    }

    // Trim whitespace from category name
    const trimmedCategoryName = categoryName.trim();

    if (!trimmedCategoryName) {
      return res.status(400).json({ message: "Category name cannot be empty" });
    }

    // Check if category already exists (case-insensitive)
    const existingCategory = await Category.findOne({
      categoryName: { $regex: new RegExp(`^${trimmedCategoryName}$`, 'i') }
    });

    if (existingCategory) {
      return res.status(400).json({
        message: `A category with the name "${trimmedCategoryName}" already exists`
      });
    }

    const newCategory = new Category({
      categoryName: trimmedCategoryName,
      image: image
    });

    await newCategory.save();

    res.status(201).json({
      message: "Category added successfully",
      category: newCategory
    });
  } catch (error) {
    console.error("Add Category Error:", error);
    if (error.code === 11000) {
      return res.status(400).json({
        message: "A category with this name already exists"
      });
    }
    res.status(500).json({
      message: "Server Error",
      error: error.message
    });
  }
};

export const updateCategoryItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { categoryName } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    // Trim whitespace from category name
    const trimmedCategoryName = categoryName.trim();

    // Check if the new name conflicts with existing categories (excluding current category)
    if (trimmedCategoryName) {
      const existingCategory = await Category.findOne({
        _id: { $ne: id },
        categoryName: { $regex: new RegExp(`^${trimmedCategoryName}$`, 'i') }
      });

      if (existingCategory) {
        return res.status(400).json({
          message: `A category with the name "${trimmedCategoryName}" already exists`
        });
      }
    }

    const updateData = { categoryName: trimmedCategoryName };
    if (image) updateData.image = image;

    const updatedItem = await Category.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!updatedItem) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json({
      message: "Category updated successfully",
      category: updatedItem
    });
  } catch (error) {
    console.error("Update Category Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const deleteCategoryItem = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedItem = await Category.findByIdAndDelete(id);

    if (!deletedItem) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Delete Category Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const getCategory = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.status(200).json(categories);
  } catch (error) {
    console.error("Get Categories Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const getCategoryWithId = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json(category);
  } catch (error) {
    console.error("Get Category Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};