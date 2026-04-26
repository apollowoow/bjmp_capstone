const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const pool = require("../db/pool");

// ==========================
// IMPORT CONTROLLERS
// ==========================
const { 
    addPDL, getAllPDL, getPdlById, updatePDL, updatePdlJudicialRecord, 
     recalculatePdlSentence, releasePdl, getReleasedPdls, 
    getReleasedPdlById, updatePersonalInfo, recommitPDL, upsertSubsidiary, checkRfidExists, getPDLFullDossier 
} = require("../controller/pdlController");

// ==========================
// IMPORT MIDDLEWARE
// ==========================
const { authenticateToken } = require("../middleware/authMiddleware");
const authorize = require("../middleware/authorize"); // 🎯 The Gatekeeper

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
router.get("/check-rfid/:rfid", 
    authenticateToken, 
    authorize("PDL & RFID Management", "cancreate"), 
    checkRfidExists
);

router.get("/getall", 
    authenticateToken, 
    authorize("PDL & RFID Management", "canview"), 
    getAllPDL
);

router.get("/history/:id", 
    authenticateToken, 
    authorize("PDL & RFID Management", "canview"), 
    getPDLFullDossier
);


router.get('/get/:id', 
    authenticateToken, 
    authorize("PDL & RFID Management", "canview"), 
    getPdlById
);

router.get("/releaseall", 
    authenticateToken, 
    authorize("PDL & RFID Management", "canview"), 
    getReleasedPdls
);

router.get('/getrelease/:id', 
    authenticateToken, 
    authorize("PDL & RFID Management", "canview"), 
    getReleasedPdlById
);

// 📝 CREATING (Adding new prisoners)
router.post("/", 
    authenticateToken, 
    authorize("PDL & RFID Management", "cancreate"), 
    upload.single("profile_photo"), 
    validateRFID, 
    addPDL
); 

// ✏️ EDITING (Updating profiles/personal info)
router.put(
    '/update-personal/:id', 
    authenticateToken, 
    authorize("PDL & RFID Management", "canedit"), 
    upload.single('profile_photo'), 
    updatePersonalInfo
);//audit done

router.put("/update/:id", 
    authenticateToken, 
    authorize("PDL & RFID Management", "canapprove"), 
    updatePdlJudicialRecord
);//audit done

router.post('/upsert', 
    authenticateToken, 
    authorize("PDL & RFID Management", "canedit"), 
    upsertSubsidiary
);//audit done

router.put(
    '/recommit/:id', 
    authenticateToken, 
    authorize("PDL & RFID Management", "canedit"), 
    upload.single('profile_photo'), 
    recommitPDL
);//adudit done


// ==========================================
// ⚖️ TIME ALLOWANCE & SENTENCE (Heavy Stuff)
// ==========================================

// Recalculating is part of management/edit
router.post('/recalculate/:id', 
    authenticateToken, 
    authorize("PDL & RFID Management", "canedit"), 
    recalculatePdlSentence
);


router.post("/release/:id", 
    authenticateToken, 
    authorize("Time Allowance Computation (GCTA/TASTM)", "canapprove"), 
    releasePdl
);//audit done

module.exports = router;