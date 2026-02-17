const express = require("express");
const router = express.Router();

// 🎯 Ensure this path and variable name are correct
const { recordIncident } = require("../controller/incidentController");

// This line was crashing because 'recordIncident' was undefined above
router.post("/record", recordIncident);

module.exports = router;