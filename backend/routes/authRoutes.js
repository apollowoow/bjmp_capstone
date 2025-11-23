// backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { loginUser } = require('../controller/authController');

// This creates the endpoint: POST /api/auth/login
router.post('/login', loginUser);

module.exports = router;