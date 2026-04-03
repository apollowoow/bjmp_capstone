// backend/middleware/authorize.js
const authorize = (moduleName, permissionType) => {
  return (req, res, next) => {
    const permissions = req.user.permissions;

    // 🕵️‍♂️ DEBUG LOGS
    console.log(`--- 🛡️ RBAC Check for: ${req.user.name} ---`);
    console.log(`Checking Module: "${moduleName}"`);
    console.log(`Checking Action: "${permissionType}"`);

    const module = permissions.find(p => p.modulename === moduleName);

    if (module) {
        console.log(`✅ Module Found! Value of ${permissionType}:`, module[permissionType]);
        
        // 🎯 FIX: Check for both Boolean AND String "true"
        if (module[permissionType] === true || String(module[permissionType]) === "true") {
            return next();
        }
    } else {
        console.log(`❌ Module NOT found in user's permission list.`);
        // console.log("User's Modules are:", permissions.map(p => p.modulename));
    }

    res.status(403).json({ error: "Access Denied" });
  };
};

module.exports = authorize;