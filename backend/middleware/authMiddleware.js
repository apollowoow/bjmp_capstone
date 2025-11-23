// backend/middleware/authMiddleware.js
const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  // 1. Get the token from the Header
  // It usually comes as "Bearer eyJhbGci..."
  const authHeader = req.headers["authorization"];
  
  // We split the string to remove the word "Bearer " and keep just the token
  const token = authHeader && authHeader.split(" ")[1];

  // 2. If there is no token, kick them out
  if (!token) {
    return res.status(401).json({ error: "Access Denied: No Token Provided" });
  }

  // 3. Verify the Token
  jwt.verify(token, "YOUR_SECRET_KEY", (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Invalid or Expired Token" });
    }

    // 4. SUCCESS! 
    // We attach the user info (id, role) to the request object
    // So the Controller knows EXACTLY who this is.
    req.user = user;

    // 5. Move to the next stop (The Controller)
    next();
  });
};

module.exports = { authenticateToken };