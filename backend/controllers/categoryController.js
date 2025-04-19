import Category, { Subcategory, SubSubcategory } from "../models/category.js";

export const addCategoryItem = async (req, res) => {
    try {
   
  
      const image = req.file ? `/uploads/${req.file.filename}` : null;
      const { categoryName, description, subcategories, subSubCategory } = req.body;
  
      if (!categoryName || !image) {
        return res.status(400).json({ message: "Category name and image are required" });
      }

      const SubCategory = await Subcategory.findById(subcategories);
      if (!SubCategory) {
        return res.status(400).json({ message: "Subcategory not found" });
      }

      const SubSubCategory = await SubSubcategory.findById(subSubCategory);
      if (!SubSubCategory) {
        return res.status(400).json({ message: "SubSubcategory not found" });
      }
   
  
      const newCategory = new Category({
        categoryName,
        description,
        image,
        subcategoriesId: subcategories,
        subSubcategoriesId:subSubCategory,
      });
  
      await newCategory.save();
  
      res.status(201).json({ message: "Category added successfully", category: newCategory });
    } catch (error) {
      console.error("Add Category Error:", error);
      res.status(500).json({ message: "Server Error", error });
    }
  };

  export const updateCategoryItem = async (req, res) => {
    try {
      const { id } = req.params;
  
      const updatedItem = await Category.findByIdAndUpdate(id, req.body, { new: true });
  
      res.status(200).json({ message: "Category item updated", updatedItem });
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
export const getCategoryWithId = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "category ID is required" });
  }

  const category = await Category.findById(id);


  if (!category) {
    return res.status(404).json({ message: "category not found" });
  }
  res.status(200).json(category);
};


// subcategory 
export const addSubCategoryItem = async (req, res) => {
  try {


    const image = req.file ? `/uploads/${req.file.filename}` : null;
    const { subcategoryName, description, subSubcategoriesId } = req.body;

    if (!subcategoryName) {
      return res.status(400).json({ message: "subcategoryName required" });
    }
    if (!subSubcategoriesId) {
      return res.status(400).json({ message: "subSubcategoriesId required" });
    }
    if (!image) {
      return res.status(400).json({ message: "image required" });
    }

    
        const subsub = await SubSubcategory.findById(subSubcategoriesId);

        if (!subsub) {
          return res.status(404).json({
            success: false,
            message: 'subsubcategory not found',
          });
        }


    const newCategory = new Subcategory({
      subcategoryName,
      description,
      image,
      subSubcategoriesId
    });

    await newCategory.save();

    res.status(201).json({ message: "Category added successfully", category: newCategory });
  } catch (error) {
    console.error("Add Category Error:", error);
    res.status(500).json({ message: "Server Error", error });
  }
};

  export const updateSubCategoryItem = async (req, res) => {
    try {
      const { id } = req.params;
  
      const updatedItem = await Subcategory.findByIdAndUpdate(id, req.body, { new: true });
  
      res.status(200).json({ message: "Subcategory item updated", updatedItem });
    } catch (error) {
      res.status(500).json({ message: "Server Error", error });
    }
  };

export const deleteSubCategoryItem = async (req, res) => {
    try {
        const { id } = req.params;
        await Subcategory.findByIdAndDelete(id);
        res.status(200).json({ message: "category item deleted" });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
};

export const getSubCategory = async (req, res) => {
    try {
        const subcategory = await Subcategory.find();
        res.status(200).json(subcategory);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
};

export const getSubCategoryWithId = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "subcategory ID is required" });
  }

  const subcategory = await Subcategory.findById(id);


  if (!subcategory) {
    return res.status(404).json({ message: "subcategory not found" });
  }
  res.status(200).json(subcategory);
};

// sub sub category 

export const addSubSubCategoryItem = async (req, res) => {
    try {
      

  
      const image = req.file ? `/uploads/${req.file.filename}` : null;
      const { subSubcategoryName, description } = req.body;
  
      if (!subSubcategoryName) {
        return res.status(400).json({ message: "subSubcategoryName required" });
      }
      if (!image) {
        return res.status(400).json({ message: "image  required" });
      }
  
      const newCategory = new SubSubcategory({
        subSubcategoryName,
        description,
        image,
      });
  
      await newCategory.save();
  
      res.status(201).json({ message: "SubSubcategory added successfully", subSubCategory: newCategory });
    } catch (error) {
      console.error("Add Category Error:", error);
      res.status(500).json({ message: "Server Error", error });
    }
  };

  export const updateSubSubCategoryItem = async (req, res) => {
    try {
      const { id } = req.params;
  
      const updatedItem = await SubSubcategory.findByIdAndUpdate(id, req.body, { new: true });
  
      res.status(200).json({ message: "Subsubcategory item updated", updatedItem });
    } catch (error) {
      res.status(500).json({ message: "Server Error", error });
    }
  };

export const deleteSubSubCategoryItem = async (req, res) => {
    try {
        const { id } = req.params;
        await SubSubcategory.findByIdAndDelete(id);
        res.status(200).json({ message: "Subsubcategory item deleted" });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
};
export const getSubSubCategory = async (req, res) => {


  try {
    const subSubcategories = await SubSubcategory.find(); // Fetch all sub-subcategories
    res.status(200).json({
      success: true,
      data: subSubcategories,
    });
  } catch (error) {
    console.error("Error fetching sub-subcategories:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error,
    });
  }
};
export const getSubSubCategoryWithId = async (req, res) => {

  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "SubSubcategory ID is required" });
  }

  const subSubcategory = await SubSubcategory.findById(id);


  if (!subSubcategory) {
    return res.status(404).json({ message: "SubSubcategory not found" });
  }
  res.status(200).json(subSubcategory);
};