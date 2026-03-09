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

 
      await fetch(`${API_BASE_URL}/api/pdl/recalculate/${id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });

      // 🎯 STEP 2: Fetch the Fresh Data
      const response = await fetch(`${API_BASE_URL}/api/pdl/get/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const data = await response.json();
      setPdl(data);
    } catch (error) {
      console.error("Profile Refresh Error:", error);
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
            <button className="btn-action btn-edit" onClick={() => navigate(`/edit/${id}`)}>
              ✏️ Edit Record
            </button>
            
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
              <div className="rfid-container">
                <span className="rfid-label">SECURE RFID TAG</span>
                <span className="rfid-value">{pdl.rfid_number || "---"}</span>
              </div>
            </div>

            <div className="identity-details">
              <h1>{pdl.last_name}, {pdl.first_name}</h1>
              <p className="pdl-id-tag">Meycauayan Jail ID: #{pdl.pdl_id}</p>
              
              <div className="info-list">
                <div className="info-row"><span>Gender</span><strong>{pdl.gender}</strong></div>
                <div className="info-row"><span>Birthday</span><strong>{new Date(pdl.birthday).toLocaleDateString()}</strong></div>
                <div className="info-row"><span>Case Number</span><strong>{pdl.case_number}</strong></div>
                <div className="info-row"><span>Status</span><strong>{pdl.pdl_status}</strong></div>
                <div className="info-row"><span>Crime/Offense</span><strong>{pdl.crime_name}</strong></div>
                
              </div>
            </div>
          </div>

          {/* 3. ANALYTICS CARD (Conditional Rendering based on Status) */}
          <div className="card analytics-card">
            <div className="analytics-header">
              <h3>📊 {pdl.pdl_status === "Sentenced" ? "Predictive Release Analytics" : "Judicial Time Ledger"}</h3>
              <span className={`status-pill ${pdl.pdl_status?.toLowerCase()}`}>
                {pdl.pdl_status}
              </span>
            </div>
            
            <div className="analytics-body">
              
              {/* ⚖️ SECTION: COURT SENTENCE (Hide if Detained) */}
              {pdl.pdl_status === "Sentenced" && (
                <div className="sentence-breakdown">
                  <p className="sub-heading">Court-Mandated Sentence</p>
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

    {/* Total Summary from pdl_tbl */}
    <div className="ledger-total">
      <span>Total Days Deducted:</span>
      <strong>{pdl.total_timeallowance_earned || 0} Days</strong>
    </div>
  </div>
</div>

              {/* 🎯 SECTION: PREDICTION RESULTS (Conditional for Sentenced only) */}
              <div className="prediction-results">
                <div className="timeline-item">
                  <p>Admission Date (BJMP)</p>
                  {/* Using date_admitted_bjmp to match your table naming */}
                  <strong>{pdl.date_admitted_bjmp ? new Date(pdl.date_admitted_bjmp).toLocaleDateString('en-PH') : "---"}</strong>
                </div>
                <div className="timeline-item">
                  <p>Committal Date (PNP)</p>
                  <strong>{pdl.date_commited_pnp ? new Date(pdl.date_commited_pnp).toLocaleDateString('en-PH') : "---"}</strong>
                </div>
                
                {/* ⚖️ LOGIC: Status is Sentenced AND (Duration is Missing OR Dates are Missing) */}
                {pdl.pdl_status === "Sentenced" && (pdl.sentence_years > 0 || pdl.sentence_months > 0 || pdl.sentence_days > 0) && pdl.date_commited_pnp ? (
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
                          ? "Status updated to Sentenced, but court-mandated duration or committal dates are still pending documentation. Release analytics will activate once sentence details are encoded." 
                          : "PDL is currently under trial. GCTA and TASTM credits are being accumulated and will be applied toward sentence reduction upon conviction."}
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