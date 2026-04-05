const express = require("express");
const router = express.Router();

// 🎯 Controller Import
const { recordIncident } = require("../controller/incidentController");

// 🛡️ Middleware Imports
const { authenticateToken } = require("../middleware/authMiddleware");
const authorize = require("../middleware/authorize");

// ==============================
// 🚫 CONDUCT & PENALTIES ROUTES
// ==============================

/**
 * @route   POST /api/incidents/record
 * @desc    Log a new violation/incident for a PDL
 * @access  Protected (Requires 'cancreate' for Conduct & Penalties)
 */
router.post("/record", 
    authenticateToken, 
    authorize("Conduct & Penalties", "canapprove"), 
    recordIncident
);

module.exports = router;