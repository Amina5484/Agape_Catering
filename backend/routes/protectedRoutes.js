const express = require("express");
const { protect, authorizeRoles } = require("../config/authMiddleware");
const ROLES = require("../config/roles");
const { 
  cleanupOrderFields 
} from '../controllers/cateringManagerController.js';

const router = express.Router();

// Catering Manager Route
router.get("/catering-dashboard", protect, authorizeRoles(ROLES.CATERING_MANAGER), (req, res) => {
    res.json({ message: "Welcome Catering Manager!" });
});

// Executive Chef Route
router.get("/chef-dashboard", protect, authorizeRoles(ROLES.EXECUTIVE_CHEF), (req, res) => {
    res.json({ message: "Welcome Executive Chef!" });
});

// System Admin Route
router.get("/admin-dashboard", protect, authorizeRoles(ROLES.SYSTEM_ADMIN), (req, res) => {
    res.json({ message: "Welcome System Admin!" });
});

// Add the new route
router.post('/orders/cleanup-fields', protect, authorizeRoles('System Admin'), cleanupOrderFields);

module.exports = router;
