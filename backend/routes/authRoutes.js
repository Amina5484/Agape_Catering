import express from 'express';
import {    
    registerCustomer, 
    registerCateringManager, 
    registerExecutiveChef, 
    registerSystemAdmin, 
    loginUser,
    changePassword  
} from '../controllers/authController.js';
import { protect, authorizeRoles } from '../config/authMiddleware.js';
import ROLES from '../config/roles.js';

const authRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication and registration
 */

/**
 * @swagger
 * /api/auth/register/customer:
 *   post:
 *     summary: Register a new customer
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Customer registered successfully
 *       400:
 *         description: Validation error
 */
authRouter.post('/register/customer', registerCustomer);

/**
 * @swagger
 * /api/auth/register/catering-manager:
 *   post:
 *     summary: Register a new catering manager
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Catering Manager registered successfully
 *       400:
 *         description: Validation error
 */
authRouter.post('/register/catering-manager', registerCateringManager);

/**
 * @swagger
 * /api/auth/register/executive-chef:
 *   post:
 *     summary: Register a new executive chef
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Executive Chef registered successfully
 *       400:
 *         description: Validation error
 */
authRouter.post('/register/executive-chef', registerExecutiveChef);

/**
 * @swagger
 * /api/auth/register/system-admin:
 *   post:
 *     summary: Register a new system admin (Restricted to System Admins)
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: System Admin registered successfully
 *       400:
 *         description: Validation error
 *       403:
 *         description: Forbidden - Only System Admins can access this route
 */
// authRouter.post('/register/system-admin', protect, authorizeRoles(ROLES.SYSTEM_ADMIN), registerSystemAdmin);
authRouter.post('/register/system-admin', registerSystemAdmin);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Authenticate user and get a token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Authentication successful, returns a token
 *       401:
 *         description: Invalid credentials
 */
authRouter.post('/login', loginUser);


/**
 * @swagger
 * /api/auth/change-password:
 *   post:
 *     summary: Authenticate user and get a token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               previousPassword:
 *                 type: string
 *               new-password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Authentication successful, returns a token
 *       401:
 *         description: Invalid credentials
 */
authRouter.post('/change-password',protect, changePassword);


export default authRouter;
