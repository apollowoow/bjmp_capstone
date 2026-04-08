import React, { useState } from "react";
import API_BASE_URL from "../apiConfig";
import "./incidents.css";
import { 
  ShieldAlert, Search, User, Lock, CheckCircle2, 
  Gavel, Calendar, History, Save, XCircle, 
  AlertTriangle, Info, Clock, UserCheck, RefreshCw
} from "lucide-react";

const Incidents = () => {

  const [pdlList, setPdlList] = useState([]); // 🎯 Store the array of results
const [selectedPdl, setSelectedPdl] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [pdl, setPdl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false); // 🎯 Modal state
  const [status, setStatus] = useState({ msg: "", isError: false });

  const [form, setForm] = useState({
    category: "Less Serious",
    incident_date: new Date().toISOString().split('T')[0],
    remarks: ""
  });
 const DEFAULT_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23cbd5e1'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z'/%3E%3C/svg%3E";

  // 🛠️ Calculate End Date Logic
  const calculateEndDate = (startDate, category) => {
    if (!startDate) return "";
    const date = new Date(startDate);
    if (category === "Less Serious") date.setMonth(date.getMonth() + 3);
    else if (category === "Serious") date.setMonth(date.getMonth() + 6);
    else if (category === "Grave") date.setFullYear(date.getFullYear() + 1);
    return date.toISOString().split('T')[0];
  };

  // 🔍 1. Robust Search Logic
const handleSearch = async () => {
  if (!searchTerm.trim()) return;
  setLoading(true);
  setSelectedPdl(null); 
  setStatus({ msg: "", isError: false });

  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}/api/pdl/getall`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (response.ok) {
      const data = await response.json(); // 🎯 Tawagin nating 'data' muna para safe
      
      console.log("Full Backend Response:", data); // I-check mo 'to sa console!

      // 🛡️ THE SAFETY NET:
      // Chine-check natin: Array ba 'yung 'data'? 
      // Kung hindi, baka nasa 'data.rows' siya. Kung wala pa rin, blangkong array.
      const pdlArray = Array.isArray(data) ? data : (data.rows || []);

      const results = pdlArray.filter(p => 
        (p.pdl_id && p.pdl_id.toString() === searchTerm.trim()) || 
        (p.last_name && p.last_name.toLowerCase().includes(searchTerm.toLowerCase().trim())) ||
        (p.rfid_number && p.rfid_number === searchTerm.trim())
      );

      if (results.length > 0) {
        setPdlList(results); 
        setStatus({ msg: `${results.length} PDL(s) identified.`, isError: false });
      } else {
        setPdlList([]);
        setStatus({ msg: "PDL not found in database.", isError: true });
      }
    }
  } catch (err) {
    console.error("Search Error:", err);
    setStatus({ msg: "Network error. Check IP address.", isError: true });
  } finally {
    setLoading(false);
  }
};

// ✍️ 2. Updated Save Logic (Using selectedPdl)
const handleFinalSave = async () => {
  if (!selectedPdl) return; // Guard clause
  setShowModal(false);
  setLoading(true);
  const calculatedEnd = calculateEndDate(form.incident_date, form.category);

  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}/api/incidents/record`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify({ 
        pdl_id: selectedPdl.pdl_id, // 🎯 Gamitin ang selectedPdl
        category: form.category,
        incident_date: form.incident_date,
        penalty_end_date: calculatedEnd,
        remarks: form.remarks 
      })
    });

    if (response.ok) {
      // Success logic...
      setStatus({ msg: "GCTA LOCKED SUCCESSFULLY", isError: false });
      setTimeout(() => {
        setSelectedPdl(null);
        setPdlList([]);
        setSearchTerm("");
      }, 3000);
    }
  } catch (err) {
    console.error(err);
    setStatus({ msg: "Failed to sync.", isError: true });
  } finally {
    setLoading(false);
  }
};

 return (
  <div className="inc-main-scope">
    <div className="inc-content-wrapper">
      {/* 1. PAGE HEADER */}
      <header className="inc-page-header">
        <h1 className="inc-h1">
          <ShieldAlert size={32} className="inc-header-icon" /> 
          Disciplinary Board Encoding
        </h1>
        <p className="inc-p">Bulacan MCJ Judicial Ledger - Disciplinary Action Module</p>
      </header>

      <div className="inc-card-grid">
        {/* 2. SEARCH CARD (LEFT) */}
        <div className="inc-card shadow-sm">
          <h3 className="inc-card-title"><Search size={14} /> 1. Identify PDL</h3>
  <div className="inc-search-box">
    <div className="inc-input-wrapper">
      <Search size={18} className="inc-search-icon-inner" />
      <input 
        type="text" 
        placeholder="ID, Last Name, or RFID..." 
        value={searchTerm} 
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
      />
    </div>
    <button onClick={handleSearch} className="inc-btn-search">Search</button>
  </div>

          {pdlList.length > 0 && (
    <div className="inc-results-list">
      {pdlList.map((item) => (
        <div 
          key={item.pdl_id} 
          className={`inc-pdl-info-card selectable ${selectedPdl?.pdl_id === item.pdl_id ? 'active-selection' : ''}`}
          onClick={() => setSelectedPdl(item)}
        >
          <div className="inc-avatar-container">
            <img src={item.pdl_picture || DEFAULT_AVATAR} alt="pdl" />
            {selectedPdl?.pdl_id === item.pdl_id && (
              <div className="inc-selection-badge"><CheckCircle2 size={14} /></div>
            )}
          </div>
          <div className="inc-details">
            <strong>{item.last_name}, {item.first_name}</strong>
            <p className="inc-sub-text">ID: #{item.pdl_id}</p>
            <span className={(item.is_locked_for_gcta === true || item.is_locked_for_gcta === 't') ? "inc-status locked" : "inc-status good"}>
               {(item.is_locked_for_gcta === true || item.is_locked_for_gcta === 't') ? "LOCKED" : "GOOD"}
            </span>
          </div>
        </div>
      ))}
    </div>
  )}
          
          {status.msg && <p className={status.isError ? "inc-msg error" : "inc-msg success"}>{status.msg}</p>}
        </div>

        {/* 3. FORM CARD (RIGHT) */}
        <div className="inc-card shadow-sm">
          <h3 className="inc-card-title"><Gavel size={14} /> 2. Board Decision Details</h3>
          <form onSubmit={(e) => { e.preventDefault(); setShowModal(true); }} className="inc-form">
            <div className="inc-form-group">
              <label>Offense Category</label>
              <select value={form.category} onChange={(e) => setForm({...form, category: e.target.value})}>
                <option value="Less Serious">Less Serious Offense (3 Months)</option>
                <option value="Serious">Serious Offense (6 Months)</option>
                <option value="Grave">Grave Offense (12 Months)</option>
              </select>
            </div>

            <div className="inc-form-row">
              <div className="inc-form-group">
                <label>Penalty Start Date</label>
                <div className="inc-relative-input">
                  <Calendar size={18} className="inc-field-icon" />
                  <input 
                    type="date" 
                    value={form.incident_date} 
                    onChange={(e) => setForm({...form, incident_date: e.target.value})} 
                  />
                </div>
              </div>
              <div className="inc-form-group">
                <label>Penalty End Date (Automated)</label>
                <div className="inc-calculated-date">
                  <strong><Clock size={16} /> {calculateEndDate(form.incident_date, form.category)}</strong>
                  <span className="rpt-text-small">Based on RA 10592 IRR</span>
                </div>
              </div>
            </div>

            <div className="inc-form-group">
              <label>Board Resolution Remarks</label>
              <textarea 
                placeholder="Enter specific resolution details or board order number..." 
                value={form.remarks} 
                onChange={(e) => setForm({...form, remarks: e.target.value})} 
                required
              ></textarea>
            </div>

            <button type="submit" className="inc-btn-submit" disabled={!selectedPdl || loading}>
  {loading ? <RefreshCw className="inc-spin" size={18} /> : <><Lock size={18} /> Confirm & Lock GCTA</>}
</button>
          </form>
        </div>
      </div>
    </div>

    {/* 🛑 YES/NO CONFIRMATION MODAL */}
   {showModal && selectedPdl && ( // 🎯 Dagdag guard: Dapat may selectedPdl bago magpakita
  <div className="inc-modal-overlay">
    <div className="inc-modal-content">
      <div className="inc-modal-header">
        <ShieldAlert size={48} color="#ef4444" style={{ marginBottom: '15px' }} />
        <h2>Confirm GCTA Lock?</h2>
      </div>
      <div className="inc-modal-body">
        <p>This action will <strong>Disqualify</strong> the PDL from earning GCTA credits until the penalty end date is reached.</p>
        
        <div className="inc-confirm-box">
          {/* 🎯 Ginamit natin ang selectedPdl at ?. (Optional Chaining) */}
          <p>
            <User size={14} /> 
            <strong>PDL:</strong> {selectedPdl?.last_name}, {selectedPdl?.first_name}
          </p>
          <p>
            <AlertTriangle size={14} /> 
            <strong>Category:</strong> {form.category}
          </p>
          <p>
            <History size={14} /> 
            <strong>Expires:</strong> {calculateEndDate(form.incident_date, form.category)}
          </p>
        </div>
      </div>

      <div className="inc-modal-footer">
        <button className="inc-btn-no" onClick={() => setShowModal(false)}>Cancel</button>
        <button className="inc-btn-yes" onClick={handleFinalSave}>
          <Save size={18} /> Authorize & Lock
        </button>
      </div>
    </div>
  </div>
)}
  </div>
);
};

export default Incidents;