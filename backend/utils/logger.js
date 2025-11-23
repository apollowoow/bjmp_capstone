const logAction = async (client, userId, action, tableName, recordId, details, ipAddress) => {
  try {
    // We added $6 for the IP Address
    const query = `
      INSERT INTO audit_log_tbl 
      (user_id, action_type, table_name, record_id, details, ip_address, timestamp)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
    `;

    // If ipAddress is not provided, it defaults to 'Unknown'
    await client.query(query, [userId, action, tableName, recordId, details, ipAddress || 'Unknown']);

  } catch (error) {
    console.error("⚠️ AUDIT LOG FAILED:", error.message);
  }
};

module.exports = { logAction };