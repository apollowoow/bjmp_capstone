import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API_BASE_URL from "../apiConfig";
import "./editPdl.css";
import { usePermissions } from "../hooks/usePermission";
import { 
  ChevronLeft, Gavel, Search, Pencil, Camera, 
  Lock, Unlock, ShieldCheck, Fingerprint, Calendar, 
  Scale, AlertTriangle, Save, Archive, Info, 
  CheckCircle2, XCircle, AlertCircle, RefreshCw,
  Plus, History, ClipboardCheck
} from 'lucide-react';

const EditPdl = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin, canDo } = usePermissions();

  console.log("Am I Admin?", isAdmin);

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
  const [showSubConfirm, setShowSubConfirm] = useState(false);
  const [subsidiary, setSubsidiary] = useState(false);
  const [subsidiaryForm, setSubsidiaryForm] = useState({
      total_fine_amount: "",
      daily_rate: 1000,
      judgment_date: new Date().toISOString().split('T')[0],
      remarks: ""
    });


    
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

    // --- Date Formatting Logic ---
    if (data.date_commited_pnp) {
      data.date_commited_pnp = new Date(data.date_commited_pnp).toISOString().split('T')[0];
    }
    if (data.date_of_final_judgment) {
      data.date_of_final_judgment = new Date(data.date_of_final_judgment).toISOString().split('T')[0];
    }

    // --- 💰 Subsidiary Imprisonment Logic ---
    if (data.subsidiary) {
      // 🆔 Map the ID so the Edit function knows which row to update
      data.subsidiary_id = data.subsidiary.subsidiary_id;

      data.total_fine_amount = data.subsidiary.total_fine_amount;
      data.amount_paid = data.subsidiary.amount_paid;
      data.daily_rate = data.subsidiary.daily_rate;
      data.max_subsidiary_days = data.subsidiary.max_subsidiary_days;
      data.subsidiary_status = data.subsidiary.status;
      data.remarks = data.subsidiary.remarks || ""; 

      if (data.subsidiary.judgment_date) {
        data.subsidiary_judgment_date = new Date(data.subsidiary.judgment_date).toISOString().split('T')[0];
      }

      // 🚩 FLAG: Tell the UI we are in Edit Mode
      data.isEditingSubsidiary = true;

      // 🎯 MODAL PRE-FILL: Set the draft state to existing data
      setSubsidiaryForm({
        fine: data.subsidiary.total_fine_amount,
        rate: data.subsidiary.daily_rate
      });

    } else {
      // 🚩 FLAG: No active fine, stay in Add Mode
      data.isEditingSubsidiary = false;
      data.subsidiary_id = null; 
      data.total_fine_amount = ""; 
      data.amount_paid = 0;
      data.daily_rate = 1000; 
      data.subsidiary_judgment_date = "";

      // 🎯 MODAL RESET: Clear the draft state
      setSubsidiaryForm({
        fine: "",
        rate: 1000
      });
    }

    setPreviewUrl(data.pdl_picture || null);

    // --- State Update ---
    setFormData({
      ...data,
      originalStatus: data.pdl_status,
      isMigrationLocked: data.isMigrationLocked || false,
      isTastmLocked: data.isTastmLocked || false,
      isGctaLocked: data.isGctaLocked || false
    });

    console.log("Final FormData State set. UI should now respect locks.");
    console.log("TASTM Lock State:", data.isTastmLocked);
    console.log("GCTA Lock State:", data.isGctaLocked);

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

  const openSubsidiary = () =>{
    setSubsidiary(true);
  }

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

// --- ⚖️ Add this inside your EditPdl component ---
const calculateLegalLimit = () => {
  // Use formData because that's where your PDL's sentence info is stored
  const years = parseInt(formData.sentence_years) || 0;
  const months = parseInt(formData.sentence_months) || 0;
  const days = parseInt(formData.sentence_days) || 0;

  // Convert to total days and divide by 3 (The RPC Art. 39 Rule)
  const totalDays = (years * 365) + (months * 30) + days;
  return Math.floor(totalDays / 3);
};

