import React, { useState , useRef} from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../apiConfig";
import "./add.css";

const Add = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const initialFormState = {
    firstName: "",
    lastName: "",
    middleName: "",
    birthday: "",
    gender: "",
    cellBlock: "",
    caseStatus: "Detained",
    caseNumber: "",
    caseName: "",
    rfidNumber: "",
    educationalLevel: "",
    admissionDate: "",
    dateCommitedPNP: "",
    sentenceYears: "0",
    sentenceMonths: "0",
    sentenceDays: "0",
  };

  const [formData, setFormData] = useState(initialFormState);
  const [workHistory, setWorkHistory] = useState([""]);
  const [message, setMessage] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // 🛡️ RFID HARDWARE GUARD
    // Limits input to 10 digits to prevent "double-typing" from scanner
    if (name === "rfidNumber") {
      const cleanedRFID = value.trim().slice(0, 10);
      setFormData((prev) => ({ ...prev, [name]: cleanedRFID }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setShowConfirmModal(true);
  };

  // Inside confirmSave function in Add.jsx
  const confirmSave = async () => {
    setShowConfirmModal(false);
    setMessage("📡 Syncing with BJMP Database...");

    const dataToSend = new FormData();
    
    // These keys MUST match the ones we destructure in Node.js
    Object.keys(formData).forEach((key) => {
      dataToSend.append(key, formData[key]);
    });

    // Photo handling
    if (selectedFile) dataToSend.append("profile_photo", selectedFile);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/pdl`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: dataToSend, // Sending the split data
      });

      const data = await response.json();
      if (response.ok) {
        setMessage(`✅ Registered: ${formData.firstName} ${formData.lastName}`);
        setFormData(initialFormState); // Reset form
        setPreviewUrl(null);
        setSelectedFile(null);
      } else {
        setMessage(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      setMessage("❌ Failed to reach server.");
    }
  };

  return (
    <div className="pdl-add">
      <header className="pdl-add__header">
        <div className="pdl-add__header-title">
          <h2>📋 PDL Admission Portal</h2>
          <span className="pdl-add__badge">AI-Enhanced System</span>
        </div>
        <p>Register new inmate and initialize automated time allowance tracking.</p>
      </header>

      <div className="pdl-add__content">
        <form onSubmit={handleFormSubmit} className="pdl-add__form">
          
          {/* PHOTO SECTION WITH CUSTOM BUTTON */}
          <section className="pdl-add__section pdl-add__section--photo full-width">
            <div className="pdl-add__photo-container">
              <div className="pdl-add__photo-preview">
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" />
                ) : (
                  <div className="pdl-add__photo-placeholder">No Photo</div>
                )}
              </div>
              <div className="pdl-add__photo-controls">
                <label className="pdl-add__label">PDL Profile Picture</label>
                <div className="pdl-add__file-wrapper">
                  <input 
                    type="file" 
                    ref={fileInputRef} // 👈 Attach the ref here
                    onChange={handleFileChange} 
                    style={{ display: 'none' }} 
                    id="pdl-photo-input"
                  />
                  <label htmlFor="pdl-photo-input" className="pdl-add__file-button">
                    <span className="pdl-add__file-icon">📸</span>
                    {selectedFile ? "Change Photo" : "Upload Photo"}
                  </label>
                  {selectedFile && (
                    <span className="pdl-add__file-name">
                      Selected: <strong>{selectedFile.name}</strong>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </section>

          <h3 className="pdl-add__section-title">1. Personal Identification</h3>
          <div className="pdl-add__group">
            <label className="pdl-add__label">First Name</label>
            <input className="pdl-add__input" name="firstName" value={formData.firstName} onChange={handleChange} required />
          </div>
          <div className="pdl-add__group">
            <label className="pdl-add__label">Last Name</label>
            <input className="pdl-add__input" name="lastName" value={formData.lastName} onChange={handleChange} required />
          </div>
          <div className="pdl-add__group">
            <label className="pdl-add__label">Middle Name</label>
            <input className="pdl-add__input" name="middleName" value={formData.middleName} onChange={handleChange} />
          </div>
          <div className="pdl-add__group">
            <label className="pdl-add__label">Date of Birth</label>
            <input type="date" className="pdl-add__input" name="birthday" value={formData.birthday} onChange={handleChange} required />
          </div>
          <div className="pdl-add__group">
            <label className="pdl-add__label">Gender</label>
            <select className="pdl-add__input" name="gender" value={formData.gender} onChange={handleChange} required>
              <option value="">-- Select --</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
          
          <div className="pdl-add__group">
            <label className="pdl-add__label">RFID Tag (Scan Now) <span className="pdl-add__tag-hint">🔒 Hardware Locked</span></label>
            <div className="pdl-add__rfid-box">
              <input 
                className="pdl-add__input pdl-add__input--rfid" 
                name="rfidNumber" 
                value={formData.rfidNumber} 
                onChange={handleChange}
                onKeyDown={(e) => {
                  if (formData.rfidNumber.length === 10 && e.key !== "Tab" && e.key !== "Enter") {
                    e.preventDefault();
                  }
                }}
                placeholder="Scan Tag..." 
                required 
              />
              <button type="button" className="pdl-add__rfid-reset" onClick={() => setFormData(p => ({...p, rfidNumber: ""}))}>Reset</button>
            </div>
          </div>

          <h3 className="pdl-add__section-title">2. Legal & Sentence Information</h3>
          <div className="pdl-add__group">
            <label className="pdl-add__label">Case Number</label>
            <input className="pdl-add__input" name="caseNumber" value={formData.caseNumber} onChange={handleChange} required />
          </div>
          <div className="pdl-add__group">
            <label className="pdl-add__label">Crime / Case Name</label>
            <input className="pdl-add__input" name="caseName" value={formData.caseName} onChange={handleChange} required />
          </div>
          <div className="pdl-add__group">
            <label className="pdl-add__label">Current Case Status</label>
            <select className="pdl-add__input" name="caseStatus" value={formData.caseStatus} onChange={handleChange} required>
              <option value="Detained">Detained (Pending)</option>
              <option value="Sentenced">Sentenced (Convicted)</option>
            </select>
          </div>
          <div className="pdl-add__group">
            <label className="pdl-add__label">BJMP Admission Date</label>
            <input type="date" className="pdl-add__input" name="admissionDate" value={formData.admissionDate} onChange={handleChange} required />
          </div>
          <div className="pdl-add__group full-width">
            <label className="pdl-add__label">PNP Committal Date (Optional)</label>
            <input type="date" className="pdl-add__input" name="dateCommitedPNP" value={formData.dateCommitedPNP} onChange={handleChange} />
            <small className="pdl-add__hint">Provide if available to calculate retroactive CPI credits.</small>
          </div>

          {formData.caseStatus === "Sentenced" && (
            <div className="pdl-add__sentence-panel full-width">
              <h4>⚖️ Court Mandated Sentence</h4>
              <div className="pdl-add__sentence-grid">
                <div className="pdl-add__group"><label className="pdl-add__label">Years</label><input type="number" className="pdl-add__input" name="sentenceYears" value={formData.sentenceYears} onChange={handleChange} /></div>
                <div className="pdl-add__group"><label className="pdl-add__label">Months</label><input type="number" className="pdl-add__input" name="sentenceMonths" value={formData.sentenceMonths} onChange={handleChange} /></div>
                <div className="pdl-add__group"><label className="pdl-add__label">Days</label><input type="number" className="pdl-add__input" name="sentenceDays" value={formData.sentenceDays} onChange={handleChange} /></div>
              </div>
            </div>
          )}

          <button type="submit" className="pdl-add__submit-btn">Register New Inmate Record</button>
          {message && <div className={`pdl-add__status ${message.includes('❌') ? 'error' : ''}`}>{message}</div>}
        </form>
      </div>

      {showConfirmModal && (
        <div className="pdl-add__modal-overlay">
          <div className="pdl-add__modal">
            <div className="pdl-add__modal-icon">📄</div>
            <h3>Confirm Admission</h3>
            <p>Verify that all sentencing data and RFID mappings are correct before saving.</p>
            <div className="pdl-add__modal-actions">
              <button className="pdl-add__btn-secondary" onClick={() => setShowConfirmModal(false)}>Review Data</button>
              <button className="pdl-add__btn-primary" onClick={confirmSave}>Confirm & Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Add;