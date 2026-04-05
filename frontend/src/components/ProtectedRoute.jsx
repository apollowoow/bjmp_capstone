import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import Forbidden from '../pages/Forbidden'; // 🎯 Import your new page

const ProtectedRoute = ({ moduleName, action }) => {
  const token = localStorage.getItem("token");
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : { permissions: [] };

  // 🕵️‍♂️ NIGHT VISION LOGS
  console.log("--- Bouncer Check ---");
  console.log("Target Module:", moduleName);
  console.log("User Permissions:", user.permissions);

  if (!token) return <Navigate to="/" replace />;

  if (moduleName && action) {
    const modulePerm = user.permissions?.find(p => p.modulename === moduleName);
    
    // Log what the bouncer found
    console.log("Module Found in Suitcase:", modulePerm);

    const hasPower = modulePerm ? modulePerm[action] : false;
    console.log(`Has Power (${action})?:`, hasPower);

    if (!hasPower) {
      console.error("⛔ ACCESS DENIED. Showing Forbidden Page.");
      return <Forbidden />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;