import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import '../App.css'; // Import the CSS we made in Step 1

const Layout = () => {
  return (
    <div className="app-container">
      {/* Left Side */}
      <Sidebar />

      {/* Right Side */}
      <div className="content-area">
        {/* This is where your Add.jsx, Dashboard.jsx, etc. will show up */}
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;