import express from 'express';
import { protect, authorizeRoles } from '../config/authMiddleware.js';
import ROLES from '../config/roles.js';
import { 
    addMenuItem, updateMenuItem, deleteMenuItem, getMenu,
    addStockItem, updateStockItem, deleteStockItem, getStock,
    acceptOrder, assignSchedule, updateOrderStatus,
    viewCustomerLocation, viewFeedback, generateReport, getSchedule
} from '../controllers/cateringManagerController.js';
import { upload } from "../middleware/multer.js";

const catering_router = express.Router();

// Middleware: Only Catering Managers can access these routes
catering_router.use(protect, authorizeRoles(ROLES.CATERING_MANAGER));

// Menu Management

/**
 * @swagger
 * tags:
 *   name: Menu Management
 *   description: API for managing menu items
 */

/**
 * @swagger
 * /api/catering/menu:
 *   post:
 *     summary: Add a new menu item
 *     tags: [Menu Management]
 *     description: Upload a menu item with an image
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *               - description
 *               - category
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the menu item
 *               price:
 *                 type: number
 *                 description: Price of the menu item
 *               description:
 *                 type: string
 *                 description: Description of the menu item
 *               category:
 *                 type: string
 *                 description: Category of the menu item
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Image of the menu item
 *     responses:
 *       201:
 *         description: Menu item added successfully
 *       500:
 *         description: Server error
 */
catering_router.post("/menu", upload.single("image"), addMenuItem);


/**
 * @swagger
 * /api/catering/menu/update/{id}:
 *   put:
 *     summary: Update a menu item
 *     tags: [Menu Management]
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
 *         description: Menu item updated
 */
catering_router.put('/menu/update/:id', updateMenuItem);

/**
 * @swagger
 * /api/catering/menu/delete/{id}:
 *   delete:
 *     summary: Delete a menu item
 *     tags: [Menu Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Menu item deleted
 */
catering_router.delete('/menu/delete/:id', deleteMenuItem);

/**
 * @swagger
 * /api/catering/menu:
 *   get:
 *     summary: Retrieve the menu
 *     tags: [Menu Management]
 *     responses:
 *       200:
 *         description: A list of menu items
 */
catering_router.get('/menu', getMenu);

// Stock Management

/**
 * @swagger
 * /api/catering/stock:
 *   get:
 *     summary: Retrieve stock items
 *     tags: [Stock Management]
 *     responses:
 *       200:
 *         description: A list of stock items
 */
catering_router.get('/stock', getStock);

/**
 * @swagger
 * /api/catering/stock/add:
 *   post:
 *     summary: Add a new stock item
 *     tags: [Stock Management]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Stock item added successfully
 */
catering_router.post('/stock/add', addStockItem);

/**
 * @swagger
 * /api/catering/stock/update/{id}:
 *   put:
 *     summary: Update a stock item
 *     tags: [Stock Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Stock item updated
 */
catering_router.put('/stock/update/:id', updateStockItem);

/**
 * @swagger
 * /api/catering/stock/delete/{id}:
 *   delete:
 *     summary: Delete a stock item
 *     tags: [Stock Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Stock item deleted
 */
catering_router.delete('/stock/delete/:id', deleteStockItem);

// Order Management

/**
 * @swagger
 * /api/catering/order/accept/{orderId}:
 *   post:
 *     summary: Accept an order
 *     tags: [Order Management]
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order accepted
 */
catering_router.post('/order/accept/:orderId', acceptOrder);

/**
 * @swagger
 * /api/catering/order/update-status/{orderId}:
 *   put:
 *     summary: Update order status
 *     tags: [Order Management]
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order status updated
 */
catering_router.put('/order/update-status/:orderId', updateOrderStatus);

export default catering_router;