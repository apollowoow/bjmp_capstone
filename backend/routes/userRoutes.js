const express = require("express");
const router = express.Router();

// ==========================
// IMPORT CONTROLLERS
// ==========================
const { createUser, resetUserPassword, updateUserStatus, getUsers, getAuditLogs, getAuditActions } = require("../controller/userController");

// ==========================
// IMPORT MIDDLEWARE
// ==========================
const { authenticateToken } = require("../middleware/authMiddleware");
const authorize = require("../middleware/authorize");

// ==========================================
// 👤 USER MANAGEMENT ROUTES
// ==========================================

/**
 * @route   POST /api/users/
 * @desc    Create a new system account (Staff/Officer/Admin)
 * @access  Protected (Admin Only - Module 5 "cancreate")
 */
router.post("/", 
    authenticateToken, 
    authorize("User Management", "cancreate"), // 🎯 The Lock
    createUser
);// audit done


router.get('/', authenticateToken, authorize("User Management", "canview"), getUsers);

// 🚫 Change Status (Needs canedit)
router.post('/status', authenticateToken, authorize("User Management", "canedit"), updateUserStatus);

// 🔑 Reset Password (Needs canedit)
router.post('/reset-password', authenticateToken, authorize("User Management", "canedit"), resetUserPassword);
router.get(
    '/audit', 
    authenticateToken, 
    authorize("User Management", "canview"), 
    getAuditLogs
);

router.get('/audit-actions', authenticateToken, getAuditActions);

module.exports = router;