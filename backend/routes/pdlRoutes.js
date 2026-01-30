const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const pool = require("../db/pool");

// ==========================
// IMPORT CONTROLLERS
// ==========================
const { addPDL, getAllPDL, updatePDL } = require("../controller/pdlController");

// ==========================
// IMPORT MIDDLEWARE
// ==========================
const { authenticateToken } = require("../middleware/authMiddleware");

// ==========================
// MULTER CONFIGURATION
// ==========================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Saves to public/uploads/ in your root directory
    cb(null, 'public/uploads/'); 
  },
  filename: (req, file, cb) => {
    // Unique naming to prevent overwriting
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `pdl-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// ==========================
// 🛡️ RFID VALIDATION MIDDLEWARE
// ==========================
const validateRFID = async (req, res, next) => {
  const { rfidNumber } = req.body;

  try {
    const rfidCheck = await pool.query(
      "SELECT pdl_id FROM pdl_tbl WHERE rfid_number = $1", 
      [rfidNumber]
    );

    if (rfidCheck.rows.length > 0) {
      // 🚨 Duplicate found: Delete the file Multer just saved
      if (req.file) {
        fs.unlinkSync(req.file.path); 
      }
      return res.status(400).json({ error: "RFID Tag is already assigned to another record." });
    }

    // Unique! Move to controller
    next();
  } catch (err) {
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: "Database validation error." });
  }
};

// ==========================
// DEFINE ROUTES
// ==========================

// Get all PDLs
router.get("/getall", authenticateToken, getAllPDL);

// Add New PDL 
// (Auth -> Upload -> Validate RFID -> Save to DB)
router.post("/", authenticateToken, upload.single("profile_photo"), validateRFID, addPDL);

// Update PDL


module.exports = router;