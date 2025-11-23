const pool = require("../db/pool");
const bcrypt = require("bcrypt");
const { logAction } = require('../utils/logger'); 

const createUser = async (req, res) => {
  const client = await pool.connect();

  try {
    const { username, password, fullName, roleid, status, currentUserId } = req.body;

    // 1. Validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&])[A-Za-z\d@$!%*?#&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ error: "Password too weak." });
    }

    const checkUser = await pool.query(
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
      RETURNING userid, username;
    `;
    const result = await client.query(query, [username, hashedPassword, fullName, roleid, status]);
    const newUserId = result.rows[0].userid;

    // ==================================================
    // 5. CAPTURE IP & LOG (THE NEW PART)
    // ==================================================
    // This grabs the IP from the request
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    await logAction(
      client,
      currentUserId || 1,
      'CREATE_USER',
      'usertbl',
      newUserId,
      `Created system user: ${username} (${fullName})`,
      clientIp // <--- Passing the IP here
    );

    await client.query('COMMIT');

    return res.json({
      message: "User created successfully",
      data: result.rows[0],
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.log(error);
    return res.status(500).json({ error: "Server error" });
  } finally {
    client.release();
  }
};

module.exports = { createUser };