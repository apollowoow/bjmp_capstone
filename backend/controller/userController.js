const pool = require("../db/pool");
const bcrypt = require("bcrypt");
const { logAction } = require('../utils/logger'); 

const createUser = async (req, res) => {
  const client = await pool.connect();

  // 🛡️ Metadata for Audit Trail
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  // Use the logged-in user's ID from the token, fallback to body or ID 1
  const operatorId = req.user ? req.user.id : (req.body.currentUserId || 1);

  try {
    const { username, password, fullName, roleid, status } = req.body;

    // 1. Validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&])[A-Za-z\d@$!%*?#&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ error: "Password too weak." });
    }

    const checkUser = await client.query(
      "SELECT * FROM usertbl WHERE username = $1 OR LOWER(fullname) = LOWER($2)",
      [username, fullName]
    );
    if (checkUser.rows.length > 0) {
      return res.status(400).json({ error: "Username or Full Name already exists" });
    }

    // 2. Start Transaction
    await client.query('BEGIN');

    // 3. Encrypt Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Insert User
    const query = `
      INSERT INTO usertbl (username, password, fullname, roleid, status)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING userid, username, fullname, roleid;
    `;
    const result = await client.query(query, [username, hashedPassword, fullName, roleid, status]);
    const newUser = result.rows[0];

    // --- 🛡️ STEP 5: Standardized logAction ---
    await logAction(client, {
      userId: operatorId,
      action: 'CREATE_USER',
      tableName: 'usertbl',
      recordId: newUser.userid,
      pdlId: null, // No PDL involved here
      details: {
        message: `New system user created: ${newUser.username}`,
        full_name: newUser.fullname,
        assigned_role_id: newUser.roleid,
        account_status: status
      },
      ipAddress: clientIp
    });

    await client.query('COMMIT');

    return res.json({
      message: "User created successfully",
      data: newUser,
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error("❌ Create User Error:", error.message);
    return res.status(500).json({ error: "Server error" });
  } finally {
    client.release();
  }
};



const getUsers = async (req, res) => {
    try {
        const query = `
            SELECT u.userid, u.username, u.fullname, u.status, r.rolename 
            FROM usertbl u
            JOIN roletbl r ON u.roleid = r.roleid
            ORDER BY u.userid ASC
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 2. Suspend / Activate Account
const updateUserStatus = async (req, res) => {
    const { target_userid, new_status } = req.body;
    const client = await pool.connect();

    try {
        await client.query('BEGIN');
        
        // 1. GET THE "BEFORE" STATE
        const beforeRes = await client.query(
            "SELECT username, status FROM usertbl WHERE userid = $1", 
            [target_userid]
        );
        const oldData = beforeRes.rows[0];

        // 2. DO THE UPDATE
        await client.query("UPDATE usertbl SET status = $1 WHERE userid = $2", [new_status, target_userid]);

        // 3. LOG WITH COMPARISON
        await logAction(client, {
            userId: req.user.id,
            action: 'UPDATE_USER_STATUS',
            tableName: 'usertbl',
            recordId: target_userid,
            details: {
                message: `Status change for ${oldData.username}`,
                old_data: { status: oldData.status }, // ⬅️ PREVIOUS
                new_data: { status: new_status }     // ⬅️ UPDATED
            },
            ipAddress: req.headers['x-forwarded-for'] || req.socket.remoteAddress
        });

        await client.query('COMMIT');
        res.status(200).json({ success: true });
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: err.message });
    } finally { client.release(); }
};

// 3. Force Password Reset
const resetUserPassword = async (req, res) => {
    const { target_userid, new_password } = req.body;
    const client = await pool.connect();
    const currentUserId = req.user.id;
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    try {
        // 🎯 1. THE STRENGTH CHECKER (Regex Shield)
        // Rule: 8+ chars, 1 Upper, 1 Lower, 1 Number, 1 Special Char
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&])[A-Za-z\d@$!%*?#&]{8,}$/;
        
        if (!passwordRegex.test(new_password)) {
            return res.status(400).json({ 
                error: "Password too weak. It must be at least 8 characters long and include uppercase, lowercase, numbers, and symbols." 
            });
        }

        await client.query('BEGIN');
        
        // 2. Fetch user for the log metadata
        const userCheck = await client.query("SELECT username FROM usertbl WHERE userid = $1", [target_userid]);
        if (userCheck.rows.length === 0) {
            throw new Error("User not found");
        }

        // 3. Encrypt the new valid password
        const hashedPassword = await bcrypt.hash(new_password, 10);

        // 4. Update the DB
        await client.query("UPDATE usertbl SET password = $1 WHERE userid = $2", [hashedPassword, target_userid]);

        // --- 🛡️ 5. LOG THE ACTION ---
        await logAction(client, {
            userId: currentUserId,
            action: 'ADMIN_RESET_PASSWORD',
            tableName: 'usertbl',
            recordId: target_userid,
            details: {
                message: `Administrative password reset for ${userCheck.rows[0].username}`,
                note: "Security credentials overridden by Admin."
            },
            ipAddress: clientIp
        });

        await client.query('COMMIT');
        res.status(200).json({ success: true, message: "Password updated successfully!" });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error("Reset Password Error:", err.message);
        res.status(500).json({ error: err.message });
    } finally { 
        client.release(); 
    }
};

const getAuditLogs = async (req, res) => {
    try {
        // Mapping your actual columns:
        // action_type -> action
        // timestamp -> created_at
        // user_id -> matches join
        const query = `
            SELECT 
                a.log_id, 
                a.action_type AS action, 
                a.table_name, 
                a.record_id, 
                a.details, 
                a.ip_address, 
                a.timestamp AS created_at,
                a.pdl_id,
                u.fullname AS operator_name
            FROM audit_log_tbl a
            LEFT JOIN usertbl u ON a.user_id = u.userid
            ORDER BY a.timestamp DESC
            LIMIT 1000; 
        `;
        
        const result = await pool.query(query);
        
        // No changes needed to the response, 
        // PostgreSQL handles the JSONB details column automatically
        res.json(result.rows);
    } catch (err) {
        console.error("Audit Log Retrieval Error:", err.message);
        res.status(500).json({ 
            error: "Internal Server Error: Failed to access security logs." 
        });
    }
};

const getAuditActions = async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT DISTINCT action_type FROM audit_log_tbl ORDER BY action_type ASC"
        );
        // We just want an array of strings like ["LOGIN", "UPDATE_PERSONAL_INFO", ...]
        const actions = result.rows.map(row => row.action_type);
        res.json(actions);
    } catch (err) {
        console.error("Error fetching unique actions:", err.message);
        res.status(500).json({ error: "Failed to load filter options." });
    }
};


module.exports = { createUser,  getUsers, updateUserStatus, resetUserPassword, getAuditLogs, getAuditActions};