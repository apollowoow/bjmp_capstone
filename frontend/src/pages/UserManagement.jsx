import React, { useEffect, useState } from "react";
import { 
  Eye, EyeOff, Settings, CheckCircle2, XCircle, 
  UserX, UserCheck, HelpCircle, Lock, ShieldCheck, Users 
} from "lucide-react";
import API_BASE_URL from "../apiConfig";
import "./userManagement.css";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const loggedInUser = JSON.parse(localStorage.getItem("user") || "{}");

  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  // 🎯 NEW: Password Security States
  const [showPass, setShowPass] = useState(false);
  const [strength, setStrength] = useState({ length: false, upper: false, num: false, spec: false });

  // 🎯 NEW: Custom Modal States
  const [confirm, setConfirm] = useState({ show: false, msg: "", onYes: null });
  const [status, setStatus] = useState({ show: false, msg: "", isOk: true });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) { console.error("Fetch Users Error:", err); } 
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  // 🛡️ Password Keyboard Handler
  const handlePassInput = (val) => {
    setNewPassword(val);
    setStrength({
      length: val.length >= 8,
      upper: /[A-Z]/.test(val),
      num: /[0-9]/.test(val),
      spec: /[@$!%*?#&]/.test(val)
    });
  };

  const isPassStrong = Object.values(strength).every(Boolean);

  const filteredUsers = users.filter((u) => {
    const matchesSearch = u.fullname.toLowerCase().includes(searchTerm.toLowerCase()) || u.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || u.rolename === roleFilter;
    const matchesStatus = statusFilter === "all" || u.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const indexOfLastRow = currentPage * rowsPerPage;
  const currentRows = filteredUsers.slice(indexOfLastRow - rowsPerPage, indexOfLastRow);
  const totalPages = Math.ceil(filteredUsers.length / rowsPerPage);

  useEffect(() => { setCurrentPage(1); }, [searchTerm, roleFilter, statusFilter]);

  const openModal = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
    setNewPassword("");
    setStrength({ length: false, upper: false, num: false, spec: false });
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
    setConfirm({ ...confirm, show: false });
  };

  // 🚫 Status Logic with Custom Modal
  const handleStatusToggle = () => {
    if (selectedUser.userid === loggedInUser.id) {
      return setStatus({ show: true, msg: "You cannot suspend your own account!", isOk: false });
    }
    const nextStatus = selectedUser.status === "Active" ? "Inactive" : "Active";
    
    setConfirm({
      show: true,
      msg: `Set ${selectedUser.username} to ${nextStatus}?`,
      onYes: async () => {
        try {
          const token = localStorage.getItem("token");
          const res = await fetch(`${API_BASE_URL}/api/users/status`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ target_userid: selectedUser.userid, new_status: nextStatus })
          });
          if (res.ok) {
            fetchUsers();
            closeModal();
            setStatus({ show: true, msg: `User is now ${nextStatus}`, isOk: true });
          }
        } catch (err) { setStatus({ show: true, msg: "Failed to update status", isOk: false }); }
      }
    });
  };

  // 🔑 Password Logic with Custom Modal
  const handlePasswordReset = () => {
    setConfirm({
      show: true,
      msg: `Reset password for ${selectedUser.username}?`,
      onYes: async () => {
        try {
          const token = localStorage.getItem("token");
          const res = await fetch(`${API_BASE_URL}/api/users/reset-password`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ target_userid: selectedUser.userid, new_password: newPassword })
          });
          if (res.ok) {
            setNewPassword("");
            closeModal();
            setStatus({ show: true, msg: "Password Reset Successful!", isOk: true });
          }
        } catch (err) { setStatus({ show: true, msg: "Error resetting password", isOk: false }); }
      }
    });
  };

  if (loading) return <div className="um-loading">🔄 Accessing User Registry...</div>;

  return (
    <div className="um-page-container">
      <div className="um-header-section">
       <h1 className="um-title">
        <Users size={28} className="um-header-icon" /> User Management
      </h1>
        <p className="um-subtitle">Control system access and security credentials.</p>
      </div>

      <div className="um-controls-bar">
        <input type="text" className="um-search-input" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        <select className="um-filter-select" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="all">All Roles</option><option value="Admin">Admin</option><option value="Warden">Warden</option><option value="Jail Officer">Jail Officer</option>
        </select>
        <select className="um-filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All Status</option><option value="Active">Active</option><option value="Inactive">Inactive</option>
        </select>
      </div>

      <div className="um-table-wrapper">
        <table className="um-main-table">
          <thead><tr><th>Full Name</th><th>Username</th><th>Role</th><th>Status</th><th>Control</th></tr></thead>
          <tbody>
            {currentRows.map((u) => (
              <tr key={u.userid}>
                <td>{u.fullname}</td><td>{u.username}</td><td>{u.rolename}</td>
                <td><span className={`um-status-pill ${u.status === 'Active' ? 'um-active' : 'um-inactive'}`}>{u.status}</span></td>
                <td>
                  <button className="um-btn-manage" onClick={() => openModal(u)}>
                    <Settings size={16} /> Modify
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
  <div className="um-pagination">
        <button className="um-page-btn" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>Prev</button>
        <span className="um-page-info">Page {currentPage} of {totalPages || 1}</span>
        <button className="um-page-btn" disabled={currentPage >= totalPages} onClick={() => setCurrentPage(p => p + 1)}>Next</button>
      </div>
      {/* 🛠️ MAIN MODIFY MODAL */}
      {isModalOpen && selectedUser && (
        <div className="um-modal-overlay">
          <div className="um-modal-content">
            <div className="um-modal-header">
              <h3><ShieldCheck size={20} /> Security Control: {selectedUser.username}</h3>
              <button className="um-close-x" onClick={closeModal}>&times;</button>
            </div>
            <div className="um-modal-body">
              <div className="um-modal-section">
                <label className="um-label">Access Control</label>
                <div className="um-status-row">
                  <p>Status: <span className={selectedUser.status === 'Active' ? 'um-txt-active' : 'um-txt-inactive'}>{selectedUser.status}</span></p>
                  <button className={selectedUser.status === 'Active' ? "um-btn-suspend" : "um-btn-activate"} onClick={handleStatusToggle}>
                    {selectedUser.status === 'Active' ? <><UserX size={16}/> Suspend</> : <><UserCheck size={16}/> Activate</>}
                  </button>
                </div>
              </div>
              <hr className="um-divider" />
              <div className="um-modal-section">
                <label className="um-label">Force Password Change</label>
                <div style={{ position: 'relative' }}>
                    <input type={showPass ? "text" : "password"} className="um-input" placeholder="New password..." value={newPassword} onChange={(e) => handlePassInput(e.target.value)} />
                    {/* 🎯 EYE ICON TOGGLE */}
                    <button type="button" className="um-eye-btn" onClick={() => setShowPass(!showPass)}>
                        {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>
                
                {/* 🛡️ STRENGTH GRID WITH ICONS */}
                <div className="um-strength-grid">
                    <span className={strength.length ? "um-valid" : "um-invalid"}>
                        {strength.length ? <CheckCircle2 size={14}/> : <XCircle size={14}/>} 8+ Chars
                    </span>
                    <span className={strength.upper ? "um-valid" : "um-invalid"}>
                        {strength.upper ? <CheckCircle2 size={14}/> : <XCircle size={14}/>} A-Z
                    </span>
                    <span className={strength.num ? "um-valid" : "um-invalid"}>
                        {strength.num ? <CheckCircle2 size={14}/> : <XCircle size={14}/>} 0-9
                    </span>
                    <span className={strength.spec ? "um-valid" : "um-invalid"}>
                        {strength.spec ? <CheckCircle2 size={14}/> : <XCircle size={14}/>} Symbol
                    </span>
                </div>

                <button className={`um-btn-save-pass ${!isPassStrong ? "um-disabled" : ""}`} disabled={!isPassStrong} onClick={handlePasswordReset}>
                    <Lock size={16} /> Update Credentials
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ❓ YES/NO CONFIRM MODAL */}
      {confirm.show && (
        <div className="um-confirm-overlay">
          <div className="um-confirm-card">
            <HelpCircle size={48} color="#3b82f6" style={{ marginBottom: '15px' }} />
            <h3>Confirm Action</h3>
            <p>{confirm.msg}</p>
            <div className="um-confirm-btns">
              <button className="um-btn-yes" onClick={confirm.onYes}>Confirm</button>
              <button className="um-btn-no" onClick={() => setConfirm({ ...confirm, show: false })}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      {/* ✅ SUCCESS/FAIL MODAL */}
      {status.show && (
        <div className="um-status-overlay">
          <div className={`um-status-card ${status.isOk ? "um-border-ok" : "um-border-fail"}`}>
            {status.isOk ? <CheckCircle2 size={48} color="#22c55e" /> : <XCircle size={48} color="#ef4444" />}
            <h3>{status.isOk ? "Success" : "Error"}</h3>
            <p>{status.msg}</p>
            <button className="um-status-close" onClick={() => setStatus({ ...status, show: false })}>Done</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;