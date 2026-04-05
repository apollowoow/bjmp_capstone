// backend/controllers/incidentController.js
const pool = require("../db/pool");
const { logAction } = require('../utils/logger'); 

const recordIncident = async (req, res) => {
  const { pdl_id, category, incident_date, penalty_end_date, remarks } = req.body;
  const client = await pool.connect();

  // 🛡️ Metadata for Audit Trail
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const currentUserId = req.user ? req.user.id : 1;

  try {
    await client.query('BEGIN');

    // 1. Insert the incident record
    const incidentQuery = `
      INSERT INTO incident_tbl (pdl_id, category, incident_date, penalty_end_date, remarks)
      VALUES ($1, $2, $3, $4, $5)
    `;
    await client.query(incidentQuery, [
      pdl_id, 
      category, 
      incident_date, 
      penalty_end_date, 
      remarks
    ]);

    // 2. Lock the PDL's GCTA status
    const lockQuery = `
      UPDATE pdl_tbl 
      SET is_locked_for_gcta = true 
      WHERE pdl_id = $1
    `;
    await client.query(lockQuery, [pdl_id]);

    // --- 🛡️ STEP 3: THE DISCIPLINARY AUDIT LOG ---
    await logAction(client, {
      userId: currentUserId,
      action: 'RECORD_DISCIPLINARY_INCIDENT',
      tableName: 'incident_tbl',
      recordId: pdl_id, 
      pdlId: pdl_id,
      details: {
        message: `Incident recorded: ${category}. PDL GCTA status set to LOCKED.`,
        category: category,
        incident_date: incident_date,
        penalty_ends: penalty_end_date,
        remarks: remarks,
        system_impact: "GCTA eligibility suspended"
      },
      ipAddress: clientIp
    });

    await client.query('COMMIT');
    
    res.status(201).json({ 
      message: "Incident encoded and PDL GCTA status is now LOCKED." 
    });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error("Incident Recording Error:", err.message);
    res.status(500).json({ 
      error: "Server Error: Failed to encode disciplinary action." 
    });
  } finally {
    client.release();
  }
};

module.exports = { 
    recordIncident 
};