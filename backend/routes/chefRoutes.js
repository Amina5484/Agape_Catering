import express from "express";

const chef_router = express.Router();
// import { protect, authorizeRoles } from "../middleware/auth.js";
import {  updateStockItem, getStock } from "../controllers/chefController.js";

chef_router.get("/stock",   getStock);
chef_router.put("/stock/:id",   updateStockItem);


export default chef_router;