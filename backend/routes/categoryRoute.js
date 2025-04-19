import express from "express";
import { upload } from "../middleware/multer.js";
import {
    addCategoryItem, updateCategoryItem, deleteCategoryItem, getCategory,
    addSubCategoryItem, updateSubCategoryItem, deleteSubCategoryItem, getSubCategory,
    addSubSubCategoryItem, updateSubSubCategoryItem, deleteSubSubCategoryItem, getSubSubCategory,getSubSubCategoryWithId, getSubCategoryWithId, getCategoryWithId
  } from "../controllers/categoryController.js";
  
  
const category_router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Category Management
 *   description: API for managing category items
 */

/**
 * @swagger
 * /api/category:
 *   post:
 *     summary: Add a new category with nested subcategories and sub-subcategories
 *     tags: [Category Management]
 *     description: Upload a category with image and optional nested subcategories and sub-subcategories
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - categoryName
 *               - image
 *             properties:
 *               categoryName:
 *                 type: string
 *                 description: Name of the main category
 *               description:
 *                 type: string
 *                 description: Description of the category
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Image of the category
 *               subcategories:
 *                 type: string
 *                 description: JSON stringified array of subcategories. Each subcategory can include sub-subcategories.
 *                 example: >
 *                   [
 *                     {
 *                       "subcategoryName": "Phones",
 *                       "description": "Mobile phones",
 *                       "image": "/uploads/phones.jpg",
 *                       "subSubcategories": [
 *                         {
 *                           "subSubcategoryName": "Android",
 *                           "description": "Android-based phones",
 *                           "image": "/uploads/android.jpg"
 *                         }
 *                       ]
 *                     }
 *                   ]
 *     responses:
 *       201:
 *         description: Category item added successfully
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Server error
 */
category_router.post("/", upload.single("image"), addCategoryItem);

/**
 * @swagger
 * /api/category/update/{id}:
 *   put:
 *     summary: Update a category item and its subcategories
 *     tags: [Category Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The category ID to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               categoryName:
 *                 type: string
 *               description:
 *                 type: string
 *               image:
 *                 type: string
 *               subcategories:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     subcategoryName:
 *                       type: string
 *                     description:
 *                       type: string
 *                     image:
 *                       type: string
 *                     subSubcategories:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           subSubcategoryName:
 *                             type: string
 *                           description:
 *                             type: string
 *                           image:
 *                             type: string
 *     responses:
 *       200:
 *         description: Category item updated
 *       500:
 *         description: Server error
 */
category_router.put('/update/:id', updateCategoryItem);

/**
 * @swagger
 * /api/category/delete/{id}:
 *   delete:
 *     summary: Delete a category item
 *     tags: [Category Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the category to delete
 *     responses:
 *       200:
 *         description: Category item deleted
 *       500:
 *         description: Server error
 */
category_router.delete('/delete/:id', deleteCategoryItem);

/**
 * @swagger
 * /api/category:
 *   get:
 *     summary: Retrieve all category items
 *     tags: [Category Management]
 *     responses:
 *       200:
 *         description: A list of all categories
 *       500:
 *         description: Server error
 */
category_router.get('/', getCategory);

/**
 * @swagger
 * /api/category/{id}:
 *   get:
 *     summary: Get subcategory by ID
 *     tags: [Category Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the category to retrieve
 *     responses:
 *       200:
 *         description: category details retrieved successfully
 *       404:
 *         description: category not found
 *       500:
 *         description: Server error
 */
category_router.get("/:id", getCategoryWithId);




/**
 * @swagger
 * tags:
 *   - name: Category Management
 *     description: Endpoints for Category
 *   - name: Subcategory Management
 *     description: Endpoints for Subcategory
 *   - name: Sub-Subcategory Management
 *     description: Endpoints for Sub-Subcategory
 */

// ---- Category Routes (already present) ----
// ... your existing routes

// ---- Subcategory Routes ----

