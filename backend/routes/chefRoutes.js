import express from 'express';

import { protect, authorizeRoles } from '../config/authMiddleware.js';
import {
  updateStockItem,
  getStock,
  getScheduleById,
} from '../controllers/chefController.js';
import ROLES from '../config/roles.js';

const chef_router = express.Router();

// Middleware: Only Executive Chefs can access these routes
chef_router.use(protect, authorizeRoles(ROLES.EXECUTIVE_CHEF));

chef_router.get('/stock', getStock);
chef_router.put('/stock/update/:id', updateStockItem);
chef_router.get('/schedule/:id', getScheduleById);

export default chef_router;
