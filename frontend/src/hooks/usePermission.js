export const usePermissions = () => {
    const rawData = localStorage.getItem("user");
    const user = rawData ? JSON.parse(rawData) : { permissions: [], role: "" };

    /**
     * @param {string} moduleName - e.g., "PDL & RFID Management"
     * @param {string} action - "canview", "cancreate", "canedit", etc.
     */
    const canDo = (moduleName, action) => {
        // 🛡️ GOD MODE: Check via the String "Admin"
        if (user && user.role === "Admin") {
            return true; 
        }

        if (!user || !user.permissions) return false;

        // 🔍 Find the specific module
        const module = user.permissions.find(
            (p) => p.modulename?.trim() === moduleName?.trim()
        );

        if (!module) return false;

        // Ensure we return a boolean (handles "true" strings from DB)
        const val = module[action];
        return val === true || val === "true";
    };

    // 🚀 Return helpers based on your String roles
    return { 
        canDo, 
        user,
        // 🎯 Use the exact strings from your console log
        isAdmin: user?.role === "Admin",
        isWarden: user?.role === "Warden",
        isOfficer: user?.role === "Jail Officer" // Double check if this is the exact string for officers
    };
};