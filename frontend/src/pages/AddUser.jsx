import { useState } from "react";
import axios from "axios";
import API_BASE_URL from "../apiConfig";
import "./addUser.css"; 
import { 
  UserPlus, Lock, ShieldCheck, User, 
  KeyRound, Activity, CheckCircle2, XCircle, 
  AlertCircle, ChevronRight, UserCog 
} from 'lucide-react';

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
  setShowConfirmModal(false);
  setMessage("Submitting...");

  try {
    // 🔑 Kunin ang token sa storage
    const token = localStorage.getItem("token");

    // 🛡️ Hindi mo na kailangan i-send yung currentUserId: 1 manually!
    // Kusa na yan kukunin ng backend sa token (req.user.userid)
    const payload = { ...formData };

    const res = await axios.post(
      `${API_BASE_URL}/api/users`, 
      payload, 
      {
        headers: {
          Authorization: `Bearer ${token}` // 👈 ITO ANG "BOSS KEY"
        }
      }
    );
      
    setMessage(`✅ ${res.data.message}`);
    setIsError(false);
    
    // Reset Form...
    setFormData({
      username: "", password: "", confirmPassword: "",
      fullName: "", roleid: "", status: ""
    });

  } catch (err) {
  setIsError(true);
  // 🎯 This pulls the specific message like "Password too weak" from your res.status(400)
  if (err.response && err.response.data && err.response.data.error) {
    setMessage(`❌ ${err.response.data.error}`); 
  } else {
    setMessage("❌ Server Error");
  }
}
};

 return (
  <div className="add-container">
    
    {/* 1. Header Banner */}
    <div className="form-header">
      <div className="header-title-group">
        <UserPlus size={32} className="header-icon-main" />
        <div>
          <h2>New System User</h2>
          <p>Create a new account for an Administrator, Warden, or Jail Officer.</p>
        </div>
      </div>
     
    </div>

    <div className="form-content">
      <form onSubmit={handleFormSubmit} className="form-grid">
        
        {/* SECTION 1: ACCOUNT DETAILS */}
        <h3 className="section-title">
          <Lock size={18} /> Account Credentials
        </h3>
        
        <div className="form-group">
          <label className="label">Username</label>
          <div className="input-with-icon">
            <User size={18} className="field-icon" />
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
          <div className="input-with-icon">
            <KeyRound size={18} className="field-icon" />
            <input 
              className="input" 
              type="password" 
              name="password" 
              placeholder="Strong Password" 
              value={formData.password} 
              onChange={handleChange} 
              required 
            />
          </div>
          <small className="password-hint">
            <AlertCircle size={12} /> Must contain 1 Uppercase, 1 Number, 1 Symbol
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
        <h3 className="section-title">
          <ShieldCheck size={18} /> Role & Access Level
        </h3>

        <div className="form-group">
          <label className="label">Role Assignment</label>
          <select className="input" name="roleid" value={formData.roleid} onChange={handleChange} required>
            <option value="">-- Select Role --</option>
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
          </select>
        </div>

        {/* Submit Button */}
        <button type="submit" className="btn-submit">
          <UserPlus size={20} /> Create User Account
        </button>

        {/* Message Display */}
        {message && (
          <div className={`message-box ${isError ? 'err' : 'succ'}`}>
            {isError ? <XCircle size={18} /> : <CheckCircle2 size={18} />}
            {message}
          </div>
        )}

      </form>
    </div>

    {/* === CUSTOM CONFIRMATION MODAL === */}
    {showConfirmModal && (
      <div className="modal-overlay">
        <div className="modal-box">
          <div className="modal-icon-container">
            <UserCog size={48} color="#2563eb" />
          </div>
          <div className="modal-title">Confirm User Creation</div>
          <p className="modal-text">
            Are you sure you want to add <strong>{formData.username}</strong> to the system registry?
            <br/> This user will be granted <strong>{formData.roleid === '1' ? 'Admin' : formData.roleid === '2' ? 'Warden' : 'Officer'}</strong> privileges.
          </p>
          <div className="modal-actions">
            <button className="btn-cancel" onClick={() => setShowConfirmModal(false)}>Cancel</button>
            <button className="btn-confirm" onClick={confirmSave}>
              Authorize & Create
            </button>
          </div>
        </div>
      </div>
    )}

  </div>
);
};

export default AddUser;