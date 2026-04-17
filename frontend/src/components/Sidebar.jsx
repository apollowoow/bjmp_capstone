import React, { useState, useEffect } from 'react';
import { useOfflineSync } from '../hooks/useOfflineSync';
import { Link, useNavigate, useLocation } from 'react-router-dom';
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
  ShieldAlert,
  Database, CloudOff, RefreshCw, CheckCircle2
} from 'lucide-react';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { isSyncing, pendingCount } = useOfflineSync();
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : { permissions: [], rolename: 'User' };
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [lastCount, setLastCount] = useState(0);

  // 🎯 Monitor sync completion
  useEffect(() => {
    // Kung dati may pending (>0) at ngayon ay zero na (0) at hindi na nag-si-sync
    if (lastCount > 0 && pendingCount === 0 && !isSyncing) {
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 4000); // Hide after 4s
    }
    setLastCount(pendingCount);
  }, [pendingCount, isSyncing, lastCount]);

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
  const iconLinkStyle = (path) => {
  // 🎯 Check if current path matches or starts with the link path
  const isActive = location.pathname === path || location.pathname.startsWith(`${path}/`);

  return {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 15px',
    textDecoration: 'none',
    borderRadius: '8px',
    transition: 'all 0.2s',
    // 🎨 Active vs Normal Colors
    color: isActive ? '#60a5fa' : '#cbd5e1',
    backgroundColor: isActive ? 'rgba(96, 165, 250, 0.12)' : 'transparent',
    fontWeight: isActive ? '600' : '500',
    borderLeft: isActive ? '4px solid #60a5fa' : '4px solid transparent',
    // 💡 Optional: subtle glow effect
    boxShadow: isActive ? '0 4px 12px rgba(0, 0, 0, 0.1)' : 'none'
  };
};

  return (
    <div className="sidebar" style={{ backgroundColor: '#0f172a', 
    height: '100vh', 
    padding: '20px', 
    display: 'flex',           // 🎯 Siguradong flexbox
    flexDirection: 'column',    // 🎯 Stack top to bottom
    overflow: 'hidden'}}>
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
      
      <nav className="custom-sidebar-nav" style={{ 
      display: 'flex', 
        flexDirection: 'column', 
        gap: '5px',
        flex: 1,               // 🎯 Eto ang kakain ng extra space
        overflowY: 'auto',      // 🎯 Dito lalabas ang scrollbar pag puno na
        overflowX: 'hidden',
        paddingRight: '5px'}}>
        {/* DASHBOARD */}
        <Link to="/dashboard" className="nav-link" style={iconLinkStyle('/dashboard')}>
          <LayoutDashboard size={18} /> Dashboard
        </Link>

        {/* PDL PROFILING */}
        {canDo("PDL & RFID Management", "canview") && (
          <Link to="/pdl" className="nav-link"  style={iconLinkStyle('/pdl')}>
            <Users size={18} /> PDL Profiling
          </Link>
        )}

        {/* PROGRAMS & CREDITS */}
        {canDo("Attendance & Sessions", "canview") && (
          <Link to="/education" className="nav-link" style={iconLinkStyle('/education')}>
            <Clock size={18} /> Programs & Credits
          </Link>
        )}

        {/* INCIDENTS */}
        {canDo("Conduct & Penalties", "canapprove") && (
          <Link to="/incidents" className="nav-link" style={iconLinkStyle('/incidents')}>
            <AlertTriangle size={18} /> Incidents
          </Link>
        )}

        {/* REPORTS */}
        {canDo("Time Allowance Computation (GCTA/TASTM)", "canapprove") && (
          <>
            <Link to="/reports" className="nav-link" style={iconLinkStyle('/reports')}>
              <FileText size={18} /> Reports
            </Link>

            {/* 🛡️ NEW: INTEGRITY AUDIT LINK */}
            {/* Matches the permission in your AppRoutes.jsx */}
          </>
        )}

        

        <hr style={{ margin: '15px 0', borderColor: '#334155', borderStyle: 'solid', borderWidth: '1px 0 0 0' }} />
        
        {/* ADD NEW PDL */}
        {canDo("PDL & RFID Management", "cancreate") && (
          <Link to="/add" className="nav-link" style={iconLinkStyle('/add')}>
            <UserPlus size={18} /> Add New PDL
          </Link>
        )}

        {/* USER MANAGEMENT */}
        {canDo("User Management", "cancreate") && (
          <Link to="/users" className="nav-link" style={iconLinkStyle('/users')}>
            <UserCog size={18} /> User Management
          </Link>
        )}
        {canDo("User Management", "canview") && (
            <Link to="/integrity-audit" className="nav-link" style={iconLinkStyle('/integrity-audit')}>
              <ShieldAlert size={18} /> Integrity Audit
            </Link>
          )}
        {/* AUDIT TRAIL */}
        {canDo("User Management", "canview") && (
          <Link to="/audit-logs" className="nav-link" style={{ ...iconLinkStyle('/audit-logs')}}>
            <Activity size={18} /> Audit Trail
          </Link>
        )}

        {/* ADD SYSTEM USER */}
        {canDo("User Management", "cancreate") && (
          <Link to="/addUser" className="nav-link" style={iconLinkStyle('/addUser')}>
            <UserPlus size={18} /> Add System User
          </Link>
        )}


        {canDo("User Management", "cancreate") && (
            <Link to="/maintenance" className="nav-link" style={{ ...iconLinkStyle('/maintenance')}}>
              <Database size={18} /> System Maintenance
            </Link>
        )}
        
      
      </nav>

      
      
      <div style={{ marginTop: 'auto', borderTop: '1px solid #334155', paddingTop: '10px' }}>

        {pendingCount > 0 && (
          <div style={{
            background: isSyncing ? 'rgba(59, 130, 246, 0.1)' : 'rgba(245, 158, 11, 0.1)',
            border: isSyncing ? '1px solid #3b82f6' : '1px solid #f59e0b',
            borderRadius: '8px',
            padding: '10px',
            marginBottom: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            {isSyncing ? (
              <RefreshCw size={18} color="#60a5fa" className="sidebar-spin" />
            ) : (
              <CloudOff size={18} color="#f59e0b" />
            )}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: isSyncing ? '#60a5fa' : '#f59e0b', textTransform: 'uppercase' }}>
                {isSyncing ? "Syncing Data..." : "Offline Queue"}
              </span>
              <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                {pendingCount} sessions pending
              </span>
            </div>
          </div>
        )}

        {showSuccessToast && (
          <div className="sb-sync-toast sb-toast-success">
            <div className="sb-toast-content">
              <CheckCircle2 size={24} color="#22c55e" />
              <div className="sb-toast-text">
                <strong>Sync Successful</strong>
                <p>Offline logs uploaded to server.</p>
              </div>
            </div>
            <div className="sb-toast-progress-bar"></div>
          </div>
        )}
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