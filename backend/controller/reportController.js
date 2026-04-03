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
const getGeneralSummary = async (req, res) => {
  try {
    const { month } = req.query; 

    const query = `
      SELECT 
        p.pdl_id, p.last_name, p.first_name, p.is_locked_for_gcta,
        
        -- 🟢 ACTIVE CREDITS
        COALESCE((SELECT SUM(days_earned) FROM gcta_days_log g 
                  WHERE g.pdl_id = p.pdl_id AND g.status = 'Active' AND TO_CHAR(g.month_year, 'YYYY-MM') = $1), 0) as active_gcta,
        
        -- 🔴 VOIDED/DQ'D CREDITS
        COALESCE((SELECT SUM(days_earned) FROM gcta_days_log g 
                  WHERE g.pdl_id = p.pdl_id AND g.status = 'Voided' AND TO_CHAR(g.month_year, 'YYYY-MM') = $1), 0) as voided_gcta,

        -- 📝 REMARKS AGGREGATION (The "Why")
        -- This joins all remarks from GCTA and TASTM logs for that month into one line
        COALESCE((
          SELECT STRING_AGG(DISTINCT remarks, ' | ') 
          FROM (
            SELECT remarks FROM gcta_days_log WHERE pdl_id = p.pdl_id AND TO_CHAR(month_year, 'YYYY-MM') = $1
            UNION
            SELECT remarks FROM tastm_days_log WHERE pdl_id = p.pdl_id AND TO_CHAR(month_year, 'YYYY-MM') = $1
          ) AS combined_remarks
        ), 'No specific remarks') as msec_remarks,

        -- TASTM Totals (Active Only)
        COALESCE((SELECT SUM(days_earned) FROM tastm_days_log t 
                  WHERE t.pdl_id = p.pdl_id AND t.status = 'Active' AND TO_CHAR(t.month_year, 'YYYY-MM') = $1), 0) as active_tastm

      FROM pdl_tbl p
      -- Show PDL if they have ANY record (Active or Voided) this month
      WHERE EXISTS (
          SELECT 1 FROM gcta_days_log g WHERE g.pdl_id = p.pdl_id AND TO_CHAR(g.month_year, 'YYYY-MM') = $1
      ) OR EXISTS (
          SELECT 1 FROM tastm_days_log t WHERE t.pdl_id = p.pdl_id AND TO_CHAR(t.month_year, 'YYYY-MM') = $1
      )
      ORDER BY p.last_name ASC;
    `;
    
    const result = await pool.query(query, [month]);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Audit Report Error:", err.message);
    res.status(500).json({ error: "Failed to pull full audit logs." });
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