const pool = require("../db/pool");

const getReportStats = async (req, res) => {
  try {
    const statsQuery = `
      SELECT 
        (SELECT COALESCE(SUM(days_earned), 0) FROM gcta_days_log) as total_gcta,
        (SELECT COALESCE(SUM(days_earned), 0) FROM tastm_days_log) as total_tastm,
        (SELECT COUNT(*) FROM incident_tbl WHERE date_part('month', incident_date) = date_part('month', CURRENT_DATE)) as monthly_incidents,
        (SELECT COUNT(*) FROM pdl_tbl) as total_pdls
    `;
    const result = await pool.query(statsQuery);
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error("Stats Error:", err.message);
    res.status(200).json({ total_gcta: 0, total_tastm: 0, monthly_incidents: 0, total_pdls: 0 });
  }
};


const getMonthlySummary = async (req, res) => {
  try {
    const query = `
      WITH LastLog AS (
        SELECT DISTINCT ON (pdl_id) 
          pdl_id, days_earned, total_hours_accumulated, month_year
        FROM tastm_days_log
        ORDER BY pdl_id, month_year DESC
      )
      SELECT 
        p.pdl_id, 
        p.last_name, 
        p.first_name,
        p.is_locked_for_gcta, 
        
        -- ⏱️ TASTM CALCULATIONS (Labor)
        CASE WHEN ll.days_earned = 0 THEN ll.total_hours_accumulated ELSE 0 END as carry_over_hours,
        COALESCE((SELECT SUM(hours_attended) FROM attendance_tbl a WHERE a.pdl_id = p.pdl_id AND date_part('month', a.timestamp_in) = date_part('month', CURRENT_DATE)), 0) as current_month_hours,
        (CASE WHEN ll.days_earned = 0 THEN ll.total_hours_accumulated ELSE 0 END + 
         COALESCE((SELECT SUM(hours_attended) FROM attendance_tbl a WHERE a.pdl_id = p.pdl_id AND date_part('month', a.timestamp_in) = date_part('month', CURRENT_DATE)), 0)
        ) as running_balance_hours,

        -- ⚖️ GCTA CALCULATIONS (Conduct)
        -- Summing ALL days ever earned from the GCTA log for this specific PDL
        COALESCE((SELECT SUM(days_earned) FROM gcta_days_log g WHERE g.pdl_id = p.pdl_id), 0) as total_gcta_days,
        
        -- ⏱️ TASTM BANKED TOTAL
        COALESCE((SELECT SUM(days_earned) FROM tastm_days_log WHERE pdl_id = p.pdl_id), 0) as total_tastm_days,
        
        -- ⚠️ INCIDENT TRACKING
        (SELECT COUNT(*) FROM incident_tbl i WHERE i.pdl_id = p.pdl_id) as incident_count

      FROM pdl_tbl p
      LEFT JOIN LastLog ll ON p.pdl_id = ll.pdl_id
      ORDER BY p.last_name ASC
    `;
    
    const result = await pool.query(query);
    console.log(result.rows);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Monthly Summary Error:", err.message);
    res.status(500).json({ error: "Check SQL Logic for GCTA Summing" });
  }
};



module.exports = { getReportStats, getMonthlySummary };