import express from "express";
import { upload } from "../middleware/multer.js";
import { 
    addCategoryItem, updateCategoryItem, deleteCategoryItem, getCategory 
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
 *     summary: Add a new category item
 *     tags: [Category Management]
 *     description: Upload a category item with an image
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - image
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the category item
 *               description:
 *                 type: string
 *                 description: Description of the category item
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Image of the category item
 *     responses:
 *       201:
 *         description: Category item added successfully
 *       500:
 *         description: Server error
 */
category_router.post("/category", upload.single("image"), addCategoryItem);

/**
 * @swagger
 * /api/category/update/{id}:
 *   put:
 *     summary: Update a category item
 *     tags: [Category Management]
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
 *     responses:
 *       200:
 *         description: Category item updated
 */
category_router.put('/category/update/:id', updateCategoryItem);

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
 *     responses:
 *       200:
 *         description: Category item deleted
 */
category_router.delete('/category/delete/:id', deleteCategoryItem);

/**
 * @swagger
 * /api/category:
 *   get:
 *     summary: Retrieve all category items
 *     tags: [Category Management]
 *     responses:
 *       200:
 *         description: A list of category items
 */
category_router.get('/category', getCategory);

export default category_router;
