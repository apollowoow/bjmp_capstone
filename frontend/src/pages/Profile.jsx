import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API_BASE_URL from "../apiConfig";
import "./profile.css";

const Profile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pdl, setPdl] = useState(null);
  const [loading, setLoading] = useState(true);
 

  const DEFAULT_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23cbd5e1'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z'/%3E%3C/svg%3E";

  const fetchPdlDetails = async () => {
    try {
        setLoading(true);
        const token = localStorage.getItem("token");

        // 🔍 Check the URL for "?type=released"
        const queryParams = new URLSearchParams(location.search);
        const isReleasedView = queryParams.get("type") === "released";

        if (isReleasedView) {
            // 📜 CASE B: ARCHIVE VIEW (Released Table)
            // We use the ID passed from the Analyze button (which is the release_id)
            const archiveRes = await fetch(`${API_BASE_URL}/api/pdl/getrelease/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (archiveRes.ok) {
                const archiveData = await archiveRes.json();
                setPdl(archiveData);
                console.log(archiveData);
             
            } else {
                throw new Error("Archive record not found");
            }

        } else {
            // 🛡️ CASE A: ACTIVE VIEW (PDL Table)
            // 1. Run recalculate first to ensure GCTA/TASTM is up to date
            await fetch(`${API_BASE_URL}/api/pdl/recalculate/${id}`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` }
            });

            // 2. Fetch the freshly updated active data
            const freshRes = await fetch(`${API_BASE_URL}/api/pdl/get/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (!freshRes.ok) throw new Error("Active PDL not found");
            
            const freshData = await freshRes.json();
            setPdl(freshData);
        }
    } catch (error) {
        console.error("Profile Refresh Error:", error);
        // You could set an error state here to show a message in the UI
    } finally {
        setLoading(false);
    }
};
  useEffect(() => {
    fetchPdlDetails();
  }, [id]);


  if (loading) return <div className="loading-state">Syncing Analytics Data...</div>;
  if (!pdl) return <div className="error-state">Record Not Found.</div>;

  return (
    <div className="profile-scope">
      <div className="profile-container">
        
        {/* 1. TOP NAVIGATION & ACTIONS */}
        <div className="profile-header">
        <button className="btn-back" onClick={() => navigate("/pdl")}>
          ← Back to List
        </button>
        <div className="header-actions">
          {/* 🔒 HIDE EDIT BUTTON IF RELEASED */}
          {pdl.pdl_status !== "Released" && (
            <button className="btn-action btn-edit" onClick={() => navigate(`/edit/${id}`)}>
              ✏️ Edit Record
            </button>
          )}
          {pdl.pdl_status === "Released" && (
            <span className="archive-badge">🔒 Locked Archive</span>
          )}
        </div>
      </div>

       <div className="profile-grid">
        
        {/* 2. IDENTITY CARD */}
        <div className="card identity-card">
          <div className="profile-image-section">
            <img 
              src={pdl.pdl_picture || DEFAULT_AVATAR} 
              alt="PDL Profile" 
              className="profile-main-img"
              onError={(e) => { e.target.src = DEFAULT_AVATAR; }} 
            />
            {/* 🏷️ HIDE RFID FOR RELEASED PDLs */}
            {pdl.pdl_status !== "Released" ? (
              <div className="rfid-container">
                <span className="rfid-label">SECURE RFID TAG</span>
                <span className="rfid-value">{pdl.rfid_number || "---"}</span>
              </div>
            ) : (
              <div className="rfid-container">
                 <span className="rfid-label">RELEASED</span>
              </div>
            )}
          </div>

          <div className="identity-details">
            <h1>{pdl.last_name}, {pdl.first_name}</h1>
            <p className="pdl-id-tag">Meycauayan Jail ID: #{pdl.pdl_id}</p>
            
            <div className="info-list">
              <div className="info-row"><span>Gender</span><strong>{pdl.gender}</strong></div>
              <div className="info-row"><span>Birthday</span><strong>{new Date(pdl.birthday).toLocaleDateString()}</strong></div>
              <div className="info-row"><span>Case Number</span><strong>{pdl.case_number || "Archived"}</strong></div>
              <div className="info-row"><span>Status</span><strong className={`status-text-${pdl.pdl_status.toLowerCase()}`}>{pdl.pdl_status}</strong></div>
              <div className="info-row"><span>Crime/Offense</span><strong>{pdl.crime_name}</strong></div>
            </div>
            {pdl.pdl_status === "Released" && (
                <div className="recommit-wrapper">
                    {pdl.current_live_status === "Released" ? (
                        <button 
                            className="btn-recommit" 
                            onClick={() => navigate(`/add?recommitId=${pdl.pdl_id}`)}
                        >
                            ♻️ Recommit PDL
                        </button>
                    ) : (
                        <div className="recommit-disabled-msg">
                            🔒 <strong>Recommitment Disabled</strong>
                            <span> Subject is currently {pdl.current_live_status}</span>
                        </div>
                    )}
                </div>
            )}
          </div>
                 
        </div>

          {/* 3. ANALYTICS CARD (Conditional Rendering based on Status) */}
          <div className="card analytics-card">
          <div className="analytics-header">
            <h3>
              {pdl.pdl_status === "Released" ? "🏁 Final Release Summary" : 
               pdl.pdl_status === "Sentenced" ? "📊 Predictive Release Analytics" : "⚖️ Judicial Time Ledger"}
            </h3>
            <span className={`status-pill ${pdl.pdl_status?.toLowerCase()}`}>
              {pdl.pdl_status}
            </span>
          </div>
            
            <div className="analytics-body">
              
              {/* ⚖️ SECTION: COURT SENTENCE (Hide if Detained) */}
             {(pdl.pdl_status === "Sentenced" || pdl.pdl_status === "Released") && (
              <div className="sentence-breakdown">
                <p className="sub-heading">{pdl.pdl_status === "Released" ? "Served Sentence Duration" : "Court-Mandated Sentence"}</p>
                <div className="duration-grid">
                  <div className="d-box"><strong>{pdl.sentence_years || 0}</strong><span>Years</span></div>
                  <div className="d-box"><strong>{pdl.sentence_months || 0}</strong><span>Months</span></div>
                  <div className="d-box"><strong>{pdl.sentence_days || 0}</strong><span>Days</span></div>
                </div>
              </div>
            )}

              {/* 📈 SECTION: TIME ALLOWANCE LEDGER (Always Visible) */}
           <div className="allowance-ledger">
            <h4>⏳ Time Allowance Credits</h4>
            <div className="ledger-grid">
              
              {pdl.pdl_status === "Released" ? (
                /* 🏁 RELEASED VIEW: Show only the finalized archive total */
                <div className="ledger-total archived-total">
                  <div className="ledger-info">
                    <strong>Final Credit Summary</strong>
                    <span>Total time allowance applied at discharge</span>
                  </div>
                  <div className="ledger-value positive">
                    -{pdl.total_credits_applied || 0} Days
                  </div>
                </div>
              ) : (
                /* ⏳ ACTIVE VIEW: Show detailed GCTA/TASTM breakdown */
                <>
                  {/* GCTA Summary */}
                  <div className="ledger-item">
                    <div className="ledger-info">
                      <strong>GCTA</strong>
                      <span>Good Conduct Time Allowance</span>
                    </div>
                    <div className="ledger-value positive">
                      -{pdl.gcta_history?.reduce((acc, log) => acc + (parseInt(log.days_earned) || 0), 0) || 0} Days
                    </div>
                  </div>

                  {/* TASTM Summary */}
                  <div className="ledger-item">
                    <div className="ledger-info">
                      <strong>TASTM</strong>
                      <span>Study, Teaching & Mentoring</span>
                    </div>
                    <div className="ledger-value positive">
                      -{pdl.tastm_history?.reduce((acc, log) => acc + (parseInt(log.days_earned) || 0), 0) || 0} Days
                    </div>
                  </div>

                  {/* Total Summary from live pdl_tbl */}
                  <div className="ledger-total">
                    <span>Total Days Deducted:</span>
                    <strong>{pdl.total_timeallowance_earned || 0} Days</strong>
                  </div>
                </>
              )}

            </div>
          </div>

          
              <div className="prediction-results">
                  {/* Standard Timeline Items (Admission/Committal) */}
                  <div className="timeline-item">
                    <p>Admission Date (BJMP)</p>
                    <strong>{pdl.date_admitted_bjmp ? new Date(pdl.date_admitted_bjmp).toLocaleDateString('en-PH') : "---"}</strong>
                  </div>
                  <div className="timeline-item">
                    <p>Committal Date (PNP)</p>
                    <strong>{pdl.date_commited_pnp ? new Date(pdl.date_commited_pnp).toLocaleDateString('en-PH') : "---"}</strong>
                  </div>

                  {/* 🎯 MAIN LOGIC SPLIT */}
                  {pdl.pdl_status === "Released" ? (
                   <div className="release-highlight success-theme">
                      <p>Actual Date of Release</p>
                      <h2 className="release-text">
                        {pdl.actual_release_date 
                          ? new Date(pdl.actual_release_date).toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' }) 
                          : "Archive Recorded"}
                      </h2>
                      
                      {/* 📊 COOL CAPSTONE ADDITION: Show how long they were actually inside */}
                      {pdl.date_admitted_bjmp && pdl.actual_release_date && (
                        <div className="stay-duration">
                          <span>Total Stay Duration: </span>
                          <strong>
                            {Math.ceil((new Date(pdl.actual_release_date) - new Date(pdl.date_admitted_bjmp)) / (1000 * 60 * 60 * 24))} Days
                          </strong>
                        </div>
                      )}
                      
                      <span className="algo-tag">Status: Legally Discharged</span>
                    </div>
                  ) : pdl.pdl_status === "Sentenced" && (pdl.sentence_years > 0 || pdl.sentence_months > 0 || pdl.sentence_days > 0) && pdl.date_commited_pnp ? (
                    /* 2. SENTENCED VIEW: Show Analytics Prediction */
                    <div className="release-highlight">
                      <p>Projected Release Date</p>
                      <h2 className="release-text">
                        {pdl.expected_releasedate ? 
                          new Date(pdl.expected_releasedate).toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' }) 
                          : "Calculating..."}
                      </h2>
                      <span className="algo-tag">Method: Automated Sentence Analytics (TCIS)</span>
                    </div>
                  ) : (
                    /* 3. DETAINED / PENDING VIEW */
                    <div className="detained-notice pending-docs">
                      <div className="notice-icon">
                        {pdl.pdl_status === "Sentenced" ? "📄" : "⏳"}
                      </div>
                      <div className="notice-text">
                        <p>
                          {pdl.pdl_status === "Sentenced" 
                            ? "Sentenced: Awaiting Formal Documentation" 
                            : "Pre-Trial Detention Status"}
                        </p>
                        <span>
                          {pdl.pdl_status === "Sentenced" 
                            ? "Awaiting court-mandated duration or committal dates." 
                            : "PDL is currently under trial. GCTA and TASTM credits are accumulating."}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
            </div>
          </div>

          {/* 4. OFFENSE BOX */}
         
          <div className="card history-card full-width">
  <div className="history-header">
    <h3>📜 Time Allowance History Ledger</h3>
    <p>Detailed month-by-month credit accumulation</p>
  </div>

  <div className="history-tables-wrapper">
    {/* GCTA HISTORY TABLE */}
    <div className="history-section">
      <h4>Good Conduct (GCTA)</h4>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Month/Year</th>
              <th>Days Earned</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {pdl.gcta_history?.length > 0 ? pdl.gcta_history.map((log) => (
              <tr key={log.gcta_log_id}>
                <td>{new Date(log.month_year).toLocaleDateString('en-PH', { month: 'short', year: 'numeric' })}</td>
                <td className="text-positive">+{log.days_earned} Days</td>
                <td><span className={`tag-${log.status?.toLowerCase().replace(' ', '-')}`}>{log.remarks}</span></td>
              </tr>
            )) : <tr><td colSpan="3" className="empty-msg">No GCTA logs found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>

    {/* TASTM HISTORY TABLE */}
    <div className="history-section">
      <h4>Study & Mentoring (TASTM)</h4>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Month/Year</th>
              <th>Hours Part.</th>
              <th>Days Earned</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {pdl.tastm_history?.length > 0 ? pdl.tastm_history.map((log) => (
              <tr key={log.tastm_log_id}>
                <td>{new Date(log.month_year).toLocaleDateString('en-PH', { month: 'short', year: 'numeric' })}</td>
                <td><strong>{log.total_hours_accumulated} hrs</strong></td>
                <td className="text-positive">+{log.days_earned} Days</td>
                <td className="text-positive">{log.remarks}</td>
              </tr>
            )) : <tr><td colSpan="3" className="empty-msg">No TASTM logs found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  </div>
</div>

        </div>
      </div>
    </div>
  );
};

export default Profile;