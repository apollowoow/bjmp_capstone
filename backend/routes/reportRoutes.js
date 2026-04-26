const express = require("express");
const router = express.Router();

// ==========================
// IMPORT CONTROLLERS
// ==========================
const { 
    getReportStats, 
    getGeneralSummary, 
    getPredictiveReport, auditReportExport, getAttendanceReport 
} = require("../controller/reportController");

// ==========================
// IMPORT MIDDLEWARE
// ==========================
const { authenticateToken } = require("../middleware/authMiddleware");
const authorize = require("../middleware/authorize");

// ==========================================
// 📈 EXECUTIVE REPORTS & ANALYTICS
// ==========================================

/**
 * @desc High-level stats and Predictive Analytics
 * @module "Time Allowance Computation (GCTA/TASTM)"
 * @permission "canapprove" (Restricts to Admin & Warden)
 */

router.get("/stats", 
    authenticateToken, 
    authorize("Time Allowance Computation (GCTA/TASTM)", "canapprove"), 
    getReportStats
);

router.get("/summary", 
    authenticateToken, 
    authorize("Time Allowance Computation (GCTA/TASTM)", "canapprove"), 
    getGeneralSummary
);

router.get('/predictive', 
    authenticateToken, 
    authorize("Time Allowance Computation (GCTA/TASTM)", "canapprove"), 
    getPredictiveReport
);

// Siguraduhin na naka-import yung bagong function sa taas


router.get('/attendance', 
    authenticateToken, 
    authorize("Time Allowance Computation (GCTA/TASTM)", "canapprove"), 
    getAttendanceReport
);


router.post('/audit-export', 
    authenticateToken, 
    authorize("Time Allowance Computation (GCTA/TASTM)", "canview"), 
    auditReportExport
);
module.exports = router;