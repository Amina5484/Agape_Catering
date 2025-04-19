import express from 'express';
import { getMenuByCategoryAndSubcategory } from '../controllers/menuController.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Menu
 *   description: API for menu operations
 */

/**
 * @swagger
 * /api/menu/filter:
 *   get:
 *     summary: Get menu items by category and subcategory
 *     tags: [Menu]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Category to filter by
 *       - in: query
 *         name: subcategory
 *         schema:
 *           type: string
 *         description: Subcategory to filter by
 *     responses:
 *       200:
 *         description: List of filtered menu items
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: number
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *                       category:
 *                         type: string
 *                       subcategory:
 *                         type: string
 *                       subSubcategories:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             name:
 *                               type: string
 *                             price:
 *                               type: number
 *                       image:
 *                         type: string
 *       404:
 *         description: No menu items found
 *       500:
 *         description: Server error
 */
router.get('/filter', getMenuByCategoryAndSubcategory);

export default router; 