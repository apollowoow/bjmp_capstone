// backend/middleware/authorize.js

const authorize = (moduleName, permissionType) => {
  return (req, res, next) => {
    // 🛡️ Safety: Ensure req.user was populated by authenticateToken
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized: Session missing." });
    }

    const permissions = req.user.permissions;

    // 🕵️‍♂️ Debug Logs (Terminal)
    console.log(`\n--- 🛡️  RBAC Check: ${req.user.name} ---`);
    console.log(`🎯 Module: "${moduleName}" | Action: "${permissionType}"`);

    // 🛡️ Safety: Ensure permissions array exists
    if (!permissions || !Array.isArray(permissions)) {
      console.error("❌ RBAC Error: Permissions missing in token.");
      return res.status(403).json({ error: "Access Denied: Please re-login." });
    }

    // 🔍 Find the module
    const module = permissions.find(p => p.modulename === moduleName);

    if (module) {
        // 🎯 Handle Postgres boolean (handles true or "true")
        const hasAccess = module[permissionType] === true || String(module[permissionType]) === "true";

        if (hasAccess) {
            console.log("🟢 ACCESS GRANTED");
            return next();
        } else {
            console.log("🔴 ACCESS DENIED: Permission set to false.");
        }
    } else {
        console.log(`❌ Module "${moduleName}" not found in user's list.`);
    }

    res.status(403).json({ error: `Forbidden: No ${permissionType} rights for ${moduleName}` });
  };
};

module.exports = authorize;