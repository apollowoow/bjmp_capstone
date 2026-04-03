const express = require("express");
const router = express.Router();
const pool = require("../db/pool");

// ==========================
// IMPORT CONTROLLERS
// ==========================
const { getReportStats, getGeneralSummary, getPredictiveReport } = require("../controller/reportController");

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
router.get("/summary", authenticateToken, getGeneralSummary);
router.get('/predictive', authenticateToken, getPredictiveReport);
module.exports = router;