import React from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate

const Sidebar = () => {
  const navigate = useNavigate();

  // 1. GET USER INFO FROM STORAGE
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : {};

  // 2. LOGOUT FUNCTION
  const handleLogout = () => {
    // Destroy the evidence
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    // Redirect to Login
    navigate("/");
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>PDL IMS</h2>
        {/* Show who is logged in */}
        <p style={{fontSize: '0.8rem', color: '#94a3b8', marginTop: '-15px', marginBottom: '20px'}}>
          Welcome, {user.role || 'User'}
        </p>
      </div>
      
      <nav>
        <Link to="/dashboard">📊 Dashboard</Link>
        <Link to="/pdl">👥 Inmate Profiling</Link>
        <Link to="/education">🎓 Education</Link>
        <Link to="/incidents">⚠️ Incidents</Link>
        <hr style={{ margin: '20px 0', borderColor: '#475569' }} />
        
        <Link to="/add">➕ Add New PDL</Link>
        
        {/* 3. ROLE-BASED ACCESS (Hide if not Admin) */}
        {/* Remember: We set Admin Role ID to 1 */}
        {(user.role === 'Admin' || user.role === 'Administrator') && (
          <Link to="/addUser">👤 Add System User</Link>
        )}
      </nav>
      
      <div style={{ marginTop: 'auto' }}>
        {/* 4. ATTACH LOGOUT HANDLER */}
        <button 
          onClick={handleLogout} 
          style={{
            background: 'none', border: 'none', color: '#f87171', 
            fontSize: '1.1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px'
          }}
        >
          🚪 Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;