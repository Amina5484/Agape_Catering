import express from "express";

import { protect, authorizeRoles } from '../config/authMiddleware.js';
import {  updateStockItem, getStock } from "../controllers/chefController.js";

const chef_router = express.Router();

// Middleware: Only Admins can access these routes
chef_router.use(protect, authorizeRoles("Executive Chef"));

chef_router.get("/stock",   getStock);
chef_router.put("/stock/:id",   updateStockItem);


export default chef_router;