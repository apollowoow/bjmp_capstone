import React, { useState, useEffect, useRef  } from 'react';
import API_BASE_URL from "../apiConfig";
import "./education.css";

const Education = () => {
    // --- State Management ---
    const [showSessionModal, setShowSessionModal] = useState(false);
    const rfidInputRef = useRef(null);
    const [showGctaModal, setShowGctaModal] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [activeSession, setActiveSession] = useState(null); 
    
    const [sessionHistory, setSessionHistory] = useState([]); 
    const [currentAttendees, setCurrentAttendees] = useState([]); 
    const [scannedPdl, setScannedPdl] = useState(null); 
    const [rfidInput, setRfidInput] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const scansPerPage = 5;

  // Calculate Pagination
  const indexOfLastScan = currentPage * scansPerPage;
  const indexOfFirstScan = indexOfLastScan - scansPerPage;
  const currentScans = currentAttendees.slice(indexOfFirstScan, indexOfLastScan);
  const totalPages = Math.ceil(currentAttendees.length / scansPerPage);

  const [alertModal, setAlertModal] = useState({
    show: false,
    title: "",
    message: "",
    type: "info", // info, warning, danger
    onConfirm: null // For confirmation actions
});

const [pastSessions, setPastSessions] = useState([]); // 🎯 The Missing State

// Fetch Past Sessions on Load
const fetchPastSessions = async () => {
    try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_BASE_URL}/api/sessions/history`, {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` }
        });
        if (response.ok) {
            const data = await response.json();
            setPastSessions(data);
        }
    } catch (err) {
        console.error("Failed to fetch sessions:", err);
    }
};

useEffect(() => {
    fetchPastSessions();
}, []);

// 2. Helper to trigger the modal
const triggerAlert = (title, message, type = "info", onConfirm = null) => {
    setAlertModal({ show: true, title, message, type, onConfirm });
};

