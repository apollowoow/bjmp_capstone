import React, { useEffect, useState } from "react";
import { 
  History, Search, RotateCcw, Eye, 
  Calendar, ShieldAlert, ChevronLeft, ChevronRight,
  User, Activity, Info
} from "lucide-react";
import API_BASE_URL from "../apiConfig";
import "./audit.css";

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // 🔍 Filtering & Pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 12;
const [availableActions, setAvailableActions] = useState([]);
  // 🎯 Detail Modal State
  const [selectedLog, setSelectedLog] = useState(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/users/audit`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Audit Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogs(); }, []);

  useEffect(() => {
    const fetchActions = async () => {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE_URL}/api/users/audit-actions`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setAvailableActions(data);
    };
    fetchActions();
}, []);
  
const formatActionLabel = (text) => {
    if (!text) return "";
    const acronyms = ["MSEC", "GCTA", "TASTM", "PDL", "RFID", "PNP", "BJMP"];
    return text.split('_').map(word => {
        if (acronyms.includes(word.toUpperCase())) return word.toUpperCase();
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }).join(' ');
};
const categorizeActions = (actions) => {
    const groups = {
        "User Management": ["USER_LOGIN", "CREATE_USER", "UPDATE_USER_STATUS", "ADMIN_RESET_PASSWORD"],
        "PDL & Judicial": ["CREATE_PDL", "RECOMMIT_PDL", "RELEASE_PDL", "UPDATE_JUDICIAL_RECORD", "UPDATE_PERSONAL_INFO"],
        "Attendance & Sessions": ["START_PROGRAM_SESSION", "CANCEL_PROGRAM_SESSION", "FINALIZE_PROGRAM_SESSION", "UPDATE_ATTENDANCE_HOURS", "REMOVE_ATTENDEE", "RELOAD_DISCARD_SESSION"],
        "MSEC & Credits": ["MSEC_VOID_CREDITS", "MSEC_RESTORE_CREDITS", "RECORD_DISCIPLINARY_INCIDENT", "SYSTEM_GCTA_SYNC", "SYSTEM_TASTM_SYNC"],
        "Fines & Reports": ["CREATE_SUBSIDIARY", "UPDATE_SUBSIDIARY", "GENERATE_REPORT"]
    };

    const groupedData = {};

    // Initialize groups in the object
    Object.keys(groups).forEach(g => groupedData[g] = []);

    // Push actions to their respective groups
    actions.forEach(act => {
        let found = false;
        for (const [groupName, actionList] of Object.entries(groups)) {
            if (actionList.includes(act)) {
                groupedData[groupName].push(act);
                found = true;
                break;
            }
        }
        // Fallback for uncategorized actions
        if (!found) {
            if (!groupedData["Others"]) groupedData["Others"] = [];
            groupedData["Others"].push(act);
        }
    });

    return groupedData;
};
  // 🎨 Action Badge Color Logic
  const getActionClass = (action) => {
    const act = action.toUpperCase();
    if (act.includes("VOID") || act.includes("SUSPEND") || act.includes("DELETE")) return "al-badge-red";
    if (act.includes("UPDATE") || act.includes("EDIT") || act.includes("RESET")) return "al-badge-yellow";
    if (act.includes("SYNC") || act.includes("GENERATE") || act.includes("CREATE")) return "al-badge-blue";
    if (act.includes("LOGIN")) return "al-badge-green";
    return "al-badge-gray";
  };

  // 🎯 Filter Logic
  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.operator_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.table_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAction = actionFilter === "all" || log.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  // 📄 Pagination Logic
  const totalPages = Math.ceil(filteredLogs.length / rowsPerPage);
  const currentRows = filteredLogs.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  useEffect(() => { setCurrentPage(1); }, [searchTerm, actionFilter]);

  if (loading) return <div className="al-loader">🔒 Accessing Secure Audit Registry...</div>;

  return (
    <div className="al-container">
      <div className="al-header">
        <div className="al-title-area">
          <h1><History size={28} color="#1e293b" /> System Audit Trail</h1>
          <p>Official chronological record of system modifications and administrative actions.</p>
        </div>
        <button className="al-refresh-btn" onClick={fetchLogs}>
          <RotateCcw size={16} /> Refresh Logs
        </button>
      </div>

      {/* 🔍 FILTER BAR */}
      <div className="al-filter-bar">
        <div className="al-search-box">
          <Search size={18} className="al-search-icon" />
          <input 
            type="text" 
            placeholder="Search by operator, action, or table..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select 
    className="al-select" 
    value={actionFilter} 
    onChange={(e) => setActionFilter(e.target.value)}
>
    <option value="all">All Action Types</option>
    
    {Object.entries(categorizeActions(availableActions)).map(([groupName, actions]) => (
        // Only show group if it has actions
        actions.length > 0 && (
            <optgroup key={groupName} label={groupName}>
                {actions.map(act => (
                    <option key={act} value={act}>
                        {formatActionLabel(act)}
                    </option>
                ))}
            </optgroup>
        )
    ))}
</select>
      </div>

      {/* 🗂️ LOG TABLE */}
      <div className="al-table-wrapper">
        <table className="al-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Operator</th>
              <th>Action</th>
           
              <th>IP Address</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {currentRows.length > 0 ? (
              currentRows.map((log) => (
                <tr key={log.logid}>
                  <td className="al-td-time">
                    <Calendar size={12} /> {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td>
                    <div className="al-operator">
                       <User size={14} /> <strong>{log.operator_name || "System"}</strong>
                    </div>
                  </td>
                  <td><span className={`al-badge ${getActionClass(log.action)}`}>{log.action}</span></td>
          
                  <td><small className="al-ip">{log.ip_address}</small></td>
                  <td>
                    <button className="al-btn-view" onClick={() => setSelectedLog(log)}>
                      <Eye size={14} /> View
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="6" className="al-empty">No logs found matching your criteria.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 📄 PAGINATION */}
      <div className="al-pagination">
        <button className="al-page-btn" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>
          <ChevronLeft size={16} /> Prev
        </button>
        <span className="al-page-info">Page {currentPage} of {totalPages || 1}</span>
        <button className="al-page-btn" disabled={currentPage >= totalPages} onClick={() => setCurrentPage(p => p + 1)}>
          Next <ChevronRight size={16} />
        </button>
      </div>

      {/* 🎯 ADAPTIVE COMPARISON MODAL */}
      {selectedLog && (
        <div className="al-modal-overlay">
          <div className="al-modal-content">
            <div className="al-modal-header">
              <h3><ShieldAlert size={20} /> Entry Metadata</h3>
              <button className="al-close-x" onClick={() => setSelectedLog(null)}>&times;</button>
            </div>
            
<div className="al-modal-body">
  {/* 1. MAIN SUMMARY HEADER */}
  <div className="al-summary-header">
    <ShieldAlert size={18} color="#1e40af" />
    <p>{selectedLog.details.message || "System event captured."}</p>
  </div>

  {/* 🔄 2. THE CHANGE COMPARISON SECTION (Before vs After) */}
  {(() => {
    const d = selectedLog.details;
    const oldVal = d.old_data || d.before || d.previous;
    const newVal = d.new_data || d.after || d.current;

    if (oldVal && newVal) {
      return (
        <div className="al-human-compare">
          <div className="al-change-card al-border-red">
            <span className="al-card-label">PREVIOUS STATE</span>
            <div className="al-card-content">
              {Object.entries(oldVal).map(([k, v]) => (
                <div key={k} className="al-human-row">
                  <span className="al-human-key">{k.replace(/_/g, ' ')}:</span>
                  <span className="al-human-val">{String(v)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="al-change-arrow">
            <ChevronRight size={24} />
          </div>

          <div className="al-change-card al-border-green">
            <span className="al-card-label">UPDATED STATE</span>
            <div className="al-card-content">
              {Object.entries(newVal).map(([k, v]) => (
                <div key={k} className="al-human-row">
                  <span className="al-human-key">{k.replace(/_/g, ' ')}:</span>
                  <span className="al-human-val">{String(v)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }
    return null;
  })()}

  {/* 📝 3. ADDITIONAL METADATA GRID (Session Data, IDs, etc.) */}
  <div className="al-details-grid" style={{ marginTop: '20px' }}>
    {Object.entries(selectedLog.details).map(([key, value]) => {
      // 🛡️ SKIP ALREADY HANDLED KEYS
      const skipKeys = ['message', 'old_data', 'new_data', 'before', 'after', 'previous', 'current'];
      if (skipKeys.includes(key)) return null;

      // 🔄 NESTED OBJECT HANDLER (like session_data)
      if (typeof value === 'object' && value !== null) {
        return (
          <div key={key} className="al-detail-group full-width">
            <h4 className="al-group-title">{key.replace(/_/g, ' ').toUpperCase()}</h4>
            <div className="al-sub-grid">
              {Object.entries(value).map(([subKey, subValue]) => (
                <div key={subKey} className="al-detail-item">
                  <span className="al-label">{subKey.replace(/_/g, ' ')}:</span>
                  <span className="al-value">{String(subValue)}</span>
                </div>
              ))}
            </div>
          </div>
        );
      }

      // 📝 STANDARD KEY-VALUE
      return (
        <div key={key} className="al-detail-item">
          <span className="al-label">{key.replace(/_/g, ' ')}:</span>
          <span className="al-value">{String(value)}</span>
        </div>
      );
    })}
  </div>
</div>
            
            <div className="al-modal-footer">
              <button className="al-btn-close" onClick={() => setSelectedLog(null)}>Close Registry Entry</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogs;