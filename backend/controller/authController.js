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

module.exports = { loginUser };