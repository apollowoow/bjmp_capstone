const express = require('express');
const router = express.Router();
const maintenanceCtrl = require('../controller/maintenanceController');

// ==========================
// IMPORT MIDDLEWARE
// ==========================
const { authenticateToken } = require("../middleware/authMiddleware");
const authorize = require("../middleware/authorize");

// ==========================================
// 🛡️ MODULE: "System Maintenance / User Management"
// ==========================================

// 📂 View list of snapshots - Needs 'canview'
router.get('/snapshots', 
    authenticateToken, 
    authorize("User Management", "canview"), 
    maintenanceCtrl.getSnapshots
);

// 📸 Create a new backup - Needs 'cancreate'
router.post('/backup', 
    authenticateToken, 
    authorize("User Management", "cancreate"), 
    maintenanceCtrl.createSnapshot
);

// 🔄 Restore the system - The "Nuclear Option", needs 'canapprove'
router.post('/restore', 
    authenticateToken, 
    authorize("User Management", "canapprove"), 
    maintenanceCtrl.restoreSnapshot
);

module.exports = router;