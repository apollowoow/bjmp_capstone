import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import "./sidebar.css";// 🎯 Import the specific icons from Lucide
import { 
  LayoutDashboard, 
  Users, 
  Clock, 
  AlertTriangle, 
  FileText, 
  UserPlus, 
  ShieldCheck, 
  Activity, 
  LogOut,
  UserCog,
  AlertCircle,
  ShieldAlert
} from 'lucide-react';

const Sidebar = () => {
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : { permissions: [], rolename: 'User' };

  const canDo = (moduleName, action) => {
    if (!user.permissions) return false;
    const modulePerm = user.permissions.find(p => p.modulename === moduleName);
    return modulePerm ? !!modulePerm[action] : false;
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  // Helper style for icon alignment
  const iconLinkStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 15px',
    textDecoration: 'none',
    color: '#cbd5e1',
    borderRadius: '8px',
    transition: 'all 0.2s'
  };

  return (
    <div className="sidebar" style={{ backgroundColor: '#0f172a', height: '100vh', padding: '20px' ,}}>
      <div className="sidebar-header" >
        <h2 style={{ color: '#fff', marginBottom: '5px', display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
          <ShieldCheck size={28} color="#60a5fa" /> PDL IMS
        </h2>
        <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0', marginBottom: '30px', textAlign: 'center' }}>
          Welcome, {user.fullname || 'User'} <br />
          <span style={{ color: '#60a5fa', fontWeight: 'bold' }}>
            [{user.rolename || user.role || 'Guest'}]
          </span>
        </p>
      </div>
      
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        {/* DASHBOARD */}
        <Link to="/dashboard" className="nav-link" style={iconLinkStyle}>
          <LayoutDashboard size={18} /> Dashboard
        </Link>

        {/* PDL PROFILING */}
        {canDo("PDL & RFID Management", "canview") && (
          <Link to="/pdl" className="nav-link" style={iconLinkStyle}>
            <Users size={18} /> PDL Profiling
          </Link>
        )}

        {/* PROGRAMS & CREDITS */}
        {canDo("Attendance & Sessions", "canview") && (
          <Link to="/education" className="nav-link" style={iconLinkStyle}>
            <Clock size={18} /> Programs & Credits
          </Link>
        )}

        {/* INCIDENTS */}
        {canDo("Conduct & Penalties", "canapprove") && (
          <Link to="/incidents" className="nav-link" style={iconLinkStyle}>
            <AlertTriangle size={18} /> Incidents
          </Link>
        )}

        {/* REPORTS */}
        {canDo("Time Allowance Computation (GCTA/TASTM)", "canapprove") && (
          <>
            <Link to="/reports" className="nav-link" style={iconLinkStyle}>
              <FileText size={18} /> Reports
            </Link>

            {/* 🛡️ NEW: INTEGRITY AUDIT LINK */}
            {/* Matches the permission in your AppRoutes.jsx */}
        
          </>
        )}

        

        <hr style={{ margin: '15px 0', borderColor: '#334155', borderStyle: 'solid', borderWidth: '1px 0 0 0' }} />
        
        {/* ADD NEW PDL */}
        {canDo("PDL & RFID Management", "cancreate") && (
          <Link to="/add" className="nav-link" style={iconLinkStyle}>
            <UserPlus size={18} /> Add New PDL
          </Link>
        )}

        {/* USER MANAGEMENT */}
        {canDo("User Management", "canview") && (
          <Link to="/users" className="nav-link" style={iconLinkStyle}>
            <UserCog size={18} /> User Management
          </Link>
        )}
        {canDo("User Management", "canview") && (
            <Link to="/integrity-audit" className="nav-link" style={iconLinkStyle}>
              <ShieldAlert size={18} /> Integrity Audit
            </Link>
          )}
        {/* AUDIT TRAIL */}
        {canDo("User Management", "canview") && (
          <Link to="/audit-logs" className="nav-link" style={{ ...iconLinkStyle }}>
            <Activity size={18} /> Audit Trail
          </Link>
        )}

        {/* ADD SYSTEM USER */}
        {canDo("User Management", "cancreate") && (
          <Link to="/addUser" className="nav-link" style={iconLinkStyle}>
            <UserPlus size={18} /> Add System User
          </Link>
        )}
      </nav>
      
      <div style={{ marginTop: 'auto', paddingBottom: '20px' }}>
        <button 
          onClick={() => setShowLogoutModal(true)}
          style={{
            background: 'none', 
            border: 'none', 
            color: '#f87171', 
            fontSize: '1rem', 
            cursor: 'pointer', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px',
            padding: '10px 15px',
            width: '100%',
            textAlign: 'left'
          }}
        >
          <LogOut size={18} /> Logout
        </button>
      </div>
      {showLogoutModal && (
        <div className="sb-modal-overlay">
          <div className="sb-modal-card">
            <div className="sb-modal-icon">
              <AlertCircle size={48} color="#f87171" />
            </div>
            <h3 className="sb-modal-title">Confirm Logout</h3>
            <p className="sb-modal-text">Are you sure you want to end your session? Any unsaved changes will be lost.</p>
            
            <div className="sb-modal-actions">
              <button className="sb-btn-confirm" onClick={handleLogout}>
                Yes, Logout
              </button>
              <button className="sb-btn-cancel" onClick={() => setShowLogoutModal(false)}>
                Stay Logged In
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;