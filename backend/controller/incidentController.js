// backend/controllers/incidentController.js
const pool = require("../db/pool");

const recordIncident = async (req, res) => {
  // 1. Destructure all fields including the new 'remarks'
  const { pdl_id, category, incident_date, penalty_end_date, remarks } = req.body;
  
  try {
    // Start Transaction: Ensure both tables update or none at all
    await pool.query('BEGIN');
    console.log(incident_date);

    // 2. Insert the record into incident_tbl (5 parameters now)
    const incidentQuery = `
      INSERT INTO incident_tbl (pdl_id, category, incident_date, penalty_end_date, remarks)
      VALUES ($1, $2, $3, $4, $5)
    `;
    await pool.query(incidentQuery, [
      pdl_id, 
      category, 
      incident_date, 
      penalty_end_date, 
      remarks
    ]);

    // 3. Immediately Lock the PDL in the main table
    // This ensures they show up as "Locked" in the Reports immediately
    const lockQuery = `
      UPDATE pdl_tbl 
      SET is_locked_for_gcta = true 
      WHERE pdl_id = $1
    `;
    await pool.query(lockQuery, [pdl_id]);

    await pool.query('COMMIT');
    
    res.status(201).json({ 
      message: "Incident encoded and PDL GCTA status is now LOCKED." 
    });

  } catch (err) {
    // If any step fails, undo everything
    await pool.query('ROLLBACK');
    console.error("Incident Recording Error:", err.message);
    res.status(500).json({ 
      error: "Server Error: Failed to encode disciplinary action." 
    });
  }
};

module.exports = { 
    recordIncident 
};