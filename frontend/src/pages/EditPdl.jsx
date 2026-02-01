import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API_BASE_URL from "../apiConfig";
import "./editPdl.css";

const EditPdl = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    first_name: "", last_name: "", pdl_status: "",
    rfid_number: "", gender: "", birthday: "",
    pdl_picture: "", date_commited_pnp: "",
    sentence_years: 0, sentence_months: 0, sentence_days: 0,
    gcta_days: 0, tastm_days: 0, tastm_hours: 0,
    originalStatus: "",
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
  
  const handleJudicialLockToggle = () => {
    // If it's currently locked, show the warning before unlocking
    if (!isJudicialUnlocked) {
        setShowJudicialLockWarning(true);
    } else {
        // If it's already unlocked, just lock it back up
        setIsJudicialUnlocked(false);
    }
};

  const DEFAULT_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23cbd5e1'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z'/%3E%3C/svg%3E";

  useEffect(() => { fetchCurrentPdl(); }, [id]);

  const fetchCurrentPdl = async () => {
    try {
       
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/pdl/get/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();

      if (data.hasMigrated) {
        const gctaEntry = data.gcta_history?.find(l => l.remarks?.includes("Migration"));
        const tastmEntry = data.tastm_history?.find(l => l.remarks?.includes("Migration"));
        data.gcta_days = gctaEntry ? gctaEntry.days_earned : 0;
        data.tastm_days = tastmEntry ? tastmEntry.days_earned : 0;
        data.tastm_hours = tastmEntry ? tastmEntry.total_hours_accumulated : 0;
      }

      if (data.date_commited_pnp) {
        data.date_commited_pnp = new Date(data.date_commited_pnp).toISOString().split('T')[0];
      }

      setFormData({ ...data, originalStatus: data.pdl_status });
   
    } catch (error) { console.error("Fetch error:", error); }
    finally { setLoading(false); }
  };

  const getAllowedStatuses = (original) => {
    if (original === "Released") return ["Released"];
    if (original === "Sentenced") return ["Sentenced", "Released"];
    return ["Detained", "Sentenced", "Released"];
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 🛡️ LOCK TOGGLE LOGIC
  const handleLockToggle = () => {
    if (!isUnlocked && formData.hasMigrated) {
      setShowLockWarning(true); 
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
    if (formData.date_commited_pnp && formData.date_admitted_bjmp) {
        const pnpDate = new Date(formData.date_commited_pnp);
        const bjmpDate = new Date(formData.date_admitted_bjmp);

        // PNP Committal must be BEFORE or EQUAL to BJMP Admission
        if (pnpDate > bjmpDate) {
            setValidationMessage("Judicial Conflict: PNP Committal Date cannot be later than the BJMP Admission Date.");
            setShowValidationError(true);
            setShowModal(false); 
            return;
        }
    }

    try {
        const token = localStorage.getItem("token");
        const payload = {
            ...formData,
            isManualOverride: isUnlocked,
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
            alert("Success: Judicial Ledger Updated.");
            navigate(`/profile/${id}`); 
        } else {
            const result = await response.json();
            alert(`Error: ${result.error || "Failed to update record"}`);
        }
    } catch (error) { 
        alert("System Error: Could not reach the Judicial Server.");
    }
};

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
              <img 
                src={formData.pdl_picture || DEFAULT_AVATAR} 
                alt="Profile" 
                className="profile-img" 
                onError={(e) => { e.target.src = DEFAULT_AVATAR; }} 
              />
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
              <h1>{formData.last_name}, {formData.first_name}</h1>
              <p className="jail-id">Meycauayan Jail ID: #{id}</p>
              
              <div className="specs">
                <div className="spec"><span>Gender</span><strong>{formData.gender}</strong></div>
                <div className="spec"><span>Birthday</span><strong>{formData.birthday ? new Date(formData.birthday).toLocaleDateString() : "N/A"}</strong></div>
                <div className="spec"><span>Case #</span><strong>{formData.case_number || "---"}</strong></div>
                 <div className="spec"><span>BJMP Admission Date: </span><strong>{formData.date_admitted_bjmp ? new Date(formData.date_admitted_bjmp).toLocaleDateString() : "N/A"}</strong></div>
              </div>
            </div>
          </div>

          {/* 3. RIGHT COLUMN: FORM */}
          <div className="card form-card">
            <form onSubmit={handleOpenModal}>
              
              {/* SECTION: SYSTEM MIGRATION LEDGER */}
              <div className="section-header">
                <h3>⚙️ System Migration Ledger</h3>
                <button 
                  type="button" 
                  className={`btn-lock-toggle ${isUnlocked ? 'unlocked' : ''}`} 
                  onClick={handleLockToggle}
                >
                  {isUnlocked ? "🔓 Manual Override Active" : "🔒 Unlock Manual Entry"}
                </button>
              </div>

              <div className={`input-section ${!isUnlocked ? 'disabled' : ''}`}>
                <div className="field">
                  <label>Total GCTA Credits (Days)</label>
                  <input type="number" name="gcta_days" value={formData.gcta_days} onChange={handleChange} disabled={!isUnlocked} />
                </div>

                <div className="tastm-migration-group">
                  <div className="field">
                    <label>TASTM Credits (Days)</label>
                    <input type="number" name="tastm_days" value={formData.tastm_days} onChange={handleChange} disabled={!isUnlocked} />
                  </div>
                  <div className="field">
                    <label>TASTM Balance (Hours)</label>
                    <input type="number" name="tastm_hours" value={formData.tastm_hours} onChange={handleChange} disabled={!isUnlocked} />
                  </div>
                </div>
              </div>

              <hr className="section-divider" />

              {/* SECTION: JUDICIAL RECORDS */}
              <div className="section-header">
                <h3>📂 Judicial Records</h3>
                {(formData.date_commited_pnp || formData.sentence_years > 0) && (
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

                {/* PNP COMMITTAL DATE */}
                <div className="field">
                  <label>PNP Committal Date</label>
                  <input 
                    type="date" 
                    name="date_commited_pnp" 
                    value={formData.date_commited_pnp || ""} 
                    onChange={handleChange} 
                    disabled={(formData.date_commited_pnp || formData.sentence_years > 0) && !isJudicialUnlocked}
                  />
                </div>

                {/* SENTENCE DURATION */}
                {formData.pdl_status === "Sentenced" && (
                  <div className="sentence-reveal-sub">
                    <label>Court-Ordered Sentence Duration</label>
                    <div className="triple-input">
                      <div className="unit-input">
                        <input type="number" name="sentence_years" value={formData.sentence_years} onChange={handleChange} disabled={(formData.date_commited_pnp || formData.sentence_years > 0) && !isJudicialUnlocked} />
                        <span>Years</span>
                      </div>
                      <div className="unit-input">
                        <input type="number" name="sentence_months" value={formData.sentence_months} onChange={handleChange} disabled={(formData.date_commited_pnp || formData.sentence_years > 0) && !isJudicialUnlocked} />
                        <span>Months</span>
                      </div>
                      <div className="unit-input">
                        <input type="number" name="sentence_days" value={formData.sentence_days} onChange={handleChange} disabled={(formData.date_commited_pnp || formData.sentence_years > 0) && !isJudicialUnlocked} />
                        <span>Days</span>
                      </div>
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
            <div className="modal-header"><h3>Confirm Record Update</h3></div>
            <div className="modal-body">
              <p>Finalize changes for <strong>{formData.last_name}</strong>?</p>
            </div>
            <div className="modal-actions">
              <button className="btn-modal-cancel" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn-modal-confirm" onClick={confirmUpdate}>Confirm Update</button>
            </div>
          </div>
        </div>
      )}

      {showValidationError && (
  <div className="modal-overlay">
    <div className="modal-content danger-border">
      <div className="modal-header">
        <h3 className="text-danger">🚫 Invalid Chronology</h3>
      </div>
      <div className="modal-body">
        <p className="validation-text">{validationMessage}</p>
        <p className="helper-text">
          The system requires that the PNP Committal occurs before or on the same day as BJMP Admission.
        </p>
      </div>
      <div className="modal-actions">
        <button className="btn-modal-error" onClick={() => setShowValidationError(false)}>
          I will correct the dates
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default EditPdl;