import express from 'express';
import { protect, authorizeRoles } from '../config/authMiddleware.js';
import ROLES from '../config/roles.js';
import {
  getStaffs,
  getCustomers,
  deleteAccount,
  updateAccount,
} from '../controllers/adminController.js';

const admin_router = express.Router();

// Middleware: Only Admins can access these routes
admin_router.use(protect, authorizeRoles('System Admin'));

/**
 * @swagger
 * tags:
 *   name: Admin Management
 *   description: API for managing admin tasks
 */

/**
 * @swagger
 * /api/admin/staffs:
 *   get:
 *     summary: Retrieve the list of staffs
 *     tags: [Admin Management]
 *     responses:
 *       200:
 *         description: A list of staffs
 */
admin_router.get('/staffs', getStaffs);

/**
 * @swagger
 * tags:
 *   name: Admin Management
 *   description: API for managing admin tasks
 */

/**
 * @swagger
 * /api/admin/clients:
 *   get:
 *     summary: Retrieve the list of Customers
 *     tags: [Admin Management]
 *     responses:
 *       200:
 *         description: A list of staffs
 */
admin_router.get('/clients', getCustomers);

/**
 * @swagger
 * /api/admin/delete/:id:
 *   delete:
 *     summary: Admin To delete account
 *     tags: [Admin Management]
 *     responses:
 *       200:
 *         description: Data from the previous controller
 */
admin_router.delete('/delete/:id', deleteAccount);

/**
 * @swagger
 * /api/admin/update:
 *   put:
 *     summary: Update Any Account with Id
 *     tags: [Admin Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the account to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the account
 *               email:
 *                 type: string
 *                 description: The email of the account
 *               role:
 *                 type: string
 *                 description: The role of the account
 *     responses:
 *       200:
 *         description: updated successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: user not found
 */
admin_router.put('/update/:id', updateAccount);

// /**
//  * @swagger
//  * /api/admin/update/:id:
//  *   put:
//  *     summary: update user
//  *     tags: [Admin Management]
//  *     responses:
//  *       200:
//  *         description: Data from yet another controller
//  */

export default admin_router;
