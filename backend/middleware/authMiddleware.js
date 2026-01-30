const jwt = require("jsonwebtoken");
const config = require("../config"); // 👈 Must use same config as Controller

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access Denied: No Token Provided" });
  }

  // ✅ Uses same secret to verify
  jwt.verify(token, config.jwtSecret, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Invalid or Expired Token" });
    }

    req.user = user; // Attach user info to the request
    next();
  } );
};

module.exports = { authenticateToken };