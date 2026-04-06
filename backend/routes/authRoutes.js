// backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { loginUser, verifySessionPassword } = require('../controller/authController');

// 🎯 FIX: Match the name with your middleware file
const { authenticateToken } = require('../middleware/authMiddleware'); 

router.post('/login', loginUser);

// 🛡️ Gamitin ang tamang pangalan dito
router.post('/verify-session-password', authenticateToken, verifySessionPassword);

module.exports = router;