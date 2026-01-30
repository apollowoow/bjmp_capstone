const pool = require('../db/pool');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config'); // 👈 Import our central config
const { logAction } = require('../utils/logger');

const loginUser = async (req, res) => {
  const client = await pool.connect();

  try {
    const { username, password } = req.body;

    // 1. Find User & Join Role
    const userQuery = `
      SELECT u.userid, u.username, u.password, u.fullname, u.roleid, r.rolename
      FROM usertbl u
      JOIN roletbl r ON u.roleid = r.roleid
      WHERE u.username = $1 AND u.status = 'Active'
    `;
    const userResult = await client.query(userQuery, [username]);

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: "User not found or inactive" });
    }

    const user = userResult.rows[0];

    // 2. Check Password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      await logAction(client, user.userid, 'LOGIN_FAILED', 'usertbl', user.userid, 'Invalid password');
      return res.status(401).json({ error: "Invalid Password" });
    }

    // 3. Fetch RBAC Permissions
    const permQuery = `
      SELECT m.modulename, rp.canview, rp.cancreate, rp.canedit, rp.candelete, rp.canapprove
      FROM rolepermissiontable rp
      JOIN moduletbl m ON rp.moduleid = m.moduleid
      WHERE rp.roleid = $1
    `;
    const permResult = await client.query(permQuery, [user.roleid]);

    // 4. Generate JWT Token
    // ✅ Uses config.jwtSecret from your .env
    const token = jwt.sign(
      { id: user.userid, role: user.rolename, name: user.fullname },
      config.jwtSecret,
      { expiresIn: "8h" }
    );

    // 5. Log Success
    await logAction(client, user.userid, 'LOGIN', 'usertbl', user.userid, 'Successful login');

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
    console.error("Login Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    client.release();
  }
};

module.exports = { loginUser };