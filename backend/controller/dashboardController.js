// backend/controllers/dashboardController.js


// backend/controllers/dashboardController.js
const pool = require("../db/pool");

const getDashboardStats = async (req, res) => {
  try {
    const [total, detained, sentenced, locked, frequent, recent] = await Promise.all([
      pool.query("SELECT COUNT(*) FROM pdl_tbl"),
      pool.query("SELECT COUNT(*) FROM pdl_tbl WHERE pdl_status = 'Detained'"),
      pool.query("SELECT COUNT(*) FROM pdl_tbl WHERE pdl_status = 'Sentenced'"),
      pool.query("SELECT COUNT(*) FROM pdl_tbl WHERE is_locked_for_gcta = true"),
      // 🎯 NEW: Count PDLs with 2 or more incidents
      pool.query(`
        SELECT COUNT(*) FROM (
          SELECT pdl_id FROM incident_tbl 
          GROUP BY pdl_id 
          HAVING COUNT(incident_id) >= 2
        ) AS repeat_violators
      `),
      pool.query(`
        SELECT p.first_name, p.last_name, i.category, i.incident_date 
        FROM incident_tbl i 
        JOIN pdl_tbl p ON i.pdl_id = p.pdl_id 
        ORDER BY i.incident_id DESC LIMIT 5
      `)
    ]);

    res.json({
      totalPdl: parseInt(total.rows[0].count),
      detained: parseInt(detained.rows[0].count),
      sentenced: parseInt(sentenced.rows[0].count),
      lockedCount: parseInt(locked.rows[0].count),
      frequentViolators: parseInt(frequent.rows[0].count), // 🎯 Updated count
      recentIncidents: recent.rows.map(row => ({
        firstname: row.first_name,
        lastname: row.last_name,
        incidenttype: row.category,
        dateoccurred: row.incident_date
      }))
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Dashboard sync failed." });
  }
};

module.exports = { getDashboardStats };