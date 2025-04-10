import express from 'express';
import { 
   getMenu,
} from '../controllers/customerController.js';
import { upload } from "../middleware/multer.js";
import { protect, authorizeRoles } from '../config/authMiddleware.js';

import authMiddleware from "../middleware/auth.js"
import { placeOrder } from "../controllers/orderController.js"

const customer_router = express.Router();
// customer_router.use(protect, authorizeRoles("Customer"));



/**
 * @swagger
 * tags:
 *   name: Customer
 *   description: Customer
 */

/**
 * @swagger
 * /api/customer/menu:
 *   get:
 *     summary: Retrieve the menu
 *     tags: [Customer]
 *     responses:
 *       200:
 *         description: A list of menu items
 */
customer_router.get('/menu', getMenu);




/**
 * @swagger
 * /api/customer/order/placeorder:
 *   post:
 *     summary: Place a new order
 *     tags: [Customer]

 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     itemId:
 *                       type: string
 *                     quantity:
 *                       type: integer
 *             example:
 *               items:
 *                 - itemId: "12345"
 *                   quantity: 2
 *     responses:
 *       200:
 *         description: Order placed successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
customer_router.post("/order/placeorder",placeOrder);



export default customer_router;