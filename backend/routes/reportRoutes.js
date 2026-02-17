const express = require("express");
const router = express.Router();
const pool = require("../db/pool");

// ==========================
// IMPORT CONTROLLERS
// ==========================
const { getReportStats, getMonthlySummary } = require("../controller/reportController");

// ==========================
// IMPORT MIDDLEWARE
// ==========================
const { authenticateToken } = require("../middleware/authMiddleware");

// ==========================
// DEFINE ROUTES
// ==========================

// Get high-level stats for dashboard cards
router.get("/stats", authenticateToken, getReportStats);

// Get the table data for the monthly report preview
router.get("/summary", authenticateToken, getMonthlySummary);

module.exports = router;