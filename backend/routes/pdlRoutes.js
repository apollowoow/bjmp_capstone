const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

// ==========================
// IMPORT CONTROLLERS
// ==========================
const { addPDL, getAllPDL, updatePDL } = require("../controller/pdlController");

// ==========================
// IMPORT MIDDLEWARE
// ==========================
const { authenticateToken } = require("../middleware/authMiddleware");

// ==========================
// MULTER CONFIGURATION (Image Upload)
// ==========================
// This defines where the file goes and what it's named
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Files will be saved in backend/public/uploads/
    // Make sure this folder exists!
    cb(null, "public/uploads/"); 
  },
  filename: (req, file, cb) => {
    // Create a unique filename: pdl-timestamp-random.jpg
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'pdl-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Initialize the upload middleware
// 'limits' is optional, but good for security (set here to 5MB)
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } 
});

// ==========================
// DEFINE ROUTES
// ==========================

// 1. Get All PDLs
router.get("/getall", authenticateToken, getAllPDL);

// 2. Add New PDL (With Image Upload)
// 'upload.single("profile_photo")' intercepts the request to save the file
// BEFORE it reaches your 'addPDL' controller.
router.post("/", authenticateToken, upload.single("profile_photo"), addPDL);

// 3. Update PDL Info
router.put("/:id", authenticateToken, updatePDL);

module.exports = router;