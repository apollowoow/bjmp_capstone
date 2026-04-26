import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API_BASE_URL from "../apiConfig";
import "./profile.css";
import { usePermissions } from "../hooks/usePermission";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { 
  ChevronLeft, Pencil, Lock, Archive, Fingerprint, 
  User, Calendar, ShieldCheck, Scale, Gavel, 
  RotateCcw, History, ClipboardList, BarChart3, 
  Hourglass, AlertTriangle, CheckCircle2, TrendingDown, Activity, FileText, Clock, Info, Banknote, CalendarDays
} from 'lucide-react';

const Profile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pdl, setPdl] = useState(null);
  const [loading, setLoading] = useState(true);
  const { canDo, user } = usePermissions();
  const [historyData, setHistoryData] = useState([]);
 

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
            console.log(freshData);
        }
    } catch (error) {
        console.error("Profile Refresh Error:", error);
        // You could set an error state here to show a message in the UI
    } finally {
        setLoading(false);
    }
};

const exportProfileToPDF = async () => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const centerX = pageWidth / 2;

  try {
    // 1. LETTERHEAD
    doc.setFont("helvetica", "normal").setFontSize(10);
    doc.text("REPUBLIC OF THE PHILIPPINES", centerX, 15, { align: "center" });
    doc.setFont("helvetica", "bold").text("BUREAU OF JAIL MANAGEMENT AND PENOLOGY", centerX, 20, { align: "center" });
    doc.setFont("helvetica", "normal").text("Meycauayan City Jail, Bulacan", centerX, 25, { align: "center" });
    doc.line(14, 30, pageWidth - 14, 30); // Horizontal Line

    // 📸 2. PROFILE PICTURE (Base64 Logic)
    if (pdl.pdl_picture) {
      const imgUrl = pdl.pdl_picture;
      console.log(imgUrl);
      try {
        const base64Img = await getBase64ImageFromURL(imgUrl);
        doc.addImage(base64Img, 'JPEG', 15, 35, 40, 40);
        doc.rect(15, 35, 40, 40); // Border for photo
      } catch (e) {
        doc.rect(15, 35, 40, 40);
        doc.text("No Image", 35, 55, { align: "center" });
      }
    }

    // 📄 3. BASIC DETAILS (Beside Photo)
    doc.setFontSize(18).setFont("helvetica", "bold");
    doc.text(`${pdl.last_name}, ${pdl.first_name} ${pdl.middle_name || ""}`, 60, 45);
    
    doc.setFontSize(10).setFont("helvetica", "normal");
    doc.text(`PDL ID Number: #${pdl.pdl_id}`, 60, 52);
    doc.text(`Status: ${pdl.pdl_status.toUpperCase()}`, 60, 57);
    doc.text(`Admission Date: ${new Date(pdl.date_admitted_bjmp).toLocaleDateString()}`, 60, 62);
    doc.text(`Case Number: ${pdl.case_number}`, 60, 67);
    doc.text(`Crime: ${pdl.crime_name}`, 60, 72);

    // 📊 4. CURRENT STATS (GCTA / TASTM Cards)
    doc.setDrawColor(200);
    doc.setFillColor(245, 245, 245);
    doc.rect(14, 80, pageWidth - 28, 25, 'F'); // Stats Background
    
    doc.setFont("helvetica", "bold").setFontSize(11);
    doc.text("CURRENT TIME ALLOWANCE STATS", 20, 87);
    
    doc.setFont("helvetica", "normal").setFontSize(10);
    doc.text(`Active GCTA: ${pdl.active_gcta || 0} Days`, 20, 95);
    doc.text(`Active TASTM: ${pdl.active_tastm || 0} Days`, 80, 95);
    doc.text(`Total Earned Credits: ${pdl.total_timeallowance_earned || 0} Days`, 140, 95);

    // 📜 5. HISTORY TABLE (Past Records)
    doc.setFont("helvetica", "bold").setFontSize(12);
    doc.text("LEGAL HISTORY & PREVIOUS RECORDS", 14, 115);
    
    autoTable(doc, {
  startY: 125, // Adjusted for the profile section above
  head: [[
    "Offense/Crime", 
    "Sentence Duration", 
    "Admission Date", 
    "Actual Release", 
    "GCTA Earned"
  ]],
 body: historyData.map(h => [
    h.crime_name || 'N/A',
    // 🎯 Dito natin gagamitin ang bagong formatter
    formatSentenceReadable(h.sentence_years, h.sentence_months, h.sentence_days),
    h.date_admitted_bjmp ? new Date(h.date_admitted_bjmp).toLocaleDateString() : 'N/A',
    h.actual_release_date ? new Date(h.actual_release_date).toLocaleDateString() : 'N/A',
    `${h.total_timeallowance_earned || 0} Days`
  ]),
  theme: 'grid',
  headStyles: { 
    fillColor: [15, 23, 42], // Slate blue theme
    fontSize: 9,
    halign: 'center' 
  },
  columnStyles: {
    0: { cellWidth: 45 }, // Crime (wider)
    1: { cellWidth: 35 }, // Sentence
    2: { cellWidth: 35 }, // Admission
    3: { cellWidth: 35 }, // Release
    4: { cellWidth: 30, halign: 'center' } // GCTA
  },
  styles: { fontSize: 8, cellPadding: 3 },
  margin: { left: 14, right: 14 }
});

    // 🖋️ 6. SIGNATORIES
    const finalY = doc.lastAutoTable.finalY + 30;
    doc.text("Prepared By:", 14, finalY);
    doc.text(user.fullname || "Records Officer", 14, finalY + 15);
    doc.line(14, finalY + 10, 60, finalY + 10);

    doc.text("Noted By:", 140, finalY);
    doc.text("Jail Warden", 140, finalY + 15);
    doc.line(140, finalY + 10, 190, finalY + 10);

    doc.save(`Dossier_${pdl.last_name}.pdf`);

  } catch (error) {
    console.error("PDF Generation Error:", error);
    alert("Failed to generate PDF. Check if image is accessible.");
  }
};

