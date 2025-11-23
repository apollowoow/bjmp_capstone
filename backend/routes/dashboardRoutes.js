const express = require("express");
const router = express.Router();

// Import the controller we created earlier
const { getDashboardStats } = require("../controller/dashboardController");

// Import middleware to ensure only logged-in users see stats
const { authenticateToken } = require("../middleware/authMiddleware");

// ==============================
// DASHBOARD ROUTES
// ==============================

// GET /api/dashboard/stats
router.get("/stats", authenticateToken, getDashboardStats);

module.exports = router;