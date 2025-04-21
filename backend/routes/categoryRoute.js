import express from "express";
import { upload } from "../middleware/multer.js";
import {
  addCategoryItem,
  updateCategoryItem,
  deleteCategoryItem,
  getCategory,
  getCategoryWithId
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
 *     summary: Add a new category
 *     tags: [Category Management]
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
 *                 description: Name of the category
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Category image
 *     responses:
 *       201:
 *         description: Category added successfully
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
 *     summary: Update a category
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               categoryName:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Category updated successfully
 *       404:
 *         description: Category not found
 *       500:
 *         description: Server error
 */
category_router.put("/update/:id", upload.single("image"), updateCategoryItem);

/**
 * @swagger
 * /api/category/delete/{id}:
 *   delete:
 *     summary: Delete a category
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
 *         description: Category deleted successfully
 *       404:
 *         description: Category not found
 *       500:
 *         description: Server error
 */
category_router.delete("/delete/:id", deleteCategoryItem);

/**
 * @swagger
 * /api/category:
 *   get:
 *     summary: Get all categories
 *     tags: [Category Management]
 *     responses:
 *       200:
 *         description: List of all categories
 *       500:
 *         description: Server error
 */
category_router.get("/", getCategory);

/**
 * @swagger
 * /api/category/{id}:
 *   get:
 *     summary: Get category by ID
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
 *         description: Category details retrieved successfully
 *       404:
 *         description: Category not found
 *       500:
 *         description: Server error
 */
category_router.get("/id/:id", getCategoryWithId);

export default category_router;
