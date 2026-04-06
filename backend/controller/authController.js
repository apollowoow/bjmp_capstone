// backend/controller/authController.js
const pool = require('../db/pool');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config');
const { logAction } = require('../utils/logger'); 

const loginUser = async (req, res) => {
  const client = await pool.connect();
  
  // 🛡️ Metadata for Audit Trail
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  try {
    const { username, password } = req.body;
    
    // 1. Find User & Join Role
    const userQuery = `
      SELECT u.userid, u.username, u.password, u.fullname, u.roleid, r.rolename, u.status
      FROM usertbl u
      JOIN roletbl r ON u.roleid = r.roleid
      WHERE u.username = $1
    `;
    const userResult = await client.query(userQuery, [username]);

    if (userResult.rows.length === 0) {
      // 💡 PRO TIP: You could log failed attempts here too!
      return res.status(401).json({ error: "User not found" });
    }

    const user = userResult.rows[0];

    // 2. Status Check
    if (user.status !== 'Active') {
      return res.status(401).json({ error: "User is inactive" });
    }

    // 3. Password Verification
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: "Invalid Password" });
    }

    // 4. Fetch RBAC Permissions
    const permQuery = `
      SELECT m.modulename, rp.canview, rp.cancreate, rp.canedit, rp.candelete, rp.canapprove
      FROM rolepermissiontable rp
      JOIN moduletbl m ON rp.moduleid = m.moduleid
      WHERE rp.roleid = $1
    `;
    const permResult = await client.query(permQuery, [user.roleid]);

    // 5. Generate JWT Token
    const token = jwt.sign(
      { 
        id: user.userid, 
        role: user.rolename, 
        name: user.fullname,
        permissions: permResult.rows 
      },
      config.jwtSecret,
      { expiresIn: "8h" }
    );

    // --- 🛡️ STEP 6: THE LOGIN AUDIT LOG ---
    // We do this AFTER everything is verified
    await logAction(client, {
      userId: user.userid,
      action: 'USER_LOGIN',
      tableName: 'usertbl',
      recordId: user.userid,
      pdlId: null,
      details: {
        message: `User logged in successfully.`,
        fullname: user.fullname,
        role: user.rolename,
        session_expiry: "8h"
      },
      ipAddress: clientIp
    });

    res.json({
      message: "Login Successful",
      token,
      user: {
        id: user.userid,
        username: user.username,
        fullname: user.fullname,
        role: user.rolename,
        permissions: permResult.rows
      }
    });

  } catch (error) {
    console.error("🔥 Login Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    client.release();
  }
};

const verifySessionPassword = async (req, res) => {
    const client = await pool.connect();
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    try {
        const userId = req.user.id; 
        // 🎯 We now expect 'module' from the frontend (e.g., "INTEGRITY_AUDIT" or "SYSTEM_LOGS")
        const { password, module } = req.body; 

        if (!password) {
            return res.status(400).json({ error: "Password is required for authorization." });
        }

        const userQuery = `SELECT password, fullname, username FROM usertbl WHERE userid = $1`;
        const userResult = await client.query(userQuery, [userId]);

        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: "User context lost." });
        }

        const user = userResult.rows[0];
        const isValid = await bcrypt.compare(password, user.password);

        // 🏷️ Create dynamic action names based on the module
        const prefix = module ? module.toUpperCase() : "GENERAL_SECURITY";

        if (!isValid) {
            // 🚩 DYNAMIC LOG: FAILED
            await logAction(client, {
                userId: userId,
                action: `${prefix}_ACCESS_FAILED`, 
                tableName: 'audit_log_tbl',
                recordId: userId,
                details: { 
                    message: `Failed verification for ${prefix} access.`,
                    attempted_by: user.fullname 
                },
                ipAddress: clientIp
            });

            return res.status(401).json({ error: "Invalid administrative password." });
        }

        // ✅ DYNAMIC LOG: SUCCESS
        await logAction(client, {
            userId: userId,
            action: `${prefix}_ACCESS_GRANTED`,
            tableName: 'audit_log_tbl',
            recordId: userId,
            details: { 
                message: `${prefix} module successfully unlocked.`,
                authorized_user: user.fullname 
            },
            ipAddress: clientIp
        });

        res.status(200).json({ message: "Access Authorized." });

    } catch (error) {
        console.error("🔥 Security Gate Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    } finally {
        client.release();
    }
};

module.exports = { loginUser, verifySessionPassword };