import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API_BASE_URL from "../apiConfig";
import "./editPdl.css";

const EditPdl = () => {
  const { id } = useParams();
  const navigate = useNavigate();

 
 const [formData, setFormData] = useState({
    // 1. Personal Info
    first_name: "", 
    last_name: "", 
    pdl_status: "",
    rfid_number: "", 
    gender: "", 
    birthday: "",
    pdl_picture: "", 

    // 2. Judicial Info (Dates & Duration)
    date_commited_pnp: "",
    date_of_final_judgment: "", // 🎯 NEW: Conviction Date
    sentence_years: 0, 
    sentence_months: 0, 
    sentence_days: 0,

    // ⚖️ 3. Legal Master Switch
    is_legally_disqualified: false, // 🎯 NEW: RA 10592 Switch (Checkbox)
    disqualification_reason: "",    // 🎯 NEW: Why they are disqualified

    // 4. Allowance Migration & Logic
    gcta_days: 0, 
    tastm_days: 0, 
    tastm_hours: 0,
    originalStatus: "", 
    actual_release_date: "",
    hasMigrated: false 
});
  
 
  const [loading, setLoading] = useState(true);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showModal, setShowModal] = useState(false); 
  const [showLockWarning, setShowLockWarning] = useState(false); 
  const [showValidationError, setShowValidationError] = useState(false);
  const [validationMessage, setValidationMessage] = useState("");

  const [isJudicialUnlocked, setIsJudicialUnlocked] = useState(false); // 🛡️ Gatekeeper for Judicial Info

  // ... (fetchCurrentPdl logic remains the same)

  // 🛡️ Helper to check if judicial data already exists
  const hasJudicialData = formData.date_commited_pnp || 
                         formData.sentence_years > 0 || 
                         formData.sentence_months > 0 || 
                         formData.sentence_days > 0;

  const [showJudicialLockWarning, setShowJudicialLockWarning] = useState(false); 
  const [modal, setModal] = useState({ show: false, title: "", message: "", type: "success" });
  const [selectedFile, setSelectedFile] = useState(null);

  const [isEditing, setIsEditing] = useState(false);

const handleFieldChange = (field, value) => {
  setFormData(prev => {
    const updated = { ...prev, [field]: value };
  
    return updated;
  });
};
  
  const handleJudicialLockToggle = () => {
    // If it's currently locked, show the warning before unlocking
    if (!isJudicialUnlocked) {
        setShowJudicialLockWarning(true);
    } else {
        // If it's already unlocked, just lock it back up
        setIsJudicialUnlocked(false);
    }
};

 const getValidationErrorButtonText = () => {
  if (validationMessage.includes("Chronology") || validationMessage.includes("Date")) {
    return "I will correct the dates";
  }
  if (validationMessage.includes("Judicial")) {
    return "I will lock Judicial Entry";
  }
  return "I will lock the section";
};

const handleImageUpload = (e) => {
  const file = e.target.files[0];
  if (file) {
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setSelectedFile(file);
  }
};



  const DEFAULT_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23cbd5e1'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z'/%3E%3C/svg%3E";

  useEffect(() => { fetchCurrentPdl(); }, [id]);