const handleSaveSubsidiary = () => {
    if (!subsidiaryForm.fine || !subsidiaryForm.rate) {
      setModal({ show: true, title: "Missing Information", message: "Please provide both the fine amount and the daily rate.", type: "error" });
      return;
    }
   
    setShowSubConfirm(true);
  };

  // 🎯 STEP 2: The Actual Execution (Yes clicked)
  const confirmSaveSubsidiary = async () => {
    setShowSubConfirm(false); // Close confirmation
    try {
      const finalDays = Math.min(
        Math.floor(subsidiaryForm.fine / subsidiaryForm.rate),
        calculateLegalLimit()
      );

      const payload = {
        pdl_id: id,
        subsidiary_id: formData.subsidiary_id || null,
        total_fine_amount: subsidiaryForm.fine,
        daily_rate: subsidiaryForm.rate,
        max_subsidiary_days: calculateLegalLimit(),
        final_subsidiary_days: finalDays,
        judgment_date: formData.subsidiary_judgment_date || new Date().toISOString().split('T')[0],
        remarks: formData.remarks || ""
      };

      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/pdl/upsert`, {
        method: "POST", 
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setModal({
          show: true,
          title: "Success!",
          message: formData.isEditingSubsidiary ? "Fine updated." : "Fine record added.",
          type: "success"
        });
        setSubsidiary(false); 
        fetchCurrentPdl(); 
      } else { throw new Error("Update failed."); }
    } catch (err) {
      setModal({ show: true, title: "Update Failed", message: "Database sync error.", type: "error" });
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
        <button className="btn-back" onClick={() => navigate(-1)}>
          <ChevronLeft size={18} /> Back
        </button>
        <div className="header-text">
          <h2>
            {isAdmin ? <Gavel size={24} className="header-icon-inline" /> : <Search size={24} className="header-icon-inline" />} 
            {isAdmin ? " Judicial Transition & Migration Entry" : " PDL Judicial Review"}
          </h2>
          <p>{isAdmin ? "Edit record for" : "Viewing record for"} <strong>{formData.last_name}, {formData.first_name}</strong></p>
        </div>
      </header>

      <div className="edit-grid">
        {/* 2. LEFT COLUMN: IDENTITY CARD */}
        <div className="card identity-card">
          <div className="image-wrapper">
            <img
              src={previewUrl || DEFAULT_AVATAR}
              alt="Profile"
              className="profile-img"
              onError={(e) => { e.target.src = DEFAULT_AVATAR; }}
            />
            <label htmlFor="pdl-picture-input" className="change-photo-btn" title={previewUrl ? "Change photo" : "Add photo"}>
              {previewUrl ? <Pencil size={14} /> : <Camera size={14} />}
              <input
                id="pdl-picture-input"
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleImageUpload}
              />
            </label>

            <div className={`status-badge-side status-${formData.pdl_status?.toLowerCase()}`}>
              {formData.pdl_status === "Sentenced" ? <><Scale size={12} /> CONVICTED</> :
               formData.pdl_status === "Released" ? <><CheckCircle2 size={12} /> RELEASED</> : <><History size={12} /> DETAINEE</>}
            </div>

            <div className="rfid-tag-locked">
              <small><Lock size={10} /> SECURE RFID TAG</small>
              <span><Fingerprint size={14} style={{ verticalAlign: 'middle', marginRight: '5px' }} /> {formData.rfid_number || "---"}</span>
            </div>
          </div>

          <div className="id-details">
            <h1>{formData.last_name}, {formData.first_name} {formData.middle_name}</h1>
            <p className="jail-id">Meycauayan Jail ID: #{id}</p>

            <div className="specs">
              {isAdmin && (
                <button
                  className={`edit-specs-btn ${isEditing ? "editing" : ""}`}
                  onClick={() => setIsEditing(prev => !prev)}
                >
                  {isEditing ? <><CheckCircle2 size={14} /> Done</> : <><Pencil size={14} /> Edit Identity</>}
                </button>
              )}

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
                <span>Offense</span>
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
            </div>
          </div>

          {isAdmin && (
            <div className="identity-actions">
              <button className="submit-btn" onClick={() => handleSubmit()}>
                <Save size={16} /> Save Identity Changes
              </button>
              <button className="submit-btn subsidiary-btn" onClick={() => openSubsidiary()}>
                {formData.isEditingSubsidiary ? <><Pencil size={16} /> Edit Active Fine</> : <><Plus size={16} /> Add New Fine</>}
              </button>
            </div>
          )}
        </div>

        {/* 3. RIGHT COLUMN: FORM */}
        <div className="card form-card">
          <form onSubmit={handleOpenModal}>
            
            {/* SECTION: SYSTEM MIGRATION LEDGER */}
            <div className="section-header migration-header">
              <div className="title-group">
                <h3><ShieldCheck size={20} /> System Migration Ledger</h3>
                {formData.isMigrationLocked ? (
                  <span className="badge badge-locked"><Lock size={10} /> Finalized</span>
                ) : (
                  <span className="badge badge-open"><Unlock size={10} /> Pending</span>
                )}
              </div>

              {isAdmin && (
                <button 
                  type="button" 
                  className={`btn-lock-toggle ${isUnlocked ? 'unlocked' : ''} ${formData.isMigrationLocked ? 'system-disabled' : ''}`} 
                  onClick={handleLockToggle}
                  disabled={formData.isMigrationLocked}
                >
                  {formData.isMigrationLocked ? <><Lock size={14} /> Locked</> : (isUnlocked ? <><Unlock size={14} /> Close Entry</> : <><Lock size={14} /> Unlock Entry</>)}
                </button>
              )}
            </div>

            {/* 🚩 Integrity Banner */}
            {(formData.isMigrationLocked || formData.isTastmLocked || formData.isGctaLocked) && (
              <div className="migration-lock-banner">
                <div className="banner-content">
                  <AlertTriangle size={24} color="#dd6b20" />
                  <div className="text">
                    <strong>Migration Data Locked</strong>
                    <p>Specific migration records have been consumed by the automated tracking system:</p>
                    <div className="lock-indicators">
                      {formData.isTastmLocked && <span className="lock-badge tastm"><Lock size={10} /> TASTM baseline consumed</span>}
                      {formData.isGctaLocked && <span className="lock-badge gcta"><Lock size={10} /> GCTA baseline locked</span>}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className={`input-section migration-fields ${(formData.isMigrationLocked || !isUnlocked) ? 'is-locked' : 'is-editable'}`}>
              <div className={`field ${formData.isGctaLocked ? 'locked-field' : ''}`}>
                <label>Total GCTA Credits (Days) {formData.isGctaLocked && <Lock size={12} className="lock-icon" />}</label>
                <input type="number" name="gcta_days" value={formData.gcta_days} onChange={handleChange} disabled={!isUnlocked || formData.isGctaLocked} />
              </div>

              <div className="tastm-migration-group">
                <div className={`field ${formData.isTastmLocked ? 'locked-field' : ''}`}>
                  <label>TASTM Credits (Days) {formData.isTastmLocked && <Lock size={12} className="lock-icon" />}</label>
                  <input type="number" name="tastm_days" value={formData.tastm_days} onChange={handleChange} disabled={!isUnlocked || formData.isTastmLocked} />
                </div>
                <div className={`field ${formData.isTastmLocked ? 'locked-field' : ''}`}>
                  <label>TASTM Balance (Hours) {formData.isTastmLocked && <Lock size={12} className="lock-icon" />}</label>
                  <input type="number" name="tastm_hours" value={formData.tastm_hours} onChange={handleChange} disabled={!isUnlocked || formData.isTastmLocked} />
                </div>
              </div>
            </div>

            <hr className="section-divider" />

            {/* SECTION: JUDICIAL RECORDS */}
            <div className="section-header">
              <h3><Archive size={20} /> Judicial Records</h3>
              {isAdmin && (id || formData.date_commited_pnp || formData.sentence_years > 0) && (
                <button 
                  type="button" 
                  className={`btn-lock-toggle ${isJudicialUnlocked ? 'unlocked' : ''}`} 
                  onClick={handleJudicialLockToggle}
                >
                  {isJudicialUnlocked ? <><Unlock size={14} /> Override Active</> : <><Lock size={14} /> Unlock Records</>}
                </button>
              )}
            </div>

            <div className={`judicial-input-group ${(formData.date_commited_pnp || formData.sentence_years > 0) && !isJudicialUnlocked ? 'disabled' : ''}`}>
              <div className="field status-field">
                <label>Current Judicial Status</label>
                <select name="pdl_status" value={formData.pdl_status} onChange={handleChange} disabled={(formData.date_commited_pnp || formData.sentence_years > 0) && !isJudicialUnlocked}>
                  {getAllowedStatuses(formData.originalStatus).map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>

              {formData.pdl_status !== "Released" ? (
                <>
                  <div className="field">
                    <label>PNP Committal Date</label>
                    <input type="date" name="date_commited_pnp" value={formData.date_commited_pnp || ""} onChange={handleChange} disabled={!isJudicialUnlocked} />
                  </div>
                  {formData.pdl_status === "Sentenced" && (
                    <>
                      <div className="field highlight-field">
                        <label className="judicial-label-alert">Date of Final Judgment (Conviction)</label>
                        <input type="date" name="date_of_final_judgment" value={formData.date_of_final_judgment || ""} onChange={handleChange} disabled={!isJudicialUnlocked} required />
                      </div>
                      <label>Court-Ordered Sentence Duration</label>
                      <div className="triple-input">
                        <div className="unit-input"><input type="number" name="sentence_years" value={formData.sentence_years} onChange={handleChange} disabled={!isJudicialUnlocked} /><span>Yrs</span></div>
                        <div className="unit-input"><input type="number" name="sentence_months" value={formData.sentence_months} onChange={handleChange} disabled={!isJudicialUnlocked} /><span>Mos</span></div>
                        <div className="unit-input"><input type="number" name="sentence_days" value={formData.sentence_days} onChange={handleChange} disabled={!isJudicialUnlocked} /><span>Days</span></div>
                      </div>
                      <div className="field disqualification-toggle">
                        <div className="toggle-container">
                          <label htmlFor="is_legally_disqualified">Legally Disqualified (RA 10592)?</label>
                          <input id="is_legally_disqualified" type="checkbox" name="is_legally_disqualified" className="large-checkbox" checked={formData.is_legally_disqualified || false} onChange={(e) => handleChange({ target: { name: 'is_legally_disqualified', value: e.target.checked } })} disabled={!isJudicialUnlocked} />
                        </div>
                        {formData.is_legally_disqualified && <p className="warning-text"><AlertCircle size={14} /> Credits earned during detention will be VOIDED.</p>}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="field-group">
                  <div className="field">
                    <label>PNP Committal Date</label>
                    <input type="date" name="date_commited_pnp" value={formData.date_commited_pnp || ""} disabled />
                  </div>
                  <div className="field highlight-field">
                    <label>Actual Release Date</label>
                    <input type="date" name="actual_release_date" value={formData.actual_release_date || ""} onChange={handleChange} disabled={formData.actual_release_date && !isJudicialUnlocked} />
                  </div>
                </div>
              )}
            </div>

            {isAdmin ? (
              <button type="submit" className="btn-save-finalize">
                <ClipboardCheck size={20} /> Confirm Adjustments & Finalize Baseline
              </button>
            ) : (
              <div className="view-only-notice">
                <Info size={20} />
                <p><strong>Read-Only Access:</strong> Sentence and status modifications are restricted to System Administrators.</p>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>

    {/* --- MODALS --- */}

    {/* 🎯 STATUS MODAL (Success/Error) */}
    {modal.show && (
      <div className="pdl-modal-overlay">
        <div className={`pdl-modal-card ${modal.type}`}>
          <div className="modal-icon">
            {modal.type === "success" ? <CheckCircle2 size={48} color="#10b981" /> : modal.type === "error" ? <XCircle size={48} color="#ef4444" /> : <AlertTriangle size={48} color="#f59e0b" />}
          </div>
          <h3>{modal.title}</h3>
          <p>{modal.message}</p>
          <button className="modal-close-btn" onClick={handleCloseModal}>Acknowledge</button>
        </div>
      </div>
    )}
  {showSubConfirm && (

        <div className="modal-overlay">

          <div className="modal-content warning-border">

            <div className="edit-modal-header"><h3>⚖️ Confirm Subsidiary Entry</h3></div>

            <div className="modal-body">

              <p>Are you sure you want to {formData.isEditingSubsidiary ? "update" : "add"} this fine?</p>

              <p>This will add <strong>{Math.min(Math.floor(subsidiaryForm.fine / subsidiaryForm.rate), calculateLegalLimit())} days</strong> to the PDL's incarceration time.</p>

            </div>

            <div className="modal-actions">

              <button className="btn-modal-cancel" onClick={() => setShowSubConfirm(false)}>No, Go Back</button>

              <button className="btn-modal-confirm" onClick={confirmSaveSubsidiary}>Yes, Finalize Fine</button>

            </div>

          </div>

        </div>

      )}
    {/* 💰 SUBSIDIARY MODAL */}
    {subsidiary && (
      <div className="subsidiary-overlay">
        <div className="subsidiary-card">
          <div className="edit-modal-header">
            <h3><Scale size={20} /> Subsidiary Imprisonment Fine</h3>
          </div>
          <div className="modal-body">
            <div className="input-group">
              <label>Total Fine (PHP)</label>
              <input type="number" placeholder="50000" value={subsidiaryForm.fine || ""} onChange={(e) => setSubsidiaryForm({...subsidiaryForm, fine: e.target.value})} />
            </div>
            <div className="input-group">
              <label>Daily Rate (PHP)</label>
              <input type="number" placeholder="1000" value={subsidiaryForm.rate || ""} onChange={(e) => setSubsidiaryForm({...subsidiaryForm, rate: e.target.value})} />
            </div>
            {subsidiaryForm.fine > 0 && subsidiaryForm.rate > 0 && (
              <div className="calculation-preview">
                <p>Calculated Days: <strong>{Math.floor(subsidiaryForm.fine / subsidiaryForm.rate)} days</strong></p>
                <p>Legal Cap (1/3 of Sentence): <strong>{calculateLegalLimit()} days</strong></p>
                <hr />
                <p className="final-days">Added Jail Time: <strong>{Math.min(Math.floor(subsidiaryForm.fine / subsidiaryForm.rate), calculateLegalLimit())} Days</strong></p>
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button className="cancel-btn" onClick={() => setSubsidiary(false)}>Cancel</button>
            <button className="confirm-btn" onClick={handleSaveSubsidiary}><Save size={16} /> Save Fine</button>
          </div>
        </div>
      </div>
    )}

    {/* 🔒 UNLOCK WARNINGS & CONFIRMATIONS */}
    {showLockWarning && (
      <div className="modal-overlay">
        <div className="modal-content warning-border">
          <div className="edit-modal-header"><h3><AlertTriangle size={20} /> Migration Warning</h3></div>
          <div className="modal-body"><p>Unlocking will allow manual modification of established GCTA/TASTM baselines.</p></div>
          <div className="modal-actions">
            <button className="btn-modal-cancel" onClick={() => setShowLockWarning(false)}>Cancel</button>
            <button className="btn-modal-confirm" onClick={() => { setIsUnlocked(true); setShowLockWarning(false); }}>Authorize Unlock</button>
          </div>
        </div>
      </div>
    )}

    {showJudicialLockWarning && (
      <div className="modal-overlay">
        <div className="modal-content danger-border">
          <div className="edit-modal-header"><h3><ShieldCheck size={20} /> Judicial Override</h3></div>
          <div className="modal-body">
            <p>Modifying the Committal Date or Sentence Duration will force a recalculation of release analytics.</p>
          </div>
          <div className="modal-actions">
            <button className="btn-modal-cancel" onClick={() => setShowJudicialLockWarning(false)}>Cancel</button>
            <button className="btn-modal-danger" onClick={() => { setIsJudicialUnlocked(true); setShowJudicialLockWarning(false); }}>Authorize Edit</button>
          </div>
        </div>
      </div>
    )}

    {showModal && (
      <div className="modal-overlay">
        <div className={`modal-content ${isUnlocked || isJudicialUnlocked ? 'tamper-danger' : ''}`}>
          <div className="edit-modal-header"><h3>{formData.pdl_status === "Released" ? <><Archive size={18} /> Confirm Release</> : <><Save size={18} /> Confirm Update</>}</h3></div>
          <div className="modal-body">
            <p>Finalize changes for <strong>{formData.last_name}, {formData.first_name}</strong>?</p>
            {formData.pdl_status === "Released" && <div className="release-warning"><p><AlertCircle size={14} /> <strong>Warning:</strong> This will archive the record and clear active credits.</p></div>}
          </div>
          <div className="modal-actions">
            <button className="btn-modal-cancel" onClick={() => setShowModal(false)}>Cancel</button>
            {formData.pdl_status === "Released" ? (
              <button className="btn-modal-confirm release-style" onClick={confirmRelease}><Archive size={16} /> Finalize Archive</button>
            ) : (
              <button className="btn-modal-confirm" onClick={confirmUpdate}><Save size={16} /> Save Record</button>
            )}
          </div>
        </div>
      </div>
    )}

    {showValidationError && (
      <div className="modal-overlay">
        <div className="modal-content danger-border">
          <div className="edit-modal-header"><h3 className="text-danger"><XCircle size={20} /> Validation Error</h3></div>
          <div className="modal-body">
            <p className="validation-text">{validationMessage}</p>
            <p className="helper-text"><Info size={12} /> Verify all dates and ensure Manual Entry locks are closed before saving.</p>
          </div>
          <div className="modal-actions">
            <button className="btn-modal-error" onClick={() => setShowValidationError(false)}>Review Input</button>
          </div>
        </div>
      </div>
    )}
  </div>
);
};

export default EditPdl;