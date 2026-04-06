const express = require('express');
const router = express.Router();
const sessionCtrl = require('../controller/sessionController');

// ==========================
// IMPORT MIDDLEWARE
// ==========================
const { authenticateToken } = require("../middleware/authMiddleware");
const authorize = require("../middleware/authorize");

// ==========================================
// 🕒 MODULE: "Attendance & Sessions"
// ==========================================

router.post('/start', 
    authenticateToken, 
    authorize("Attendance & Sessions", "cancreate"), 
    sessionCtrl.startSession
);//audit done

router.post('/finalize/:session_id', 
    authenticateToken, 
    // 🎯 Change module to "Attendance & Sessions" and permission to "canedit"
    authorize("Attendance & Sessions", "canedit"), 
    sessionCtrl.finalizeSession
);//audit done

router.post('/log-attendance', 
    authenticateToken, 
    authorize("Attendance & Sessions", "cancreate"), 
    sessionCtrl.logAttendance
);

router.put('/update-attendance-hours', 
    authenticateToken, 
    authorize("Attendance & Sessions", "canedit"), 
    sessionCtrl.updateAttendanceHours
);//auditdone

router.delete('/remove-attendance/:session_id/:pdl_id', 
    authenticateToken, 
    authorize("Attendance & Sessions", "candelete"), 
    sessionCtrl.removeAttendance
);//done

router.delete('/cancel/:session_id', 
    authenticateToken, 
    authorize("Attendance & Sessions", "candelete"), 
    sessionCtrl.cancelSession
);//auditdone

router.get('/history', 
    authenticateToken, 
    authorize("Attendance & Sessions", "canview"), 
    sessionCtrl.getSessionHistory
);

router.get('/tampered', 
    authenticateToken, 
    authorize("Attendance & Sessions", "canview"), 
    sessionCtrl.getTamperedRecords
);
router.get('/details/:id', 
    authenticateToken, 
    authorize("Attendance & Sessions", "canview"), 
    sessionCtrl.getSessionDetails
);

router.post('/reload/:session_id', 
    authenticateToken, 
    authorize("Attendance & Sessions", "canview"), 
    sessionCtrl.reloadSession
);//aduit done


router.post('/repair-integrity', 
    authenticateToken, 
    authorize("Attendance & Sessions", "canedit"), 
    sessionCtrl.repairAttendanceIntegrity
);

router.post('/repair-credits', 
    authenticateToken, 
    authorize("Time Allowance Computation (GCTA/TASTM)", "canedit"), // 🎯 Permission matched to the Audit module
    sessionCtrl.repairCreditIntegrity
);

// ==========================================
// ⚖️ MODULE: "Time Allowance Computation (GCTA/TASTM)"
// ==========================================

router.post('/silent-gcta-sync', 
    authenticateToken, 
    authorize("Time Allowance Computation (GCTA/TASTM)", "canapprove"), 
    sessionCtrl.silentGctaSync
); //audit done

router.post('/silent-tastm-sync', 
    authenticateToken, 
    authorize("Time Allowance Computation (GCTA/TASTM)", "canapprove"), 
    sessionCtrl.silentTastmSync
);//audit done


// ==========================================
// 🚫 MODULE: "Conduct & Penalties" (MSEC Evaluation)
// ==========================================

router.get('/msec/evaluation', 
    authenticateToken, 
    authorize("Conduct & Penalties", "canview"), 
    sessionCtrl.getMonthlyEvaluation
);

router.post('/msec/disqualify', 
    authenticateToken, 
    authorize("Conduct & Penalties", "canedit"), 
    sessionCtrl.disqualifyPdlMonthly
);//audit done

router.post('/msec/reenable', 
    authenticateToken, 
    authorize("Conduct & Penalties", "canedit"), 
    sessionCtrl.reenablePdlMonthly
);//adudit done


router.get('/restored-records',  authenticateToken, 
    authorize("User Management", "canview"),  sessionCtrl.getRestoredRecords);

// ==========================================
// 🔍 MODULE: "PDL & RFID Management"
// ==========================================

router.get('/search-pdl', 
    authenticateToken, 
    authorize("PDL & RFID Management", "canview"), 
    sessionCtrl.searchPdls
);

module.exports = router;