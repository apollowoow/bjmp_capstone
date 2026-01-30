import { useState } from "react";
import axios from "axios";
import API_BASE_URL from "../apiConfig";
import "./add.css"; // This file already contains the .modal-overlay styles we added earlier!

const AddUser = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    roleid: "",
    status: "",
  });

  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  
  // NEW: State to control the Modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 1. FORM SUBMIT -> VALIDATE & OPEN MODAL
  const handleFormSubmit = (e) => {
    e.preventDefault();
    setMessage("");
    setIsError(false);

    // Client-Side Validation
    if (formData.password !== formData.confirmPassword) {
      setIsError(true);
      setMessage("❌ Passwords do not match!");
      return;
    }

    // If password is okay, show the confirmation check
    setShowConfirmModal(true);
  };

  // 2. ACTUAL SAVE -> HAPPENS WHEN CLICKING 'YES'
  const confirmSave = async () => {
    setShowConfirmModal(false); // Close the modal
    setMessage("Submitting...");

    try {
      // We send currentUserId: 1 (Admin) temporarily for the log
      const payload = { ...formData, currentUserId: 1 };

      const res = await axios.post(`${API_BASE_URL}/api/users`, payload);
      
      setMessage(`✅ ${res.data.message}`);
      setIsError(false);
      
      // Reset Form
      setFormData({
        username: "", password: "", confirmPassword: "",
        fullName: "", roleid: "", status: ""
      });

    } catch (err) {
      setIsError(true);
      if (err.response && err.response.data && err.response.data.error) {
        setMessage(`❌ ${err.response.data.error}`);
      } else {
        setMessage("❌ Server Error");
      }
    }
  };

  return (
    <div className="add-container">
      
      {/* Header Banner */}
      <div className="form-header">
        <h2>👤 New System User</h2>
        <p>Create a new account for an Administrator, Warden, or Jail Officer.</p>
      </div>

      <div className="form-content">
        <form onSubmit={handleFormSubmit} className="form-grid">
          
          {/* SECTION 1: ACCOUNT DETAILS */}
          <h3 className="section-title">Account Credentials</h3>
          
          <div className="form-group">
            <label className="label">Username</label>
            <input 
              className="input" 
              type="text" 
              name="username" 
              placeholder="e.g. officer_juan" 
              value={formData.username} 
              onChange={handleChange} 
              required 
            />
          </div>
          
          <div className="form-group">
            <label className="label">Full Name</label>
            <input 
              className="input" 
              type="text" 
              name="fullName" 
              placeholder="e.g. Juan Dela Cruz" 
              value={formData.fullName} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="form-group">
            <label className="label">Password</label>
            <input 
              className="input" 
              type="password" 
              name="password" 
              placeholder="Strong Password" 
              value={formData.password} 
              onChange={handleChange} 
              required 
            />
            <small style={{color: '#64748b', fontSize: '0.75rem'}}>
              Must contain 1 Uppercase, 1 Number, 1 Symbol
            </small>
          </div>

          <div className="form-group">
            <label className="label">Confirm Password</label>
            <input 
              className="input" 
              type="password" 
              name="confirmPassword" 
              placeholder="Retype Password" 
              value={formData.confirmPassword} 
              onChange={handleChange} 
              required 
            />
          </div>

          {/* SECTION 2: ROLE & ACCESS */}
          <h3 className="section-title">Role & Access Level</h3>

          <div className="form-group">
            <label className="label">Role</label>
            <select className="input" name="roleid" value={formData.roleid} onChange={handleChange} required>
              <option value="">-- Select Role --</option>
              {/* IMPORTANT: These values match the SQL we ran earlier! */}
              <option value="1">Administrator (IT Dept)</option>
              <option value="2">Warden (Approver)</option>
              <option value="3">Jail Officer (Encoder)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="label">Account Status</label>
            <select className="input" name="status" value={formData.status} onChange={handleChange} required>
              <option value="">-- Select Status --</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive (Suspended)</option>
            </select>
          </div>

          {/* Submit Button */}
          <button type="submit" className="btn-submit">Create User Account</button>

          {/* Message Display */}
          {message && (
            <div className="message" style={{
                backgroundColor: isError ? '#fef2f2' : '#f0fdf4',
                color: isError ? '#dc2626' : '#166534',
                borderColor: isError ? '#fecaca' : '#bbf7d0'
            }}>
              {message}
            </div>
          )}

        </form>
      </div>

      {/* === CUSTOM MODAL COMPONENT === */}
      {/* This uses the styles we added to add.css earlier */}
      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <span className="modal-icon">👤</span>
            <div className="modal-title">Confirm User Creation</div>
            <p className="modal-text">
              Are you sure you want to add <strong>{formData.username}</strong> to the system?
              <br/> They will have access based on the <strong>{formData.roleid === '1' ? 'Admin' : formData.roleid === '2' ? 'Warden' : 'Officer'}</strong> role.
            </p>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowConfirmModal(false)}>Cancel</button>
              <button className="btn-confirm" onClick={confirmSave}>Yes, Create User</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AddUser;