/**
 * @swagger
 * /api/category/subcategory:
 *   post:
 *     summary: Add a new subcategory
 *     tags: [Subcategory Management]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - subcategoryName
 *               - image
 *             properties:
 *               subcategoryName:
 *                 type: string
 *               description:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *               subSubcategories:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     subSubcategoryName:
 *                       type: string
 *                     description:
 *                       type: string
 *                     image:
 *                       type: string
 *     responses:
 *       201:
 *         description: Subcategory added successfully
 */
category_router.post("/subcategory", upload.single("image"), addSubCategoryItem);

/**
 * @swagger
 * /api/category/subcategory/update/{id}:
 *   put:
 *     summary: Update a subcategory
 *     tags: [Subcategory Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               subcategoryName:
 *                 type: string
 *               description:
 *                 type: string
 *               image:
 *                 type: string
 *               subSubcategories:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     subSubcategoryName:
 *                       type: string
 *                     description:
 *                       type: string
 *                     image:
 *                       type: string
 *     responses:
 *       200:
 *         description: Subcategory item updated
 */
category_router.put("/subcategory/update/:id", updateSubCategoryItem);

/**
 * @swagger
 * /api/category/subcategory/delete/{id}:
 *   delete:
 *     summary: Delete a subcategory
 *     tags: [Subcategory Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Subcategory item deleted
 */
category_router.delete("/subcategory/delete/:id", deleteSubCategoryItem);

/**
 * @swagger
 * /api/category/subcategory:
 *   get:
 *     summary: Get all subcategories
 *     tags: [Subcategory Management]
 *     responses:
 *       200:
 *         description: List of all subcategories
 */
category_router.get("/subcategory", getSubCategory);
/**
 * @swagger
 * /api/category/subcategory/{id}:
 *   get:
 *     summary: Get sub-subcategory by ID
 *     tags: [Subcategory Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the sub-category to retrieve
 *     responses:
 *       200:
 *         description: Sub-subcategory details retrieved successfully
 *       404:
 *         description: Sub-subcategory not found
 *       500:
 *         description: Server error
 */
category_router.get("/subcategory/:id", getSubCategoryWithId);

// ---- SubSubcategory Routes ----

/**
 * @swagger
 * /api/category/subsubcategory:
 *   post:
 *     summary: Add a new sub-subcategory
 *     tags: [Sub-Subcategory Management]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - subSubcategoryName
 *               - image
 *             properties:
 *               subSubcategoryName:
 *                 type: string
 *               description:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Sub-subcategory added successfully
 */
category_router.post("/subsubcategory", upload.single("image"), addSubSubCategoryItem);

/**
 * @swagger
 * /api/category/subsubcategory/update/{id}:
 *   put:
 *     summary: Update a sub-subcategory
 *     tags: [Sub-Subcategory Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               subSubcategoryName:
 *                 type: string
 *               description:
 *                 type: string
 *               image:
 *                 type: string
 *     responses:
 *       200:
 *         description: Sub-subcategory item updated
 */
category_router.put("/subsubcategory/update/:id", updateSubSubCategoryItem);

/**
 * @swagger
 * /api/category/subsubcategory/delete/{id}:
 *   delete:
 *     summary: Delete a sub-subcategory
 *     tags: [Sub-Subcategory Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Sub-subcategory item deleted
 */
category_router.delete("/subsubcategory/delete/:id", deleteSubSubCategoryItem);

/**
 * @swagger
 * /api/category/subsubcategory:
 *   get:
 *     summary: Get all sub-subcategories
 *     tags: [Sub-Subcategory Management]
 *     responses:
 *       200:
 *         description: List of all sub-subcategories
 */
category_router.get("/subsubcategory", getSubSubCategory);


/**
 * @swagger
 * /api/category/subsubcategory/{id}:
 *   get:
 *     summary: Get sub-subcategory by ID
 *     tags: [Sub-Subcategory Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the sub-subcategory to retrieve
 *     responses:
 *       200:
 *         description: Sub-subcategory details retrieved successfully
 *       404:
 *         description: Sub-subcategory not found
 *       500:
 *         description: Server error
 */
category_router.get("/subsubcategory/:id", getSubSubCategoryWithId);


export default category_router;