const closeAlert = () => {
    setAlertModal(prev => ({ ...prev, show: false }));
};

  // Reset to page 1 whenever a new attendee is added so the officer sees the latest scan
  useEffect(() => {
      setCurrentPage(1);
  }, [currentAttendees.length]);

    const [sessionForm, setSessionForm] = useState({
        program_name: "Education", 
        session_name: "",
        hours_to_earn: 0,
        session_date: new Date().toISOString().split('T')[0],
        officer_in_charge: ""
    });

    // --- Form Handlers ---
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSessionForm(prev => ({ ...prev, [name]: value }));
    };

    const refocusScanner = () => {
    if (rfidInputRef.current) {
        rfidInputRef.current.focus();
    }
};

    // 🟢 START SESSION
    const handleLaunchScanner = async (e) => {
    e.preventDefault();
    try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_BASE_URL}/api/sessions/start`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify(sessionForm)
        });

        if (response.ok) {
            const sessionData = await response.json();
            console.log("Session Started. ID:", sessionData.session_id); // 🔍 Debug log
            setActiveSession(sessionData); // 🎯 CRITICAL: This must be set
            setShowSessionModal(false);
            setIsScanning(true);
        }
    } catch (err) { console.error(err); }
};

    // 🟡 RFID SCAN (With Double Entry Guard)
   const handleRfidScan = async (e) => {
    if (e.key === 'Enter') {
        const scannedUid = rfidInput;
        setRfidInput(""); 

        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${API_BASE_URL}/api/sessions/log-attendance`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                    session_id: activeSession.session_id,
                    rfid_number: scannedUid,
                    hours_to_earn: activeSession.hours_to_earn
                })
            });

            const data = await response.json();
            
            if (response.status === 409) {
                return triggerAlert("Double Entry Detected", "This PDL has already been scanned for this session.", "warning");
            }

            if (response.ok) {
                setScannedPdl(data); 
            } else {
                triggerAlert("Scan Error", data.error || "RFID not recognized.", "danger");
            }
        } catch (err) { console.error(err); }
    }
};

    const confirmAttendance = () => {
        // Double check local state just in case
        if (!currentAttendees.find(p => p.pdl_id === scannedPdl.pdl_id)) {
            setCurrentAttendees([scannedPdl, ...currentAttendees]);
        }
        setScannedPdl(null); 
    };

    // 🔴 FINALIZE SESSION (Save & Sync)
    const handleFinishSession = async () => {
    // 🛡️ Use custom modal for confirmation
    triggerAlert(
        "Finalize Session?", 
        "End this session and sync attendance logs? Credits will be queued for monthly TASTM calculation.", 
        "info", 
        async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await fetch(`${API_BASE_URL}/api/sessions/finalize/${activeSession.session_id}`, {
                    method: "POST",
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.ok) {
                    // Close the confirmation modal first
                    closeAlert();
                    
                    // 🚀 Trigger a Success Alert (No onConfirm needed, just info)
                    triggerAlert("Success", "Attendance synced. The session is now closed.", "info");

                    // Reset scanner state
                    setIsScanning(false);
                    setActiveSession(null);
                    setCurrentAttendees([]);
                    fetchPastSessions();
                } else {
                    const data = await response.json();
                    triggerAlert("Sync Failed", data.error || "Could not finalize session.", "danger");
                }
            } catch (err) { 
                console.error("Finalization Error:", err);
                triggerAlert("Server Error", "Connection lost during sync.", "danger");
            }
        }
    );
};

    // 🗑️ DISCARD/CANCEL SESSION (Rollback)
    const handleCancelSession = () => {
    triggerAlert(
        "Discard Session?", 
        "This will permanently delete all attendance logs for this session. This action cannot be undone.", 
        "danger",
        async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await fetch(`${API_BASE_URL}/api/sessions/cancel/${activeSession.session_id}`, {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.ok) {
                    // 1. Reset the UI state immediately
                    setIsScanning(false);
                    setActiveSession(null);
                    setCurrentAttendees([]);

                    // 2. 🎯 THE FIX: Show the "Cancelled" Success Modal
                    // We don't call closeAlert() yet; we overwrite the current modal with a success one
                    triggerAlert(
                        "Session Cancelled", 
                        "The session and all associated logs have been successfully discarded.", 
                        "info" // Use 'info' or 'success' depending on your CSS
                    );

                    // 3. Refresh the history table if it exists
                    if (typeof fetchPastSessions === "function") fetchPastSessions();
                } else {
                    triggerAlert("Error", "Could not discard the session. Please try again.", "danger");
                }
            } catch (err) { 
                console.error("Discard Error:", err);
                triggerAlert("Server Error", "Connection lost. The session may not have been deleted.", "danger");
            }
        }
    );
};

    // ⚖️ GLOBAL GCTA GRANT
    const handleGlobalGctaGrant = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${API_BASE_URL}/api/pdl/grant-global-gcta`, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}` 
                },
                body: JSON.stringify({ days_to_grant: 20, month: new Date() })
            });

            if (response.ok) {
                alert("Success: Automated Monthly GCTA granted.");
                setShowGctaModal(false);
            }
        } catch (error) { console.error("GCTA Grant Error:", error); }
    };

    return (
        <div className="education-scope">
            <div className="education-container">
                <header className="page-header">
                    <div className="header-text">
                        <h1>🎓 W&D Programs & Attendance</h1>
                        <p>Manage Program Attendance (TASTM) and Automated Monthly Credits (GCTA).</p>
                    </div>
                    <div className="header-actions">
                        <button className="btn-grant-gcta" onClick={() => setShowGctaModal(true)}>⚖️ Grant Monthly GCTA</button>
                        <button className="btn-primary" onClick={() => setShowSessionModal(true)}>🚀 Start Attendance Session</button>
                    </div>
                </header>

               <div className="section card">
                    <div className="card-header">
                        <h2>📜 Judicial Ledger: Past Sessions</h2>
                        <button className="btn-refresh" onClick={fetchPastSessions}>🔄 Refresh</button>
                    </div>
                    <div className="table-responsive">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Program</th>
                                    <th>Session Topic</th>
                                    <th>Hours</th>
                                    <th>Attendees</th>
                                    <th>Facilitator</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pastSessions && pastSessions.length > 0 ? (
                                    pastSessions.map((session, index) => (
                                        <tr key={session.session_id || index}>
                                            <td>{new Date(session.session_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                                            <td><span className="badge-program">{session.program_name}</span></td>
                                            <td>{session.session_name}</td>
                                            <td><strong>{parseFloat(session.hours_to_earn).toFixed(1)}</strong></td>
                                            <td>{session.attendee_count || 0} PDLs</td>
                                            <td>{session.officer_in_charge}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="no-sessions">
                                            <div className="empty-state-content">
                                                📂 <span>No records found in the Judicial Ledger.</span>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {showSessionModal && (
                <div className="modal-overlay">
                    <div className="modal-content session-modal">
                        <div className="modal-header">
                            <h3>📡 Initialize Attendance Session</h3>
                            <p>Capture session metadata for the Judicial Ledger before scanning.</p>
                        </div>
                        <form onSubmit={handleLaunchScanner}>
                            <div className="modal-body">
                                <div className="form-grid">
                                    <div className="field">
                                        <label>Activity Category</label>
                                        <select name="program_name" value={sessionForm.program_name} onChange={handleInputChange}>
                                            <option value="Education">Education (ALS)</option>
                                            <option value="Vocational">TESDA / Vocational</option>
                                            <option value="Livelihood">Livelihood Training</option>
                                            <option value="Religious">Religious / Values Formation</option>
                                            <option value="Sports">Sports & Recreation</option>
                                        </select>
                                    </div>
                                    <div className="field">
                                        <label>Specific Session Name</label>
                                        <input type="text" name="session_name" placeholder="e.g., Sunday Worship" onChange={handleInputChange} required />
                                    </div>
                                    <div className="form-row-dual">
                                        <div className="field"><label>Credit Hours</label><input type="number" name="hours_to_earn" placeholder="Hours" step="0.1" onChange={handleInputChange} required /></div>
                                        <div className="field"><label>Date</label><input type="date" name="session_date" value={sessionForm.session_date} readOnly /></div>
                                    </div>
                                    <div className="field"><label>Officer in Charge</label><input type="text" name="officer_in_charge" placeholder="Full Name / Rank" onChange={handleInputChange} required /></div>
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-modal-cancel" onClick={() => setShowSessionModal(false)}>Cancel</button>
                                <button type="submit" className="btn-modal-confirm">Confirm & Open RFID Scanner</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showGctaModal && (
                <div className="modal-overlay">
                    <div className="modal-content danger-border">
                        <div className="modal-header"><h3 className="text-danger">⚖️ Confirm Global GCTA Grant</h3></div>
                        <div className="modal-body">
                            <p>Grant **20 days** of GCTA to all PDLs where <code>is_locked_for_gcta</code> is false.</p>
                            <p className="helper-text">Recalculates release dates for all eligible records.</p>
                        </div>
                        <div className="modal-actions">
                            <button className="btn-modal-cancel" onClick={() => setShowGctaModal(false)}>Cancel</button>
                            <button className="btn-modal-confirm" onClick={handleGlobalGctaGrant}>Confirm Global Grant</button>
                        </div>
                    </div>
                </div>
            )}

            {isScanning && (
                <div className="scanner-overlay">
                    <div className="scanner-layout">
                        <div className="scanner-sidebar">
                            <div className="active-session-info">
                                <span className="live-indicator">● LIVE SCANNING MODE</span>
                                <h2>{sessionForm.session_name}</h2>
                                <p>{sessionForm.program_name} • {sessionForm.hours_to_earn} hrs</p>
                            </div>

                            <div className="attendance-counter">
                                <span className="count-num">{currentAttendees.length}</span>
                                <span className="count-label">PDLs Verified</span>
                            </div>

                            <div className="recent-scans-sidebar-container">
                            <div className="recent-scans-list">
                                <div className="list-header">
                                    <h3>Recent Activity</h3>
                                    <span className="total-badge">{currentAttendees.length} Total</span>
                                </div>

                                {currentScans.map((pdl, idx) => (
                                    <div key={idx} className="scan-item">
                                        <img 
                                            src={`${API_BASE_URL}/public/uploads/${pdl.pdl_picture}`} 
                                            className="mini-pdl-photo" 
                                            onError={(e) => e.target.src = "/default-avatar.png"} 
                                            alt="mini" 
                                        />
                                        <div className="scan-item-info">
                                            <span className="scan-name">{pdl.last_name}, {pdl.first_name}</span>
                                            <span className="scan-time">Successfully Logged</span>
                                        </div>
                                    </div>
                                ))}

                                {currentAttendees.length === 0 && <p className="empty-scans">Waiting for scans...</p>}
                            </div>

                            {/* 📟 PAGINATION CONTROLS */}
                            {currentAttendees.length > scansPerPage && (
                                <div className="pagination-controls">
                                    <button 
                                        disabled={currentPage === 1} 
                                        onClick={() => setCurrentPage(prev => prev - 1)}
                                        className="pag-btn"
                                        onMouseUp={refocusScanner}
                                    >
                                        ←
                                    </button>
                                    <span className="pag-info">Page {currentPage} of {totalPages}</span>
                                    <button 
                                        disabled={currentPage === totalPages} 
                                        onClick={() => setCurrentPage(prev => prev + 1)}
                                        className="pag-btn"
                                        onMouseUp={refocusScanner}
                                    >
                                        →
                                    </button>
                                </div>
                            )}
                        </div>

                            <div className="scanner-actions">
                                <button className="btn-finish-session" onClick={handleFinishSession} onMouseUp={refocusScanner}>🏁 End & Save</button>
                                <button className="btn-modal-cancel danger-btn" onClick={handleCancelSession} onMouseUp={refocusScanner}>🗑️ Discard Session</button>
                            </div>
                        </div>

                        <div className="scanner-main">
                            {!scannedPdl ? (
                                <div className="wait-animation">
                                    <div className="rfid-icon">📡</div>
                                    <h2>Ready to Scan</h2>
                                    {/* The hidden input now aggressively stays focused via onBlur */}
                                    <input 
                                        ref={rfidInputRef} 
                                        type="text" 
                                        autoFocus 
                                        className="hidden-rfid-input" 
                                        value={rfidInput} 
                                        onChange={(e) => setRfidInput(e.target.value)} 
                                        onKeyDown={handleRfidScan} 
                                        onBlur={refocusScanner} 
                                    />
                                </div>
                            ) : (
                                <div className="face-match-card">
                                    <div className="match-header">🚨 Identity Verification</div>
                                    <div className="match-body">
                                        <img 
                                            src={`${API_BASE_URL}/public/uploads/${scannedPdl.pdl_picture}`} 
                                            alt="Match" 
                                            className="match-photo" 
                                            onError={(e) => e.target.src = "/default-avatar.png"} 
                                        />
                                        <div className="match-info">
                                            <h3>{scannedPdl.last_name}, {scannedPdl.first_name}</h3>
                                            <p>Jail ID: #{scannedPdl.pdl_id}</p>
                                        </div>
                                    </div>
                                    <div className="match-actions">
                                        {/* 🎯 Added refocusScanner() here so the NEXT scan works immediately */}
                                        <button className="btn-decline" onClick={() => { setScannedPdl(null); refocusScanner(); }}>
                                            ❌ Decline
                                        </button>
                                        <button className="btn-confirm-match" onClick={confirmAttendance}>
                                            ✅ Confirm
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                
            )}
            {alertModal.show && (
              <div className="modal-overlay alert-z-index">
                  <div className={`modal-content alert-modal ${alertModal.type}-border`}>
                      <div className="modal-header">
                          <h3>{alertModal.title}</h3>
                      </div>
                      <div className="modal-body">
                          <p>{alertModal.message}</p>
                      </div>
                      <div className="modal-actions">
                          {alertModal.onConfirm ? (
                              <>
                                  <button className="btn-modal-cancel" onClick={closeAlert}>Cancel</button>
                                  <button className="btn-modal-confirm danger-bg" onClick={alertModal.onConfirm}>Confirm Action</button>
                              </>
                          ) : (
                              <button className="btn-modal-confirm" onClick={closeAlert}>Understood</button>
                          )}
                      </div>
                  </div>
              </div>
          )}
        </div>
    );
};

export default Education;