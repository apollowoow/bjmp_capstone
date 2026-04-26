import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import API_BASE_URL from "../apiConfig";
import "./add.css";
import { 
  ClipboardList, Camera, Lock, Wifi, Scale, 
  RefreshCw, FilePlus, FileText, AlertTriangle, 
  AlertCircle, CheckCircle2, XCircle, UserPlus,
  Fingerprint
} from 'lucide-react'

const Add = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef(null);
  const queryParams = new URLSearchParams(location.search);
  const recommitId = queryParams.get("recommitId");

  // 1. 🛡️ REF for Hardware Speed Check
  const lastKeyTime = useRef(Date.now());

  const initialFormState = {
    firstName: "",
    lastName: "",
    middleName: "",
    birthday: "",
    gender: "Male",
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

  useEffect(() => {

    if (recommitId) {
      console.log("🎯 Recommit Mode Active for PDL ID:", recommitId);
      fetchPdlForRecommit(recommitId);
   
    }
  }, [recommitId]);

  const handleDuplicateCheck = async (rfid) => {
  if (rfid.length !== 10) return;
 
  try {
    
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}/api/pdl/check-rfid/${rfid}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.ok) {
      const data = await response.json();
      if (data.exists) {
        // 🛡️ RECOMMIT EXEMPTION: Huwag i-block kung siya rin ang may-ari (para sa recommit mode)
        if (recommitId && String(data.pdl.pdl_id) === String(recommitId)) return;

        showAlert(
          "RFID Already Assigned",
          `This tag belongs to: ${data.pdl.first_name} ${data.pdl.last_name}. Please use a new tag.`,
          "error"
        );
        // 🎯 RESET: Linisin ang field para hindi makalusot
        setFormData(prev => ({ ...prev, rfidNumber: "" }));
      }
    }
  } catch (error) {
    console.error("RFID Check Error:", error);
  }
};


  const fetchPdlForRecommit = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/pdl/get/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();

      if (response.ok) {
        // Pre-fill identity fields but keep legal fields empty for the new case
        setFormData(prev => ({
          ...prev,
          firstName: data.first_name,
          lastName: data.last_name,
          middleName: data.middle_name || "",
          birthday: data.birthday ? data.birthday.split('T')[0] : "",
          gender: data.gender,
          rfidNumber: data.rfid_number || ""
        }));

        if (data.pdl_picture) {
          const fullImageUrl = data.pdl_picture.startsWith('http') 
            ? data.pdl_picture 
            : `${API_BASE_URL}${data.pdl_picture}`;
            
          setPreviewUrl(fullImageUrl);

        }
      }
    } catch (error) {
      console.error("Failed to fetch PDL for recommitment:", error);
    }
  };

 const handleChange = (e) => {
  const { name, value } = e.target;
  const currentTime = Date.now();

  if (name === "rfidNumber") {
    // 🛡️ NO-OP logic remains, but we add the trigger
    const cleanedRFID = value.trim().slice(0, 10);
    
    // 🎯 DIRECT TRIGGER: Pag umabot ng 10, check agad sa DB!
    if (cleanedRFID.length === 10) {
      handleDuplicateCheck(cleanedRFID);
    }

    setFormData((prev) => ({ ...prev, [name]: cleanedRFID }));
  } else {
    // 🔥 CRITICAL: Update timer for all other fields 
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

   if (e.key === "Enter") {
    e.preventDefault(); // Iwasan ang form submission
    // 🎯 backup trigger kung sakaling mabilis ang Enter suffix
    if (formData.rfidNumber.length === 10) {
      handleDuplicateCheck(formData.rfidNumber);
    }
    return;
  }
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
   if (!selectedFile && !previewUrl) {
      warnings.push("Profile photo is missing.");
    }
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
    setMessage(recommitId ? "♻️ Recommitting..." : "📡 Registering...");

    const dataToSend = new FormData();
    Object.keys(formData).forEach((key) => {
      dataToSend.append(key, formData[key]);
    });

    if (selectedFile) dataToSend.append("profile_photo", selectedFile);

    try {
      const token = localStorage.getItem("token");
      const url = recommitId ? `${API_BASE_URL}/api/pdl/recommit/${recommitId}` : `${API_BASE_URL}/api/pdl`;
      const method = recommitId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: dataToSend,
      });

      if (response.ok) {
        setAlertModal({
          show: true,
          title: "Success",
          message: recommitId ? "PDL Recommitted successfully." : "New PDL registered.",
          type: "success"
        });
        setTimeout(() => navigate(recommitId ? `/profile/${recommitId}` : "/pdl"), 2000);
      } else {
        const err = await response.json();
        setMessage(` Error: ${err.error}`);
      }
    } catch (error) { setMessage(" Connection failed."); }
  };

 return (
    <div className="pdl-add">
      <header className="pdl-add__header">
        <div className="pdl-add__header-title">
          <h2><ClipboardList size={28} className="pdl-add__header-icon" /> PDL Admission Portal</h2>
          <span className="pdl-add__badge">AI-Enhanced System</span>
        </div>
        <p>Register new PDL and initialize automated time allowance tracking.</p>
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
                  <label htmlFor="pdl-photo-input" className="pdl-add__file-button">
                    <Camera size={18} /> {selectedFile ? "Change Photo" : "Upload Photo"}
                  </label>
                </div>    
              </div>
            </div>
          </section>

          <h3 className="pdl-add__section-title">1. Personal Identification</h3>
          <div className="pdl-add__group"><label className="pdl-add__label">First Name</label><input className="pdl-add__input" name="firstName" 
          readOnly={!!recommitId} value={formData.firstName} onChange={handleChange} style={recommitId ? { backgroundColor: "#f1f5f9", cursor: "not-allowed", color: "#64748b" } : {}} required /></div>
          
          <div className="pdl-add__group"><label className="pdl-add__label">Last Name</label><input className="pdl-add__input" name="lastName" 
          readOnly={!!recommitId} value={formData.lastName} onChange={handleChange} style={recommitId ? { backgroundColor: "#f1f5f9", cursor: "not-allowed", color: "#64748b" } : {}} required /></div>
          
          <div className="pdl-add__group"><label className="pdl-add__label">Middle Name</label><input className="pdl-add__input" name="middleName" 
          readOnly={!!recommitId} value={formData.middleName} style={recommitId ? { backgroundColor: "#f1f5f9", cursor: "not-allowed", color: "#64748b" } : {}} onChange={handleChange} /></div>
          
          <div className="pdl-add__group"><label className="pdl-add__label">Date of Birth</label><input type="date" className="pdl-add__input" 
          readOnly={!!recommitId} style={recommitId ? { backgroundColor: "#f1f5f9", cursor: "not-allowed", color: "#64748b" } : {}} name="birthday" value={formData.birthday} onChange={handleChange} required /></div>
          
          <div className="pdl-add__group">
            <label className="pdl-add__label">Gender</label>
            <select 
                className="pdl-add__input" 
                name="gender" 
                value={formData.gender} 
                onChange={handleChange} 
                required
                disabled={!!recommitId}
                style={recommitId ? { backgroundColor: "#f1f5f9" } : {}}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
          </div>
          
          <div className="pdl-add__group">
            <label className="pdl-add__label pdl-add__rfid-label">
              RFID Tag Identification {formData.rfidNumber.length === 10 ? <Lock size={14} color="#10b981" /> : <Wifi size={14} className="pdl-add__blink" />}
            </label>
            <div className="pdl-add__rfid-box">
                <div className="pdl-add__input-with-icon">
                    <Fingerprint size={18} className="pdl-add__rfid-icon-inner" />
                    <input 
                    className={`pdl-add__input pdl-add__input--rfid ${
                        formData.rfidNumber.length === 10 ? 'pdl-add__input--success' : ''
                    }`}
                    name="rfidNumber" 
                    value={formData.rfidNumber} 
                    onChange={handleChange}
                    onKeyDown={handleRfidKeyDown}
                    onFocus={handleRfidFocus}
                    placeholder="Hardware Scan Only..." 
                    readOnly={formData.rfidNumber.length === 10}
                    autoComplete="off" 
                    required 
                    />
                </div>
              <button type="button" className="pdl-add__rfid-reset" onClick={() => setFormData(p => ({...p, rfidNumber: ""}))}>
                <RefreshCw size={14} />
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
                <h4><Scale size={18} style={{verticalAlign: 'middle', marginRight: '8px'}} /> Court Mandated Sentence Duration</h4>
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

          <button type="submit" className="pdl-add__submit-btn">
            {recommitId ? <><RefreshCw size={18} /> Finalize Recommitment</> : <><FilePlus size={18} /> Register New PDL Record</>}
          </button>
          
         {message && (
    <div className={`pdl-add__status ${message.toLowerCase().includes('error') ? 'error' : ''}`}>
        {/* 🎯 Tinitignan kung may salitang 'error' sa message para sa Icon at Class */}
        {message.toLowerCase().includes('error') ? (
            <XCircle size={16} /> 
        ) : (
            <CheckCircle2 size={16} />
        )} 
        {message}
    </div>
)}
        </form>
      </div>

      {/* --- CONFIRMATION MODAL --- */}
      {showConfirmModal && (
        <div className="pdl-add__modal-overlay">
          <div className="pdl-add__modal">
            <div className="pdl-add__modal-icon">
                <FileText size={48} color="#2563eb" />
            </div>
            <h3>Confirm Admission</h3>
            
            {formData.warnings && formData.warnings.length > 0 && (
              <div className="pdl-add__warning-box">
                <p><strong><AlertTriangle size={14} style={{verticalAlign: 'middle'}} /> Review Missing Information:</strong></p>
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
      
      {/* --- ALERT MODAL (ERROR/SCAN) --- */}
      {alertModal.show && (
        <div className="pdl-alert__overlay" style={{display: 'flex', position: 'fixed', zIndex: 9999}}>
          <div className={`pdl-alert__modal pdl-alert__modal--${alertModal.type}`}>
            <div className="pdl-alert__icon">
              {alertModal.type === 'error' ? <XCircle size={64} color="#ef4444" /> : <AlertCircle size={64} color="#f59e0b" />}
            </div>
            <h3 className="pdl-alert__title">{alertModal.title}</h3>
            <p className="pdl-alert__message">{alertModal.message}</p>
            <button 
              className="pdl-alert__close-btn" 
              onClick={() => {
                setAlertModal({ ...alertModal, show: false });
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