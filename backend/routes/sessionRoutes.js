const express = require('express');
const router = express.Router();
const path = require('path');

// ==========================
// IMPORT CONTROLLERS
// ==========================
const sessionCtrl = require('../controller/sessionController');

// ==========================
// IMPORT MIDDLEWARE
// ==========================
const { authenticateToken } = require("../middleware/authMiddleware");

// ==========================
// DEFINE ROUTES
// ==========================

/**
 * @route   POST /api/sessions/start
 * @desc    Initialize a new W&D session in session_tbl
 * @access  Protected
 */
router.post('/start', authenticateToken, sessionCtrl.startSession);

/**
 * @route   POST /api/sessions/log-attendance
 * @desc    Record an RFID tap into attendance_tbl
 * @access  Protected
 */
router.post('/log-attendance', authenticateToken, sessionCtrl.logAttendance);

/**
 * @route   POST /api/sessions/finalize/:session_id
 * @desc    Sync session hours to the PDL's permanent record
 * @access  Protected
 */
router.post('/finalize/:session_id', authenticateToken, sessionCtrl.finalizeSession);

router.get('/history', authenticateToken, sessionCtrl.getSessionHistory);
router.get('/search-pdl', sessionCtrl.searchPdls);

/**
 * @route   DELETE /api/sessions/cancel/:session_id
 * @desc    Discard session and all linked attendance logs (Cascade)
 * @access  Protected
 */
router.delete('/cancel/:session_id', authenticateToken, sessionCtrl.cancelSession);

/**
 * @route   GET /api/sessions/details/:id
 * @desc    Fetch session metadata and all attendees for management
 * @access  Protected
 */
router.get('/details/:id', authenticateToken, sessionCtrl.getSessionDetails);

/**
 * @route   PUT /api/sessions/update-attendance-hours
 * @desc    Update a specific PDL's hours for a specific session (Overtime/Correction)
 * @access  Protected
 */
router.put('/update-attendance-hours', authenticateToken, sessionCtrl.updateAttendanceHours);

module.exports = router;