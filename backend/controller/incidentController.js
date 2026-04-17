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

    // --- 🎯 CONCATENATION LOGIC START ---
    // 1. Kunin muna natin yung pinaka-latest na penalty_end_date ni PDL
    const checkDateQuery = `SELECT MAX(penalty_end_date) as last_end FROM incident_tbl WHERE pdl_id = $1`;
    const dateRes = await client.query(checkDateQuery, [pdl_id]);
    const lastEnd = dateRes.rows[0].last_end;

    // 2. Kalkulahin kung gaano kahaba yung duration na pinasa mula sa frontend
    const durationMs = new Date(penalty_end_date) - new Date(incident_date);
    
    let finalEndDate;
    const today = new Date();

    // 3. Kung may pending penalty pa (lastEnd > today), doon natin idudugtong (concatenate)
    if (lastEnd && new Date(lastEnd) > today) {
      finalEndDate = new Date(new Date(lastEnd).getTime() + durationMs);
    } else {
      // Kung wala, regular flow lang (incident_date + duration)
      finalEndDate = new Date(new Date(incident_date).getTime() + durationMs);
    }
    // --- 🎯 CONCATENATION LOGIC END ---

    // 1. Insert the incident record (Gamit na natin yung finalEndDate)
    const incidentQuery = `
      INSERT INTO incident_tbl (pdl_id, category, incident_date, penalty_end_date, remarks)
      VALUES ($1, $2, $3, $4, $5)
    `;
    await client.query(incidentQuery, [
      pdl_id, 
      category, 
      incident_date, 
      finalEndDate.toISOString(), // 👈 Stacked date na ito
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
        message: `Incident recorded: ${category}. Penalty stacked. New End Date: ${finalEndDate.toISOString().split('T')[0]}`,
        category: category,
        incident_date: incident_date,
        penalty_ends: finalEndDate.toISOString(), // 👈 Stacked date sa log
        remarks: remarks,
        system_impact: "GCTA eligibility suspended"
      },
      ipAddress: clientIp
    });

    await client.query('COMMIT');
    
    res.status(201).json({ 
      message: "Incident encoded and penalty has been concatenated/stacked." 
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