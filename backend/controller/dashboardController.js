const pool = require("../db/pool");

const getDashboardStats = async (req, res) => {
  try {
    // We use Promise.all to run these queries at the same time (Faster!)
    const [
      totalPdlData,
      highRiskData,
      detainedData,
      sentencedData,
      recentIncidents
    ] = await Promise.all([
      // 1. Total PDL Count
      pool.query("SELECT COUNT(*) FROM pdltable"),

      // 2. Count High Risk PDLs
      pool.query("SELECT COUNT(*) FROM behaviorscoretbl WHERE risklevel = 'High'"),

      // 3. Count Detainees (Pending Cases)
      pool.query("SELECT COUNT(*) FROM pdltable WHERE casestatus = 'Detained'"),

      // 4. Count Convicts (Sentenced)
      pool.query("SELECT COUNT(*) FROM pdltable WHERE casestatus = 'Sentenced'"),

      // 5. Get 5 Most Recent Incidents (Joined with PDL name)
      pool.query(`
        SELECT i.incidenttype, i.dateoccurred, p.firstname, p.lastname 
        FROM incidenttbl i
        JOIN pdltable p ON i.pdlid = p.pdlid
        ORDER BY i.dateoccurred DESC 
        LIMIT 5
      `)
    ]);

    res.json({
      totalPdl: totalPdlData.rows[0].count,
      highRisk: highRiskData.rows[0].count,
      detained: detainedData.rows[0].count,
      sentenced: sentencedData.rows[0].count,
      recentIncidents: recentIncidents.rows
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

module.exports = { getDashboardStats };