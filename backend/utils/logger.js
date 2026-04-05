/**
 * 📜 Unified Audit Logger
 * @param {Object} client - The DB client (to keep it inside the same transaction)
 * @param {Object} params - Logging details
 */
const logAction = async (client, { userId, action, tableName, recordId = null, pdlId = null, details = {}, ipAddress = 'Unknown' }) => {
  try {
    // 🎯 Now includes pdl_id ($5) and handles JSONB details ($6)
    const query = `
      INSERT INTO audit_log_tbl 
      (user_id, action_type, table_name, record_id, pdl_id, details, ip_address, timestamp)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
    `;

    // The 'pg' driver handles JS objects for JSONB columns automatically
    const values = [
      userId, 
      action, 
      tableName, 
      recordId, 
      pdlId, 
      details, 
      ipAddress
    ];

    await client.query(query, values);

  } catch (error) {
    // We console.error but don't 'throw' to prevent crashing the main business logic
    console.error("⚠️ AUDIT LOG FAILED:", error.message);
  }
};

module.exports = { logAction };