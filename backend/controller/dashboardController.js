// backend/controllers/dashboardController.js
const pool = require("../db/pool");

const getDashboardStats = async (req, res) => {
  try {
    // We only query pdl_tbl. No other relations exist here.
    const [
      totalData,
      detainedData,
      sentencedData
    ] = await Promise.all([
      // 1. Total Inmates
      pool.query("SELECT COUNT(*) FROM pdl_tbl"),

      // 2. Count by Status: Detained
      pool.query("SELECT COUNT(*) FROM pdl_tbl WHERE pdl_status = 'Detained'"),

      // 3. Count by Status: Sentenced
      pool.query("SELECT COUNT(*) FROM pdl_tbl WHERE pdl_status = 'Sentenced'")
    ]);

    res.json({
      totalPdl: totalData.rows[0].count,
      detained: detainedData.rows[0].count,
      sentenced: sentencedData.rows[0].count,
      highRisk: 0, // Placeholder
      recentIncidents: [] // Empty array placeholder
    });

  } catch (err) {
    // If it still errors, it means the table name or columns are still mismatched
    console.error("Dashboard OCD Check:", err.message);
    res.status(500).json({ error: "Dashboard simplified to prevent errors." });
  }
};

module.exports = { getDashboardStats };