const formatSentenceReadable = (y, m, d) => {
    const parts = [];
    
    // Convert to numbers to be sure
    const years = parseInt(y) || 0;
    const months = parseInt(m) || 0;
    const days = parseInt(d) || 0;

    if (years > 0) parts.push(`${years} ${years === 1 ? 'Year' : 'Years'}`);
    if (months > 0) parts.push(`${months} ${months === 1 ? 'Month' : 'Months'}`);
    if (days > 0) parts.push(`${days} ${days === 1 ? 'Day' : 'Days'}`);

    // Kung lahat zero, ibig sabihin walang sentence (e.g., dismissed)
    return parts.length > 0 ? parts.join(', ') : "None / Served";
};

    const getBase64ImageFromURL = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.setAttribute("crossOrigin", "anonymous"); // 🛡️ Important for CORS!
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      const dataURL = canvas.toDataURL("image/jpeg");
      resolve(dataURL);
    };
    img.onerror = (error) => reject(error);
    img.src = url;
  });
};

  useEffect(() => {
    fetchPdlDetails();
  }, [id]);

useEffect(() => {
    const fetchHistory = async () => {
        try {
            // 🎯 1. Kunin ang token mula sa localStorage
            const token = localStorage.getItem("token"); 

            const response = await fetch(`${API_BASE_URL}/api/pdl/history/${id}`, {
                method: "GET",
                headers: {
                    // 🎯 2. Isama ang Token sa Headers
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            if (response.status === 401) {
                console.error("Session expired or token missing");
                return;
            }

            const data = await response.json();
            setHistoryData(data.history || []); // Siguraduhin na array ang makuha
        } catch (error) {
            console.error("Error fetching history:", error);
        }
    };
    
    if (id) fetchHistory();
}, [id]);


  if (loading) return <div className="loading-state">Syncing Analytics Data...</div>;
  if (!pdl) return <div className="error-state">Record Not Found.</div>;

 return (
    <div className="profile-scope">
      <div className="profile-container">
        
        {/* 1. TOP NAVIGATION & ACTIONS */}
        <div className="profile-header">
          <button className="btn-back" onClick={() => navigate("/pdl")}>
            <ChevronLeft size={18} /> Back to List
          </button>
          <div className="header-actions">
            {/* 🔒 HIDE EDIT BUTTON IF RELEASED */}{canDo("PDL & RFID Management", "canview") && (
              <button className="btn-action btn-edit" onClick={exportProfileToPDF}>
                <FileText size={16} /> Generate Dossier
              </button>
            )}
            {pdl.pdl_status !== "Released" && canDo("PDL & RFID Management", "canedit") && (
              <button className="btn-action btn-edit" onClick={() => navigate(`/edit/${id}`)}>
                <Pencil size={16} /> Edit Record
              </button>
            )}
            
            {pdl.pdl_status === "Released" && (
              <span className="archive-badge">
                <Lock size={14} /> Locked Archive
              </span>
              
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
                  <span className="rfid-label"><Fingerprint size={10} /> SECURE RFID TAG</span>
                  <span className="rfid-value">{pdl.rfid_number || "---"}</span>
                </div>
              ) : (
                <div className="rfid-container released-tag">
                   <span className="rfid-label"><Archive size={10} /> RELEASED</span>
                </div>
              )}
            </div>

            <div className="identity-details">
              <h1>{pdl.last_name}, {pdl.first_name}</h1>
              <p className="pdl-id-tag">Meycauayan Jail ID: #{pdl.pdl_id}</p>
              
              <div className="info-list">
                <div className="info-row">
                  <span><User size={14} /> Gender</span>
                  <strong>{pdl.gender}</strong>
                </div>
                <div className="info-row">
                  <span><Calendar size={14} /> Birthday</span>
                  <strong>{new Date(pdl.birthday).toLocaleDateString()}</strong>
                </div>
                <div className="info-row">
                  <span><ShieldCheck size={14} /> Case Number</span>
                  <strong>{pdl.case_number || "Archived"}</strong>
                </div>
                <div className="info-row">
                  <span><Activity size={14} /> Status</span>
                  <strong className={`status-text-${pdl.pdl_status.toLowerCase()}`}>{pdl.pdl_status}</strong>
                </div>
                <div className="info-row">
                  <span><Scale size={14} /> Offense</span>
                  <strong>{pdl.crime_name}</strong>
                </div>
                <div className="info-row">
                <span><Scale size={14} /> PDL Conduct Status</span>
                {/* 🎯 LOGIC: Kung true, ibig sabihin may record (Committed Recently). 
                    Kung false, ibig sabihin malinis (Good PDL). */}
                <strong style={{ 
                    color: (pdl.is_locked_for_gcta === true || pdl.is_locked_for_gcta === 't') ? '#ef4444' : '#10b981',
                    backgroundColor: (pdl.is_locked_for_gcta === true || pdl.is_locked_for_gcta === 't') ? '#fef2f2' : '#f0fdf4',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    fontSize: '0.85rem'
                }}>
                  {(pdl.is_locked_for_gcta === true || pdl.is_locked_for_gcta === 't') 
                    ? "Ineligible" 
                    : "Eligible"}
                </strong>
              </div>

                {pdl.is_locked_for_gcta && pdl.active_penalty && (
                  <div className="pdl-penalty-info-card">
                    <div className="pdl-penalty-header">
                      <AlertTriangle size={20} />
                      <h3>Active Disciplinary Penalty</h3>
                    </div>
                    
                    <div className="pdl-penalty-body">
                      <div className="pdl-penalty-item">
                        <strong>{pdl.active_penalty.category}</strong>
                      </div>
                      <div className="pdl-penalty-item">
                        <span>Remarks:</span>
                        <p>{pdl.active_penalty.remarks}</p>
                      </div>
                      <div className="pdl-penalty-dates">
                        <div className="pdl-date-badge">
                          <Calendar size={14} /> Start: {pdl.active_penalty.incident_date}
                        </div>
                        <div className="pdl-date-badge-end">
                          <Clock size={14} /> End: {pdl.active_penalty.penalty_end_date}
                        </div>
                      </div>
                    </div>
                    
                    <div className="pdl-penalty-footer">
                      <Info size={14} /> GCTA computation is suspended until the end date.
                    </div>
                  </div>
                  )}
              </div>

              {pdl.pdl_status === "Released" && (
                <div className="recommit-wrapper">
                  {pdl.current_live_status === "Released" ? (
                    <button 
                      className="btn-recommit" 
                      onClick={() => navigate(`/add?recommitId=${pdl.pdl_id}`)}
                    >
                      <RotateCcw size={16} /> Recommit PDL
                    </button>
                    
                  ) : (
                    <div className="recommit-disabled-msg">
                      <strong><Lock size={14} /> Recommitment Disabled</strong>
                      <span> Subject is currently {pdl.current_live_status}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ⚖️ SUBSIDIARY PENALTY BOX */}
         
          </div>

          {/* 3. ANALYTICS CARD */}
          <div className="card analytics-card">
            <div className="analytics-header">
              <h3>
                <BarChart3 size={20} className="header-icon" />
                {pdl.pdl_status === "Released" ? "Final Release Summary" : 
                 pdl.pdl_status === "Sentenced" ? "Predictive Release Analytics" : "Judicial Time Ledger"}
              </h3>
              <span className={`status-pill ${pdl.pdl_status?.toLowerCase()}`}>
                {pdl.pdl_status}
              </span>
            </div>
            
            <div className="analytics-body">
              {/* ⚖️ SECTION: COURT SENTENCE */}
              {(pdl.pdl_status === "Sentenced" || pdl.pdl_status === "Released") && (
                <div className="sentence-breakdown">
                  <p className="sub-heading"><FileText size={14} /> {pdl.pdl_status === "Released" ? "Served Sentence Duration" : "Court-Mandated Sentence"}</p>
                  <div className="duration-grid">
                    <div className="d-box"><strong>{pdl.sentence_years || 0}</strong><span>Years</span></div>
                    <div className="d-box"><strong>{pdl.sentence_months || 0}</strong><span>Months</span></div>
                    <div className="d-box"><strong>{pdl.sentence_days || 0}</strong><span>Days</span></div>
                  </div>
                </div>
              )}

              {/* 📈 SECTION: TIME ALLOWANCE LEDGER */}
               <div className="timeline-card-box">
                  <div className="timeline-row">
                    <p><Calendar size={14} /> Admission Date (BJMP)</p>
                    <strong>{pdl.date_admitted_bjmp ? new Date(pdl.date_admitted_bjmp).toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' }) : "---"}</strong>
                  </div>
                  <div className="timeline-row">
                    <p><History size={14} /> Committal Date (PNP)</p>
                    <strong>{pdl.date_commited_pnp ? new Date(pdl.date_commited_pnp).toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' }) : "---"}</strong>
                  </div>
                </div>
              <div className="allowance-ledger">
                
                <h4><Hourglass size={14} /> Time Allowance Credits</h4>
                <div className="ledger-grid">
                  {pdl.pdl_status === "Released" ? (
                    <div className="ledger-total archived-total">
                      <div className="ledger-info">
                        <strong>Final Credit Summary</strong>
                        <span>Total time allowance applied at discharge</span>
                      </div>
                      <div className="ledger-value positive">-{pdl.total_credits_applied || 0} Days</div>
                    </div>
                  ) : (
                    <>
                      <div className="ledger-item">
                        <div className="ledger-info"><strong>GCTA</strong><span>Good Conduct</span></div>
                        <div className="ledger-value positive">
                          {pdl.gcta_history?.reduce((acc, log) => log.status === 'Active' ? acc + (parseInt(log.days_earned) || 0) : acc, 0) || ""} Days
                        </div>
                      </div>
                      <div className="ledger-item">
                        <div className="ledger-info"><strong>TASTM</strong><span>Study & Teaching</span></div>
                        <div className="ledger-value positive">
                          {pdl.tastm_history?.reduce((acc, log) => (log.status === 'Active' || log.status === 'Inactive') ? acc + (parseInt(log.days_earned) || 0) : acc, 0) || ""} Days
                        </div>
                      </div>
                      <div className="ledger-total">
                        <span>Total Days Deducted:</span>
                        <strong className="text-primary"><TrendingDown size={18} /> {pdl.total_timeallowance_earned || ""} Days</strong>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* 🎯 PREDICTION RESULTS */}
              <div className="prediction-results">
               

                {pdl.pdl_status === "Released" ? (
                  <div className="release-highlight success-theme">
    <p>Actual Date of Release</p>
    
    <h2 className="release-text">
      <CheckCircle2 size={32} /> 
      {pdl.actual_release_date 
        ? new Date(pdl.actual_release_date).toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' }) 
        : "Archive Recorded"}
    </h2>

    {pdl.date_admitted_bjmp && pdl.actual_release_date && (
      <div className="stay-duration">
        <span>Total Stay: </span>
        <strong>{Math.ceil((new Date(pdl.actual_release_date) - new Date(pdl.date_admitted_bjmp)) / (1000 * 60 * 60 * 24))} Days</strong>
      </div>
    )}

    {/* 🎯 Success Banner to match the others */}
    <div className="status-banner success-banner" style={{ marginTop: '15px' }}>
       <ShieldCheck size={18} /> Legally Discharged
    </div>

    <span className="algo-tag">Status: Final Discharge Confirmed</span>
  </div>
                ) : pdl.pdl_status === "Sentenced" && (pdl.sentence_years > 0 || pdl.sentence_months > 0 || pdl.sentence_days > 0) && pdl.date_commited_pnp ? (
                  
                 <div className="main-card-release">
  {/* ⚖️ LEFT CARD: SUBSIDIARY PENALTY */}
  {pdl.subsidiary && (() => {
    const fine = Number(pdl.subsidiary.total_fine_amount) || 0;
    const paid = Number(pdl.subsidiary.amount_paid) || 0;
    const rate = Number(pdl.subsidiary.daily_rate) || 0;
    const cap = pdl.subsidiary.max_subsidiary_days || 0;
    const balance = fine - paid;
    const addedDays = rate > 0 ? Math.min(Math.floor(balance / rate), cap) : 0;

    return (
      <div className="release-highlight subsidiary-red-theme">
        <p className="card-sub-label">Subsidiary Imprisonment</p>
        <h2 className="release-text">
          <Clock size={28} className="text-red-icon" /> +{addedDays} Days
        </h2>
        
        <div className="judgment-info">
          <span className="judgment-label"><Banknote size={14} /> Unpaid Balance: </span>
          <span className="judgment-value">₱{balance.toLocaleString()}</span>
        </div>

        <div className="status-banner danger-banner">
          <AlertTriangle size={18} /> Extension of Sentence
        </div>
        
        <span className="algo-tag">Legal Basis: Art. 39 Revised Penal Code</span>
      </div>
    );
  })()}

  {/* 📈 RIGHT CARD: PROJECTED RELEASE DATE */}
  <div className="release-highlight primary-theme">
    <p className="card-sub-label">Projected Release Date</p>
    <h2 className="release-text">
      <CalendarDays size={28} className="text-blue-icon" />
      {pdl.expected_releasedate ? new Date(pdl.expected_releasedate).toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' }) : "Calculating..."}
    </h2>
    
    <div className="judgment-info">
      <span className="judgment-label"><Scale size={14} /> Final Judgment: </span>
      <span className="judgment-value">{pdl.date_of_final_judgment ? new Date(pdl.date_of_final_judgment).toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' }) : "Pending"}</span>
    </div>

    <div className={`status-banner ${pdl.is_legally_disqualified ? 'danger-banner' : 'success-banner'}`}>
      {pdl.is_legally_disqualified ? <><AlertTriangle size={18} /> Disqualified (RA 10592)</> : <><CheckCircle2 size={18} /> Qualified Offender</>}
    </div>
    
    <span className="algo-tag">Method: Automated Sentence Analytics (TCIS)</span>
  </div>
</div>
                  
                  
                ) : (
                  <div className="detained-notice pending-docs">
                    <div className="notice-icon"><Hourglass size={32} /></div>
                    <div className="notice-text">
                      <p>{pdl.pdl_status === "Sentenced" ? "Sentenced: Awaiting Docs" : "Pre-Trial Status"}</p>
                      <span>{pdl.pdl_status === "Sentenced" ? "Awaiting mandated duration." : "Trial ongoing. Credits accumulating."}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 4. HISTORY LEDGER */}
          <div className="card history-card full-width">
            <div className="history-header">
              <h3><History size={20} /> Time Allowance History Ledger</h3>
              <p>Detailed month-by-month credit accumulation</p>
            </div>

            <div className="history-tables-wrapper">
              <div className="history-section">
                <h4><ClipboardList size={16} /> Good Conduct (GCTA)</h4>
                <div className="table-container">
                  <table>
                    <thead><tr><th>Month/Year</th><th>Days Earned</th><th>Status</th></tr></thead>
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

              <div className="history-section">
                <h4><ClipboardList size={16} /> Study & Mentoring (TASTM)</h4>
                <div className="table-container">
                  <table>
                    <thead><tr><th>Month/Year</th><th>Hours</th><th>Days Earned</th><th>Status</th></tr></thead>
                    <tbody>
                      {pdl.tastm_history?.length > 0 ? pdl.tastm_history.map((log) => (
                        <tr key={log.tastm_log_id}>
                          <td>{new Date(log.month_year).toLocaleDateString('en-PH', { month: 'short', year: 'numeric' })}</td>
                          <td><strong>{log.total_hours_accumulated} hrs</strong></td>
                          <td className="text-positive">+{log.days_earned} Days</td>
                          <td className="text-positive">{log.remarks}</td>
                        </tr>
                      )) : <tr><td colSpan="4" className="empty-msg">No TASTM logs found.</td></tr>}
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