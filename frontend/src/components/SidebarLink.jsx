import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const SidebarLink = ({ to, icon: Icon, label }) => {
  const location = useLocation();
  
  // Check if the current URL matches this link's path
  // Using startsWith allows the menu item to stay active even if you are deep inside a section
  // e.g., '/pdl/view/123' will still activate the '/pdl' link.
  const isActive = location.pathname.startsWith(to);

  // Styles matching your Figma design
  const baseStyle = "flex items-center px-4 py-3 mb-1 rounded-lg transition-colors duration-200 font-medium";
  // The bright blue active state from your image
  const activeStyle = "bg-[#3b82f6] text-white shadow-sm"; 
  // The inactive text color (light gray on dark blue)
  const inactiveStyle = "text-slate-300 hover:bg-slate-800 hover:text-white";

  return (
    <Link to={to} className={`${baseStyle} ${isActive ? activeStyle : inactiveStyle}`}>
      {/* Render the passed icon component */}
      <Icon size={20} strokeWidth={2} />
      <span className="ml-3">{label}</span>
    </Link>
  );
};

export default SidebarLink;