const fetchCurrentPdl = async () => {
  setLoading(true);
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}/api/pdl/get/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await response.json();

    console.log("--- 🔍 DEBUG: FETCH PDL START ---");

    if (data.hasMigrated) {
      console.log("Migration Detected. Running Universal Lock Scan...");

      const gctaEntry = data.gcta_history?.find(l => 
        l.remarks?.toLowerCase().includes('migration')
      );
      const tastmEntry = data.tastm_history?.find(l => 
        l.remarks?.toLowerCase().includes('migration')
      );

      // ✅ TASTM is locked if:
      // 1. The migration row contains 'locked' in remarks (consumed by sync), OR
      // 2. The migration row status is 'Inactive' (already used and deactivated)
      data.isTastmLocked = !!(
        tastmEntry?.remarks?.toLowerCase().includes('locked') ||
        tastmEntry?.status?.toLowerCase() === 'inactive'
      );

      // ✅ GCTA is locked if:
      // 1. The migration row contains 'locked' in remarks, OR
      // 2. The migration row status is 'Inactive'
      data.isGctaLocked = !!(
        gctaEntry?.remarks?.toLowerCase().includes('locked') ||
        gctaEntry?.status?.toLowerCase() === 'inactive'
      );

      // ✅ Master flag — true if EITHER is locked
      data.isMigrationLocked = data.isTastmLocked || data.isGctaLocked;

      // Map values to form inputs so numbers stay visible even when locked
      data.gcta_days = gctaEntry ? gctaEntry.days_earned : 0;
      data.tastm_days = tastmEntry ? tastmEntry.days_earned : 0;
      data.tastm_hours = tastmEntry ? tastmEntry.total_hours_accumulated : 0;

      console.log(">>> FINAL LOCK STATUS <<<");
      console.log("TASTM Locked:", data.isTastmLocked ? "YES 🔒" : "NO 🔓");
      console.log("GCTA Locked:", data.isGctaLocked ? "YES 🔒" : "NO 🔓");
      console.log("Migration Master Lock:", data.isMigrationLocked ? "YES 🔒" : "NO 🔓");
      if (tastmEntry) console.log("TASTM Remark:", tastmEntry.remarks, "| Status:", tastmEntry.status);
      if (gctaEntry) console.log("GCTA Remark:", gctaEntry.remarks, "| Status:", gctaEntry.status);
    }

    if (data.date_commited_pnp) {
      data.date_commited_pnp = new Date(data.date_commited_pnp).toISOString().split('T')[0];
    }
    if (data.date_of_final_judgment) {
      data.date_of_final_judgment = new Date(data.date_of_final_judgment).toISOString().split('T')[0];
    }

    setPreviewUrl(data.pdl_picture || null);

    setFormData({ 
      ...data, 
      originalStatus: data.pdl_status,
      isMigrationLocked: data.isMigrationLocked || false, 
      isTastmLocked: data.isTastmLocked || false,
      isGctaLocked: data.isGctaLocked || false
    });

    console.log("Final FormData State set. UI should now respect locks.");
    console.log(formData.isTastmLocked);
    console.log(formData.isGctaLocked);

  } catch (error) { 
    console.error("Fetch error:", error); 
  } finally { 
    setLoading(false); 
  }
};

   const [previewUrl, setPreviewUrl] = useState(formData.pdl_picture || null);

  const getAllowedStatuses = (original) => {
    if (original === "Released") return ["Released"];
    if (original === "Sentenced") return ["Sentenced", "Released"];
    return ["Detained", "Sentenced", "Released"];
  };
  const handleChange = (e) => {
    // 1. Destructure 'type' and 'checked' alongside 'name' and 'value'
    const { name, value, type, checked } = e.target;
    console.log(formData);

    setFormData(prev => ({ 
      ...prev, 
      // 2. Use 'checked' if it's a checkbox, otherwise use 'value'
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  // 🛡️ LOCK TOGGLE LOGIC
  const handleLockToggle = () => {
    if (!isUnlocked && formData.hasMigrated) {
      setShowLockWarning(true); 
      console.log(formData.gcta_days);

    } else {
      setIsUnlocked(!isUnlocked);
    }
  };

  const handleOpenModal = (e) => {
    e.preventDefault();
    setShowModal(true);
  };

 const confirmUpdate = async () => {
    // 🛡️ DATE CHRONOLOGY VALIDATION
    if (formData.date_commited_pnp) {
        const pnpDate = new Date(formData.date_commited_pnp);
        const bjmpDate = new Date(formData.date_admitted_bjmp);
        const judgmentDate = formData.date_of_final_judgment ? new Date(formData.date_of_final_judgment) : null;

        // 1. PNP Committal vs BJMP Admission
        if (formData.date_admitted_bjmp && pnpDate > bjmpDate) {
            setValidationMessage("Judicial Conflict: PNP Committal Date cannot be later than the BJMP Admission Date.");
            setShowValidationError(true);
            setShowModal(false); 
            return;
        }

        // 2. 🎯 NEW: Conviction Date Validation
        // A PDL cannot be convicted (Final Judgment) before they are even committed (PNP Date)
        if (formData.pdl_status === "Sentenced") {
            if (!formData.date_of_final_judgment) {
                setValidationMessage("Required: Please provide the Date of Final Judgment for Sentenced PDL.");
                setShowValidationError(true);
                setShowModal(false);
                return;
            }
            if (judgmentDate < pnpDate) {
                setValidationMessage("Judicial Conflict: Final Judgment Date cannot be earlier than the PNP Committal Date.");
                setShowValidationError(true);
                setShowModal(false);
                return;
            }
        }
    }

    // 🛡️ LOCK STATE VALIDATIONS
    if (isUnlocked || isJudicialUnlocked) {
        setValidationMessage("Security Warning: Manual or Judicial panels are currently UNLOCKED. Please lock them to save changes.");
        setShowValidationError(true);
        setShowModal(false); 
        return;
    }

    try {
        const token = localStorage.getItem("token");
    
        const payload = {
            ...formData,
            isManualOverride: true,
            // 🎯 Ensure these new fields are explicitly included
            date_of_final_judgment: formData.date_of_final_judgment || null,
            is_legally_disqualified: formData.is_legally_disqualified === true,
            remarks: formData.remarks || "", 
            
            // Numeric Clean-up
            sentence_years: parseInt(formData.sentence_years) || 0,
            sentence_months: parseInt(formData.sentence_months) || 0,
            sentence_days: parseInt(formData.sentence_days) || 0,
            gcta_days: parseInt(formData.gcta_days) || 0,
            tastm_days: parseInt(formData.tastm_days) || 0,
            tastm_hours: parseFloat(formData.tastm_hours) || 0
        };

        const response = await fetch(`${API_BASE_URL}/api/pdl/update/${id}`, {
            method: "PUT",
            headers: { 
                "Content-Type": "application/json", 
                Authorization: `Bearer ${token}` 
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            setShowModal(false);
            setModal({
                show: true,
                title: "Ledger Updated",
                message: "The Judicial Ledger has been updated. If the PDL was disqualified, detention credits have been voided.",
                type: "success"
            });
        } else {
            const result = await response.json();
            setShowModal(false);
            setModal({
                show: true,
                title: "Update Failed",
                message: result.error || "The server rejected the ledger update.",
                type: "error"
            });
        }
    } catch (error) { 
        setShowModal(false);
        setModal({
            show: true,
            title: "System Error",
            message: "Could not reach the Judicial Server. Check your network connection.",
            type: "error"
        });
    }
};

const handleSubmit = async () => {
  // 🛡️ GUARD 1: Block if currently editing specs
  if (isEditing) {
    setModal({
      show: true,
      title: "Action Required",
      message: "Please click '✅ Done' in the specifications section before saving to finalize your text changes.",
      type: "warning"
    });
    return;
  }

  // 🛡️ GUARD 2: Check for critical identity fields
  const criticalFields = ['first_name', 'last_name', 'birthday', 'crime_name'];
  const isMissing = criticalFields.some(field => !formData[field]?.toString().trim());

  if (isMissing) {
    setModal({
      show: true,
      title: "Missing Data",
      message: "First Name, Last Name, Birthday, and Crime/Offense are mandatory fields.",
      type: "error"
    });
    return;
  }

  try {
    setLoading(true);
    const token = localStorage.getItem("token");
    const dataToSend = new FormData();

    // Append Personal/Identity fields
    dataToSend.append("first_name", formData.first_name);
    dataToSend.append("last_name", formData.last_name);
    dataToSend.append("middle_name", formData.middle_name || "");
    dataToSend.append("gender", formData.gender);
    dataToSend.append("birthday", formData.birthday);
    dataToSend.append("case_number", formData.case_number || "");
    dataToSend.append("crime_name", formData.crime_name || ""); // 🆕 Added crime_name
    dataToSend.append("date_admitted_bjmp", formData.date_admitted_bjmp);

    // Append the image file if a new one was selected
    if (selectedFile) {
    // 🎯 CRITICAL: This key MUST match upload.single('profile_photo') in your routes
    dataToSend.append("profile_photo", selectedFile); 
    console.log("📸 Image attached to FormData:", selectedFile.name);
  } else {
    console.log("⚠️ No new image selected, skipping photo append.");
  }

    const response = await fetch(`${API_BASE_URL}/api/pdl/update-personal/${id}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: dataToSend // Browser sets boundary for FormData automatically
    });

    if (response.ok) {
      setModal({
        show: true,
        title: "Record Sync Successful",
        message: "Personal details and identity photo have been updated in the master database.",
        type: "success"
      });
      // Refresh to ensure state matches DB
      fetchCurrentPdl();
    } else {
      throw new Error("Update failed");
    }
  } catch (error) {
    setModal({
      show: true,
      title: "System Error",
      message: "Failed to connect to the server. Please try again later.",
      type: "error"
    });
  } finally {
    setLoading(false);
  }
};

const handleCloseModal = () => {
    const modalType = modal.type;
    const isReleaseAction = modal.isRelease; // 🔍 Check the flag
    
    setModal({ ...modal, show: false });

    if (modalType === "success") {
        if (isReleaseAction) {
            // 📜 If they were released, take them to the list/archive
            navigate(`/pdl`); 
        } else {
            // ✅ If it was just a name/status update, stay on the profile
            navigate(`/profile/${id}`);
        }
    }
};


const confirmRelease = async () => {
    const releaseDateValue = formData.actual_release_date;

    // 1. Validation Logic
    if (!releaseDateValue) {
        setValidationMessage("Release Error: Actual Release Date cannot be empty.");
        setShowValidationError(true);
        setShowModal(false);
        return;
    }

    const now = new Date();
    // Using locale-based formatting to ensure the string matches YYYY-MM-DD in PH time
    const todayStr = now.toLocaleDateString('en-CA'); // en-CA gives YYYY-MM-DD format

    if (releaseDateValue > todayStr) {
        setValidationMessage(`Invalid Date: You cannot release a PDL on a future date (${releaseDateValue}). Today is ${todayStr}.`);
        setShowValidationError(true);
        setShowModal(false);
        return;
    }

    // 2. Execution Logic
    try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_BASE_URL}/api/pdl/release/${id}`, {
            method: "POST", // POST because we are creating a new record in released_tbl
            headers: { 
                "Content-Type": "application/json", 
                Authorization: `Bearer ${token}` 
            },
            body: JSON.stringify({
                actual_release_date: releaseDateValue,
                // Passing the rest of the form data so the backend can snapshot it
                ...formData 
            })
        });

        if (response.ok) {
          setShowModal(false);
           setModal({
            show: true,
            title: "PDL Released",
            message: "Record moved to archives.",
            type: "success",
            isRelease: true // 🎯 Add this flag
        });
       
        } else {
            const result = await response.json();
            setModal({
              show: true,
              title: "System Error",
              message: (`Error: ${result.error || "Failed to process release"}`),
              type: "error"
            });
        }
    } catch (error) { 
        setModal({
              show: true,
              title: "System Error",
              message: "Could not reach the server",
              type: "error"
            });
    }
};
const prevStatusRef = useRef(formData.pdl_status);
useEffect(() => {
    // Check if the user just switched from something else to 'Sentenced'
    if (prevStatusRef.current !== "Sentenced" && formData.pdl_status === "Sentenced") {
      
      console.log("🕵️‍♂️ Status flip detected! Wiping migration fields...");

      // Wiping the fields in the state
      setFormData(prev => ({
        ...prev,
        gcta_days: 0,
        tastm_days: 0,
        tastm_hours: 0
      }));
    }

    // Update the "Memory" to the current status for the next check
    prevStatusRef.current = formData.pdl_status;
  }, [formData.pdl_status]);

  if (loading) return <div className="loading-state">Syncing Judicial Ledger...</div>;

  

  return (
    <div className="edit-pdl-scope">
      <div className="edit-container">
        {/* 1. TOP NAVIGATION HEADER */}
        <header className="edit-header">
          <button className="btn-back" onClick={() => navigate(-1)}>Back</button>
          <div className="header-text">
            <h2>⚖️ Judicial Transition & Migration Entry</h2>
            <p>Input legacy data for {formData.last_name}, {formData.first_name}</p>
          </div>
        </header>

        <div className="edit-grid">
          {/* 2. LEFT COLUMN: IDENTITY CARD */}
          <div className="card identity-card">
          <div className="image-wrapper">
            {previewUrl ? (
              <>
                <img
                  src={previewUrl}
                  alt="Profile"
                  className="profile-img"
                  onError={(e) => { e.target.src = DEFAULT_AVATAR; }}
                />
                <label htmlFor="pdl-picture-input" className="change-photo-btn" title="Change photo">
                  ✏️
                  <input
                    id="pdl-picture-input"
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={handleImageUpload}
                  />
                </label>
              </>
            ) : (
              <>
                <img
                  src={DEFAULT_AVATAR}
                  alt="Profile"
                  className="profile-img"
                />
                <label htmlFor="pdl-picture-input" className="change-photo-btn" title="Add photo">
                  📷
                  <input
                    id="pdl-picture-input"
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={handleImageUpload}
                  />
                </label>
              </>
            )}

            <div className={`status-badge-side status-${formData.pdl_status?.toLowerCase()}`}>
              {formData.pdl_status === "Sentenced" ? "⚖️ CONVICTED" :
              formData.pdl_status === "Released" ? "✅ RELEASED" : "⏳ DETAINEE"}
            </div>

            <div className="rfid-tag-locked">
              <small>🔒 SECURE RFID TAG</small>
              <span>{formData.rfid_number || "---"}</span>
            </div>
          </div>

          <div className="id-details">
            <h1>{formData.last_name}, {formData.first_name} {formData.middle_name}</h1>
            <p className="jail-id">Meycauayan Jail ID: #{id}</p>

            <div className="specs">
              <button
                className={`edit-specs-btn ${isEditing ? "editing" : ""}`}
                onClick={() => setIsEditing(prev => !prev)}
              >
                {isEditing ? "✅ Done" : "✏️ Edit"}
              </button>

              <div className="spec">
                <span>Gender</span>
                  <strong>{formData.gender}</strong>           
              </div>

              <div className="spec">
                <span>Birthday</span>
                {isEditing ? (
                  <input
                    type="date"
                    value={formData.birthday ? formData.birthday.slice(0, 10) : ""}
                    onChange={(e) => handleFieldChange("birthday", e.target.value)}
                  />
                ) : (
                  <strong>{formData.birthday ? new Date(formData.birthday).toLocaleDateString() : "N/A"}</strong>
                )}
              </div>

              <div className="spec">
                <span>Case #</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.case_number || ""}
                    onChange={(e) => handleFieldChange("case_number", e.target.value)}
                  />
                ) : (
                  <strong>{formData.case_number || "---"}</strong>
                )}
              </div>

              <div className="spec">
                <span>Crime Name</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.crime_name || ""}
                    onChange={(e) => handleFieldChange("crime_name", e.target.value)}
                  />
                ) : (
                  <strong>{formData.crime_name || "---"}</strong>
                )}
              </div>

              <div className="spec">
                <span>BJMP Admission Date</span>
                {isEditing ? (
                  <input
                    type="date"
                    value={formData.date_admitted_bjmp ? formData.date_admitted_bjmp.slice(0, 10) : ""}
                    onChange={(e) => handleFieldChange("date_admitted_bjmp", e.target.value)}
                  />
                ) : (
                  <strong>{formData.date_admitted_bjmp ? new Date(formData.date_admitted_bjmp).toLocaleDateString() : "N/A"}</strong>
                )}
              </div>
            </div>
          </div>
          <button
            className="submit-btn"
            onClick={() => handleSubmit()}
          >
            💾 Save Changes
          </button>
        </div>

          {/* 3. RIGHT COLUMN: FORM */}
          <div className="card form-card">
            <form onSubmit={handleOpenModal}>
              
              {/* SECTION: SYSTEM MIGRATION LEDGER */}
            <div className="section-header migration-header">
  <div className="title-group">
    <h3>⚙️ System Migration Ledger</h3>
    {/* 🎯 Master Status Badge */}
    {formData.isMigrationLocked ? (
      <span className="badge badge-locked">🔒 System Finalized</span>
    ) : (
      <span className="badge badge-open">🔓 Pending Entry</span>
    )}
  </div>

  <button 
    type="button" 
    className={`btn-lock-toggle ${isUnlocked ? 'unlocked' : ''} ${formData.isMigrationLocked ? 'system-disabled' : ''}`} 
    onClick={handleLockToggle}
    // 🛡️ Master Rule: If the system locked it, the button is dead.
    disabled={formData.isMigrationLocked}
  >
    {formData.isMigrationLocked ? "System Locked" : (isUnlocked ? "🔓 Close Manual Entry" : "🔒 Unlock Manual Entry")}
  </button>
</div>

{/* 🚩 Integrity Banner */}
{(formData.isMigrationLocked || formData.isTastmLocked || formData.isGctaLocked) && (
  <div className="migration-lock-banner">
    <div className="banner-content">
      <span className="icon">⚖️</span>
      <div className="text">
        <strong>Migration Data Locked</strong>
        <p>The following migration records have been consumed and are now read-only:</p>
        <div className="lock-indicators">
          {formData.isTastmLocked && (
            <span className="lock-badge tastm">
              🔒 TASTM Migration — Already used by automated sync
            </span>
          )}
          {formData.isGctaLocked && (
            <span className="lock-badge gcta">
              🔒 GCTA Migration — Locked by system or legal disqualification
            </span>
          )}
          {!formData.isTastmLocked && !formData.isGctaLocked && formData.isMigrationLocked && (
            <span className="lock-badge general">
              🔒 Migration record locked
            </span>
          )}
        </div>
        <p className="audit-note">
          Manual edits to migration fields are disabled to maintain the judicial audit trail.
        </p>
      </div>
    </div>
  </div>
)}

{/* 🎯 Input Wrapper: Visual dimming when locked */}
<div className={`input-section migration-fields ${(formData.isMigrationLocked || !isUnlocked) ? 'is-locked' : 'is-editable'}`}>
  
  {/* --- GCTA FIELD --- */}
  <div className={`field ${formData.isGctaLocked ? 'locked-field' : ''}`}>
    <label>
      Total GCTA Credits (Days) 
      {formData.isGctaLocked && <span className="lock-icon">🔒</span>}
    </label>
    <input 
      type="number" 
      name="gcta_days" 
      placeholder="0"
      value={formData.gcta_days} 
      onChange={handleChange} 
      // 🛡️ Lock logic: must be toggled ON and system must NOT have locked it
      disabled={!isUnlocked || formData.isGctaLocked} 
    />
  </div>

  <div className="tastm-migration-group">
    {/* --- TASTM DAYS --- */}
    <div className={`field ${formData.isTastmLocked ? 'locked-field' : ''}`}>
      <label>
        TASTM Credits (Days) 
        {formData.isTastmLocked && <span className="lock-icon">🔒</span>}
      </label>
      <input 
        type="number" 
        name="tastm_days" 
        placeholder="0"
        value={formData.tastm_days} 
        onChange={handleChange} 
        disabled={!isUnlocked || formData.isTastmLocked} 
      />
    </div>
    
    {/* --- TASTM HOURS --- */}
    <div className={`field ${formData.isTastmLocked ? 'locked-field' : ''}`}>
      <label>
        TASTM Balance (Hours) 
        {formData.isTastmLocked && <span className="lock-icon">🔒</span>}
      </label>
      <input 
        type="number" 
        name="tastm_hours" 
        placeholder="0.00"
        value={formData.tastm_hours} 
        onChange={handleChange} 
        disabled={!isUnlocked || formData.isTastmLocked} 
      />
    </div>
  </div>
</div>

              <hr className="section-divider" />

              {/* SECTION: JUDICIAL RECORDS */}
             <div className="section-header">
                <h3>📂 Judicial Records</h3>
                
                {/* 🎯 Updated Condition: 
                    Show the button if we are EDITING an existing PDL (id exists)
                    OR if there's already data saved.
                */}
                {(id || formData.date_commited_pnp || formData.sentence_years > 0) && (
                  <button 
                    type="button" 
                    className={`btn-lock-toggle ${isJudicialUnlocked ? 'unlocked' : ''}`} 
                    onClick={handleJudicialLockToggle}
                  >
                    {isJudicialUnlocked ? "🔓 Judicial Override Active" : "🔒 Unlock Judicial Entry"}
                  </button>
                )}
              </div>

              <div className={`judicial-input-group ${(formData.date_commited_pnp || formData.sentence_years > 0) && !isJudicialUnlocked ? 'disabled' : ''}`}>
                <div className="field status-field">
                  <label>Update Judicial Status</label>
                  <select 
                    name="pdl_status" 
                    value={formData.pdl_status} 
                    onChange={handleChange}
                    disabled={(formData.date_commited_pnp || formData.sentence_years > 0) && !isJudicialUnlocked}
                  >
                    {getAllowedStatuses(formData.originalStatus).map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>


                {formData.pdl_status === "Detained" && (
                 <div className="field">
                  <label>PNP Committal Date</label>
                  <input 
                    type="date" 
                    name="date_commited_pnp" 
                    value={formData.date_commited_pnp || ""} 
                    onChange={handleChange} 
                    disabled={!isJudicialUnlocked}
                  />
                </div>
                )}
        
                {formData.pdl_status === "Sentenced" && (
                  
                  <div className="field">
                      <div className="field">
                    <label>PNP Committal Date</label>
                    <input 
                      type="date" 
                      name="date_commited_pnp" 
                      value={formData.date_commited_pnp || ""} 
                      onChange={handleChange} 
                      disabled={!isJudicialUnlocked}
                    />
                  </div>

                    <div className="field highlight-field">
                    <label className="text-blue-700 font-bold">Date of Final Judgment (Conviction Date)</label>
                    <input 
                      type="date" 
                      name="date_of_final_judgment" 
                      value={formData.date_of_final_judgment || ""} 
                      onChange={handleChange} 
                      disabled={!isJudicialUnlocked}
                      required={formData.pdl_status === "Sentenced"}
                    />
                  </div>
                  
                    <label>Court-Ordered Sentence Duration</label>
                    <div className="triple-input">
                      <div className="unit-input">
                        <input type="number" name="sentence_years" value={formData.sentence_years} onChange={handleChange} 
                        disabled={!isJudicialUnlocked} />
                        <span>Years</span>
                      </div>
                      <div className="unit-input">
                        <input type="number" name="sentence_months" value={formData.sentence_months} onChange={handleChange} 
                        disabled={!isJudicialUnlocked} />
                        <span>Months</span>
                      </div>
                      <div className="unit-input">
                        <input type="number" name="sentence_days" value={formData.sentence_days} onChange={handleChange} 
                        disabled={!isJudicialUnlocked}/>
                        <span>Days</span>
                      </div>
                    </div>
                    

                   <div className="field disqualification-toggle">
  <div className="toggle-container">
    <label htmlFor="is_legally_disqualified">
      Legally Disqualified (RA 10592 Exclusions)?
    </label>
    <input 
      id="is_legally_disqualified"
      type="checkbox" 
      name="is_legally_disqualified"
      className="large-checkbox" /* 🎯 Target this class */
      checked={formData.is_legally_disqualified || false}
      onChange={(e) => handleChange({
        target: { name: 'is_legally_disqualified', value: e.target.checked }
      })}
      disabled={!isJudicialUnlocked}
    />
  </div>
  {formData.is_legally_disqualified && (
    <p className="warning-text">
      ⚠️ Credits earned during detention will be VOIDED upon saving.
    </p>
  )}
</div>
                  </div>
                )}

               {formData.pdl_status === "Released" && (
                <div className="field-group"> {/* Use a group container instead of nested 'field' classes */}
                  
                  <div className="field">
                    <label>PNP Committal Date</label>
                    <input 
                      type="date" 
                      name="date_commited_pnp" 
                      value={formData.date_commited_pnp || ""} 
                      onChange={handleChange} 
                      /* Logic: Disable if Status is Released OR 
                        (if data exists and judicial section isn't explicitly unlocked)
                      */
                      disabled={
                        formData.pdl_status === "Released" || 
                        ((formData.date_commited_pnp || formData.sentence_years > 0) && !isJudicialUnlocked)
                      } 
                    />
                  </div>

                  <div className="field">
                    <label>Actual Release Date</label>
                    <input 
                      type="date" 
                      name="actual_release_date" 
                      value={formData.actual_release_date || ""} 
                      onChange={handleChange} 
                      /* FIX: This should be OPEN when status is "Released" so you can set the date!
                      */
                      disabled={(formData.actual_release_date && !isJudicialUnlocked)} 
                    />
                  </div>

                </div>
              )}
              </div>

              <button type="submit" className="btn-save-finalize">
                Confirm Adjustments & Finalize Baseline
              </button>
            </form>
          </div>
        </div>
      </div>

     {modal.show && (
  <div className="pdl-modal-overlay">
    <div className={`pdl-modal-card ${modal.type}`}>
      <div className="modal-icon">
        {modal.type === "success" ? "✅" : modal.type === "error" ? "❌" : "⚠️"}
      </div>
      <h3>{modal.title}</h3>
      <p>{modal.message}</p>
      
      {/* 🎯 CALL THE HANDLER HERE */}
      <button className="modal-close-btn" onClick={handleCloseModal}>
        Acknowledge
      </button>
    </div>
  </div>
)}

      {/* 🛡️ MODAL A: MIGRATION LOCK WARNING */}
      {showLockWarning && (
        <div className="modal-overlay">
          <div className="modal-content warning-border">
            <div className="modal-header"><h3>⚠️ Migration Data Warning</h3></div>
            <div className="modal-body">
              <p>Unlocking will allow manual modification of established GCTA/TASTM baselines.</p>
            </div>
            <div className="modal-actions">
              <button className="btn-modal-cancel" onClick={() => setShowLockWarning(false)}>Cancel</button>
              <button className="btn-modal-confirm" onClick={() => { setIsUnlocked(true); setShowLockWarning(false); }}>Unlock</button>
            </div>
          </div>
        </div>
      )}

      {/* 🛡️ MODAL B: JUDICIAL LOCK WARNING */}
      {showJudicialLockWarning && (
        <div className="modal-overlay">
          <div className="modal-content warning-border">
            <div className="modal-header"><h3>🚨 Judicial Record Alert</h3></div>
            <div className="modal-body">
              <p>You are attempting to unlock **Court-Mandated Information**.</p>
              <p>Modifying the Committal Date or Sentence Duration will force a recalculation of the release analytics.</p>
            </div>
            <div className="modal-actions">
              <button className="btn-modal-cancel" onClick={() => setShowJudicialLockWarning(false)}>Cancel</button>
              <button className="btn-modal-danger" onClick={() => { setIsJudicialUnlocked(true); setShowJudicialLockWarning(false); }}>Authorize Edit</button>
            </div>
          </div>
        </div>
      )}

      {/* 🛡️ MODAL C: SAVE CONFIRMATION */}
      {showModal && (
    <div className="modal-overlay">
        <div className={`modal-content ${isUnlocked || isJudicialUnlocked ? 'tamper-danger' : ''}`}>
            <div className="modal-header">
                <h3>{formData.pdl_status === "Released" ? "Confirm PDL Release" : "Confirm Record Update"}</h3>
            </div>
            
            <div className="modal-body">
                <p>Finalize changes for <strong>{formData.last_name}, {formData.first_name}</strong>?</p>
                
                {formData.pdl_status === "Released" ? (
                    <div className="release-warning">
                        <p>⚠️ <strong>Action Required:</strong> This will archive the current judicial record and clear active credits. This action is permanent.</p>
                    </div>
                ) : (
                    !isUnlocked && (
                        <p className="helper-text">
                            ⚠️ <strong>Manual Override is locked.</strong> Credit fields (GCTA/TASTM) will not be saved. Unlock Manual Entry first to persist credit changes.
                        </p>
                    )
                )}
            </div>

            <div className="modal-actions">
                <button className="btn-modal-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                
                {/* 🚦 DECISION POINT: Path selection based on Status */}
                {formData.pdl_status === "Released" ? (
                    <button className="btn-modal-confirm release-style" onClick={confirmRelease}>
                        Finalize & Archive Release
                    </button>
                ) : (
                    <button className="btn-modal-confirm" onClick={confirmUpdate}>
                        Confirm Update
                    </button>
                )}
            </div>
        </div>
    </div>
)}


      {showValidationError && (
  <div className="modal-overlay">
    <div className="modal-content danger-border">
      <div className="modal-header">
        {/* We can make the title dynamic too if we want */}
        <h3 className="text-danger">
            {formData.pdl_status === "Released" ? "🚨 Release Validation Error" : "🚫 Invalid Chronology"}
        </h3>
      </div>
      <div className="modal-body">
        <p className="validation-text">{validationMessage}</p>
        <p className="helper-text">
          {validationMessage.includes("Unlocked") 
            ? "Please click the Lock button in the header of the section to finalize your edits before saving."
            : (formData.pdl_status === "Released" 
                ? "Judicial protocol requires an actual release date that is not in the future." 
                : "The system requires that the PNP Committal occurs before or on the same day as BJMP Admission.")
          }
        </p>
      </div>
      <div className="modal-actions">
       <button className="btn-modal-error" onClick={() => setShowValidationError(false)}>
          {getValidationErrorButtonText()}
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default EditPdl;