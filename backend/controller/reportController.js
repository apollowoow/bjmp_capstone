const pool = require("../db/pool");

// 1. 📊 HIGH-LEVEL STATS (For the Dashboard/Report Widgets)
const getReportStats = async (req, res) => {
  try {
    const statsQuery = `
      SELECT 
        (SELECT COALESCE(SUM(days_earned), 0) FROM gcta_days_log WHERE status = 'Active') as total_gcta,
        (SELECT COALESCE(SUM(days_earned), 0) FROM tastm_days_log WHERE status = 'Active') as total_tastm,
        (SELECT COUNT(*) FROM incident_tbl WHERE date_part('month', incident_date) = date_part('month', CURRENT_DATE)) as monthly_incidents,
        (SELECT COUNT(*) FROM pdl_tbl) as total_pdls
    `;
    const result = await pool.query(statsQuery);
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error("Stats Error:", err.message);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
};

// 2. 📋 GENERAL SUMMARY (GCTA + TASTM Combined)
// In your reportsController.js -> getGeneralSummary
const getGeneralSummary = async (req, res) => {
  const { month } = req.query; 
  console.log(`[REPORTS] 📥 Request received for Audit Month: ${month}`);

  try {
    const query = `
        SELECT 
          p.pdl_id, p.last_name, p.first_name, 
          p.is_locked_for_gcta, 
          p.expected_releasedate, 
          p.date_commited_pnp,           
          p.original_release_date,       
          p.total_timeallowance_earned,  
          p.crime_name,                  

          -- Monthly active sums
          COALESCE((SELECT SUM(days_earned) FROM gcta_days_log WHERE pdl_id = p.pdl_id AND status = 'Active' AND TO_CHAR(month_year, 'YYYY-MM') = $1), 0) as active_gcta,
          COALESCE((SELECT SUM(days_earned) FROM tastm_days_log WHERE pdl_id = p.pdl_id AND status = 'Active' AND TO_CHAR(month_year, 'YYYY-MM') = $1), 0) as active_tastm,
          
          -- Audit Remarks logic
          COALESCE((SELECT SUM(days_earned) FROM gcta_days_log WHERE pdl_id = p.pdl_id AND status = 'Voided' AND TO_CHAR(month_year, 'YYYY-MM') = $1), 0) as voided_gcta,
          COALESCE((SELECT SUM(days_earned) FROM tastm_days_log WHERE pdl_id = p.pdl_id AND status = 'Voided' AND TO_CHAR(month_year, 'YYYY-MM') = $1), 0) as voided_tastm,

          COALESCE((
            SELECT STRING_AGG(DISTINCT remarks, ' | ') 
            FROM (
              SELECT remarks FROM gcta_days_log WHERE pdl_id = p.pdl_id AND status = 'Voided' AND TO_CHAR(month_year, 'YYYY-MM') = $1
              UNION
              SELECT remarks FROM tastm_days_log WHERE pdl_id = p.pdl_id AND status = 'Voided' AND TO_CHAR(month_year, 'YYYY-MM') = $1
            ) AS r
          ), 'No violations') as audit_remarks

        FROM pdl_tbl p
        WHERE 
            EXISTS (SELECT 1 FROM gcta_days_log WHERE pdl_id = p.pdl_id AND status IN ('Active', 'Voided') AND TO_CHAR(month_year, 'YYYY-MM') = $1) 
            OR EXISTS (SELECT 1 FROM tastm_days_log WHERE pdl_id = p.pdl_id AND status IN ('Active', 'Voided') AND TO_CHAR(month_year, 'YYYY-MM') = $1)
            OR (p.expected_releasedate IS NOT NULL AND p.expected_releasedate <= CURRENT_DATE + INTERVAL '45 days')
        ORDER BY p.expected_releasedate ASC NULLS LAST;
      `;
    
    const result = await pool.query(query, [month]);
    
    // 📝 BACKEND LOG: You'll see this in your terminal
    console.log(`[REPORTS] ✅ Success. Audit Month: ${month}`);
    console.log("--- START OF RETURNED ROWS ---");
    console.log(JSON.stringify(result.rows, null, 2)); // 🎯 This prints the actual data
    console.log("--- END OF RETURNED ROWS ---");
    res.status(200).json(result.rows);

  } catch (err) {
    console.error("[REPORTS] ❌ FATAL ERROR:", err.message);
    res.status(500).json({ error: "Failed to generate audit data." });
  }
};
// 3. 🎯 PREDICTIVE RELEASE FORECAST (The "Analytics" Logic)
const getPredictiveReport = async (req, res) => {
  try {
    const query = `
      SELECT 
        p.pdl_id, p.last_name, p.first_name, p.sentence_expiry_date,
        -- Calculate total days earned
        (COALESCE((SELECT SUM(days_earned) FROM gcta_days_log WHERE pdl_id = p.pdl_id AND status = 'Active'), 0) +
         COALESCE((SELECT SUM(days_earned) FROM tastm_days_log WHERE pdl_id = p.pdl_id AND status = 'Active'), 0)) as total_credits,
        -- Calculate current predicted release date
        (p.sentence_expiry_date - (
            COALESCE((SELECT SUM(days_earned) FROM gcta_days_log WHERE pdl_id = p.pdl_id AND status = 'Active'), 0) +
            COALESCE((SELECT SUM(days_earned) FROM tastm_days_log WHERE pdl_id = p.pdl_id AND status = 'Active'), 0)
        ) * INTERVAL '1 day') as predicted_release_date
      FROM pdl_tbl p
      WHERE p.sentence_expiry_date > CURRENT_DATE
      ORDER BY predicted_release_date ASC
    `;
    const result = await pool.query(query);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Predictive Error:", err.message);
    res.status(500).json({ error: "Predictive Analytics failed" });
  }
};

module.exports = { getReportStats, getGeneralSummary, getPredictiveReport };