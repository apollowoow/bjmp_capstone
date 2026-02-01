import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../apiConfig";
import "./add.css";

const Add = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  // 1. 🛡️ REF for Hardware Speed Check
  const lastKeyTime = useRef(Date.now());

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
  const [message, setMessage] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [alertModal, setAlertModal] = useState({ show: false, title: "", message: "", type: "warning" });

 const handleChange = (e) => {
  const { name, value } = e.target;
  const currentTime = Date.now();

  if (name === "rfidNumber") {
    // 🛡️ NO-OP: handleyRfidKeyDown handles the security logic
    // We just handle the data update here.
    const cleanedRFID = value.trim().slice(0, 10);
    setFormData((prev) => ({ ...prev, [name]: cleanedRFID }));
  } else {
    // 🔥 CRITICAL: Update timer for all other fields 
    // to prevent carry-over lag when entering the RFID box.
    lastKeyTime.current = currentTime;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }
};


const handleRfidFocus = () => {
  lastKeyTime.current = Date.now();
  console.log("Security System: Primed & Awaiting Hardware Scan...");
};

// 2. 🛡️ KEYDOWN GUARD: The "Iron Gate" that blocks manual typing
const handleRfidKeyDown = (e) => {
  const currentTime = Date.now();
  
  
  if (formData.rfidNumber.length >= 10 && !["Backspace", "Tab"].includes(e.key)) {

    if (e.key === "Enter") e.preventDefault(); 
    return; 
  }


  if (["Backspace", "Enter", "Tab", "ArrowLeft", "ArrowRight"].includes(e.key)) {
    if (e.key === "Enter") e.preventDefault(); // Block field jumping
    lastKeyTime.current = currentTime;
    return;
  }

 
  if (!formData.rfidNumber || formData.rfidNumber.length === 0) {
    lastKeyTime.current = currentTime;
    return; 
  }

  
  const timeDiff = currentTime - lastKeyTime.current;

  // 5. 🛡️ HARDWARE THRESHOLD (Increased to 100ms for stability)
  if (timeDiff > 100) {
    e.preventDefault(); 
    
    setTimeout(() => {
      showAlert(
        "Manual Entry Blocked", 
        "Hardware verification failed. Please use the physical RFID scanner to ensure record integrity.", 
        "error"
      );
    }, 10);

    lastKeyTime.current = Date.now();
    return;
  }

  // Update timer for the next character in the scan sequence
  lastKeyTime.current = currentTime;
};


  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const showAlert = (title, message, type = "warning") => {
    setAlertModal({ show: true, title, message, type });
  };

 const handleFormSubmit = (e) => {
    e.preventDefault();

    // 1. 🕒 AGE CALCULATION
    let age = 0;
    if (formData.birthday) {
      const birthDate = new Date(formData.birthday);
      const today = new Date();
      age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
    }

    // 2. 🛑 HARD POLICY BLOCKERS (System will NOT save)
    
    // Rule A: No Minors (BJMP Compliance)
    if (age < 18 && formData.birthday) {
      showAlert(
        "Admission Denied: Minor Detected",
        `Subject is only ${age} years old. BJMP policy and R.A. 9344 strictly prohibit the incarceration of minors in adult facilities.`,
        "error"
      );
      return; // Stop execution
    }

    // Rule B: Temporal Logic (Admission must be after Committal)
    if (formData.dateCommitedPNP && formData.admissionDate) {
      const pnpDate = new Date(formData.dateCommitedPNP);
      const bjmpDate = new Date(formData.admissionDate);

      if (bjmpDate < pnpDate) {
        showAlert(
          "Invalid Admission Timeline",
          "The BJMP Admission Date cannot be earlier than the PNP Committal Date. ",
          "error"
        );
        return; // Stop execution
      }
    }

    // Rule C: Critical Field Check
    const blockers = [];
    if (!formData.firstName.trim()) blockers.push("First Name");
    if (!formData.lastName.trim()) blockers.push("Last Name");
    if (!formData.rfidNumber || formData.rfidNumber.length !== 10) blockers.push("10-digit RFID Scan");

    if (blockers.length > 0) {
      showAlert("Missing Critical Data", `Please complete: ${blockers.join(", ")}.`, "error");
      return;
    }

    // 3. ⚠️ SOFT WARNINGS (Information for the Confirm Modal)
    const warnings = [];
    if (!formData.middleName.trim()) warnings.push("Middle Name is missing.");
    if (!selectedFile) warnings.push("Profile photo is missing.");

    if (formData.caseStatus === "Sentenced") {
      const years = parseInt(formData.sentenceYears) || 0;
      const months = parseInt(formData.sentenceMonths) || 0;
      const days = parseInt(formData.sentenceDays) || 0;
      if (years === 0 && months === 0 && days === 0) {
        warnings.push("Court Mandated Sentence is set to 0. Release analytics will be pending.");
      }
    }

    // If we reached here, the record is legally valid. Show the final confirmation.
    setFormData(prev => ({ ...prev, warnings: warnings }));
    setShowConfirmModal(true);
  };

  const confirmSave = async () => {
    setShowConfirmModal(false);
    setMessage("📡 Syncing with BJMP Database...");

    const dataToSend = new FormData();
    Object.keys(formData).forEach((key) => {
      dataToSend.append(key, formData[key]);
    });

    if (selectedFile) dataToSend.append("profile_photo", selectedFile);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/pdl`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: dataToSend,
      });

      const data = await response.json();
      if (response.ok) {
        setMessage(`✅ Registered: ${formData.firstName} ${formData.lastName}`);
        setFormData(initialFormState);
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
          
          <section className="pdl-add__section pdl-add__section--photo full-width">
            <div className="pdl-add__photo-container">
              <div className="pdl-add__photo-preview">
                {previewUrl ? <img src={previewUrl} alt="Preview" /> : <div className="pdl-add__photo-placeholder">No Photo</div>}
              </div>
              <div className="pdl-add__photo-controls">
                <label className="pdl-add__label">PDL Profile Picture</label>
                <div className="pdl-add__file-wrapper">
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} id="pdl-photo-input" />
                  <label htmlFor="pdl-photo-input" className="pdl-add__file-button">📸 {selectedFile ? "Change Photo" : "Upload Photo"}</label>
                </div>
              </div>
            </div>
          </section>

          <h3 className="pdl-add__section-title">1. Personal Identification</h3>
          <div className="pdl-add__group"><label className="pdl-add__label">First Name</label><input className="pdl-add__input" name="firstName" value={formData.firstName} onChange={handleChange} required /></div>
          <div className="pdl-add__group"><label className="pdl-add__label">Last Name</label><input className="pdl-add__input" name="lastName" value={formData.lastName} onChange={handleChange} required /></div>
          <div className="pdl-add__group"><label className="pdl-add__label">Middle Name</label><input className="pdl-add__input" name="middleName" value={formData.middleName} onChange={handleChange} /></div>
          <div className="pdl-add__group"><label className="pdl-add__label">Date of Birth</label><input type="date" className="pdl-add__input" name="birthday" value={formData.birthday} onChange={handleChange} required /></div>
          <div className="pdl-add__group">
            <label className="pdl-add__label">Gender</label>
            <select className="pdl-add__input" name="gender" value={formData.gender} onChange={handleChange} required>
              <option value="">-- Select --</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
          
          <div className="pdl-add__group">
          <label className="pdl-add__label">
            RFID Tag Identification {formData.rfidNumber.length === 10 ? "🔒" : "📡"}
          </label>
          <div className="pdl-add__rfid-box">
            <input 
              className={`pdl-add__input ${
                formData.rfidNumber.length === 10 ? 'pdl-add__input--success' : ''
              }`}
              name="rfidNumber" 
           
              value={formData.rfidNumber} 
              onChange={handleChange}
              onKeyDown={handleRfidKeyDown}
              onFocus={handleRfidFocus}
              placeholder="Hardware Scan Only..." 
              readOnly={formData.rfidNumber.length === 10} // 🔒 Prevents changes after success
              autoComplete="off" 
              required 
            />
            <button type="button" className="pdl-add__rfid-reset" onClick={() => setFormData(p => ({...p, rfidNumber: ""}))}>
              Reset
            </button>
          </div>
        </div>

          <h3 className="pdl-add__section-title">2. Legal & Sentence Information</h3>
          <div className="pdl-add__group"><label className="pdl-add__label">Case Number</label><input className="pdl-add__input" name="caseNumber" value={formData.caseNumber} onChange={handleChange} required /></div>
          <div className="pdl-add__group"><label className="pdl-add__label">Crime / Case Name</label><input className="pdl-add__input" name="caseName" value={formData.caseName} onChange={handleChange} required /></div>
          <div className="pdl-add__group">
            <label className="pdl-add__label">Current Case Status</label>
            <select className="pdl-add__input" name="caseStatus" value={formData.caseStatus} onChange={handleChange} required>
              <option value="Detained">Detained (Pending)</option>
              <option value="Sentenced">Sentenced (Convicted)</option>
            </select>
          </div>
          <div className="pdl-add__group"><label className="pdl-add__label">BJMP Admission Date</label><input type="date" className="pdl-add__input" name="admissionDate" value={formData.admissionDate} onChange={handleChange} required /></div>
          
          {formData.caseStatus === "Sentenced" && (
            <>
              <div className="pdl-add__group full-width">
                <label className="pdl-add__label">PNP Committal Date (Start of Sentence)</label>
                <input type="date" className="pdl-add__input" name="dateCommitedPNP" value={formData.dateCommitedPNP} onChange={handleChange} />
                <small style={{color: '#64748b'}}>Optional, but required for automated release projection.</small>
              </div>

              <div className="pdl-add__sentence-panel full-width">
                <h4>⚖️ Court Mandated Sentence Duration</h4>
                <div className="pdl-add__sentence-grid">
                  <div className="pdl-add__group">
                    <label className="pdl-add__label">Years</label>
                    <input type="number" className="pdl-add__input" name="sentenceYears" value={formData.sentenceYears} onChange={handleChange} min="0" />
                  </div>
                  <div className="pdl-add__group">
                    <label className="pdl-add__label">Months</label>
                    <input type="number" className="pdl-add__input" name="sentenceMonths" value={formData.sentenceMonths} onChange={handleChange} min="0" max="11" />
                  </div>
                  <div className="pdl-add__group">
                    <label className="pdl-add__label">Days</label>
                    <input type="number" className="pdl-add__input" name="sentenceDays" value={formData.sentenceDays} onChange={handleChange} min="0" max="30" />
                  </div>
                </div>
              </div>
            </>
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
            
            {formData.warnings && formData.warnings.length > 0 && (
              <div className="pdl-add__warning-box">
                <p><strong>⚠️ Review Missing Information:</strong></p>
                <ul>
                  {formData.warnings.map((w, i) => (
                    <li key={i} style={{ color: w.includes("Duration") ? "#9a3412" : "inherit" }}>
                      {w}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <p>Proceed with registering <strong>{formData.firstName} {formData.lastName}</strong>?</p>
            
            <div className="pdl-add__modal-actions">
              <button className="pdl-add__btn-secondary" onClick={() => setShowConfirmModal(false)}>Back to Form</button>
              <button className="pdl-add__btn-primary" onClick={confirmSave}>Confirm & Save</button>
            </div>
          </div>
        </div>
      )}
      
      {alertModal.show && (
        <div className="pdl-alert__overlay" style={{display: 'flex', position: 'fixed', zIndex: 9999}}>
          <div className={`pdl-alert__modal pdl-alert__modal--${alertModal.type}`}>
            <div className="pdl-alert__icon">
              {alertModal.type === 'error' ? '🚫' : '⚠️'}
            </div>
            <h3 className="pdl-alert__title">{alertModal.title}</h3>
            <p className="pdl-alert__message">{alertModal.message}</p>
            <button 
              className="pdl-alert__close-btn" 
              onClick={() => {
                setAlertModal({ ...alertModal, show: false });
                // 🛡️ RESET FIELD ON ACKNOWLEDGE
                setFormData(prev => ({ ...prev, rfidNumber: "" }));
                lastKeyTime.current = Date.now();
              }}
            >
              Acknowledge & Retry Scan
            </button>
          </div>
        </div>
      )}
      

    </div>
  );
};

export default Add;