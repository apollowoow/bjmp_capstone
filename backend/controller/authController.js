// backend/controllers/authController.js
const pool = require('../db/pool');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { logAction } = require('../utils/logger');

const loginUser = async (req, res) => {
  // We use a client to ensure queries are efficient
  const client = await pool.connect();

  try {
    const { username, password } = req.body;

    // 1. FIND USER IN DB
    // We join with roletbl to get the nice role name (e.g. "Warden")
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

    // 2. CHECK PASSWORD
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      // Log the failed attempt for security
      await logAction(client, user.userid, 'LOGIN_FAILED', 'usertbl', user.userid, 'Invalid password attempt');
      return res.status(401).json({ error: "Invalid Password" });
    }

    // 3. FETCH PERMISSIONS (RBAC)
    // This grabs exactly what this user is allowed to do per module
    const permQuery = `
      SELECT m.modulename, rp.canview, rp.cancreate, rp.canedit, rp.candelete, rp.canapprove
      FROM rolepermissiontable rp
      JOIN moduletbl m ON rp.moduleid = m.moduleid
      WHERE rp.roleid = $1
    `;
    const permResult = await client.query(permQuery, [user.roleid]);

    // 4. GENERATE JWT TOKEN
    // This is the "Digital Badge" the frontend will save
    const token = jwt.sign(
      { 
        id: user.userid, 
        role: user.rolename,
        name: user.fullname
      },
      "YOUR_SECRET_KEY", // IMPORTANT: In a real app, put this in a .env file!
      { expiresIn: "8h" }
    );

    // 5. LOG SUCCESSFUL LOGIN
    await logAction(client, user.userid, 'LOGIN', 'usertbl', user.userid, 'User logged in successfully');

    // 6. SEND RESPONSE
    res.json({
      message: "Login Successful",
      token,
      user: {
        id: user.userid,
        username: user.username,
        fullname: user.fullname,
        role: user.rolename,
        permissions: permResult.rows // Frontend uses this to hide/show buttons!
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  } finally {
    client.release();
  }
};

module.exports = { loginUser };