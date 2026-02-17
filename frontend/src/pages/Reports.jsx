import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../apiConfig";
import "./reports.css";

const Reports = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // 🔍 Filter & Search State
  const [searchTerm, setSearchTerm] = useState("");
  const [reportType, setReportType] = useState("conduct"); 
  const [statusFilter, setStatusFilter] = useState("all");

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 15;

  useEffect(() => {
    fetchReportData();
  }, []);

  // Sync filtered data whenever search, filters, or source data changes
  useEffect(() => {
  let results = summary;

  // 🕵️‍♂️ DEBUG: Check datatypes here if filtering fails
  if (summary.length > 0) {
    console.log("Filter Debug - is_locked_for_gcta Type:", typeof summary[0].is_locked_for_gcta);
    console.log("Filter Debug - Value:", summary[0].is_locked_for_gcta);
  }

  if (searchTerm) {
    const lowerSearch = searchTerm.toLowerCase();
    results = results.filter(p => 
      p.last_name.toLowerCase().includes(lowerSearch) ||
      p.first_name.toLowerCase().includes(lowerSearch) ||
      p.pdl_id.toString().includes(searchTerm)
    );
  }

  // 🎯 THE FILTER LOGIC
  if (statusFilter === "locked") {
    // We check for true (boolean) OR "true" (string) just in case
    results = results.filter(p => p.is_locked_for_gcta === true || p.is_locked_for_gcta === "true");
  } else if (statusFilter === "good") {
    results = results.filter(p => p.is_locked_for_gcta === false || p.is_locked_for_gcta === "false");
  }

  setFilteredData(results);
  setCurrentPage(1);
}, [searchTerm, statusFilter, summary]);

  

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      const response = await fetch(`${API_BASE_URL}/api/reports/summary`, { headers });
      setSummary(await response.json());
    } catch (err) { 
      console.error(err); 
    } finally { 
      setLoading(false); 
    }
  };

  const currentRows = filteredData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  if (loading) return <div className="rpt-loading">🔄 Indexing {summary.length} PDL Records...</div>;

  return (
    <div className="rpt-main-scope">
      <div className="rpt-content-wrapper">
        
        <div className="rpt-simple-header">
          <div className="rpt-header-left">
            <h1 className="rpt-h1">📊 Reports & Analytics</h1>
            <p className="rpt-p-sub">Track program attendance and monthly credit eligibility.</p>
          </div>
          <div className="rpt-header-right rpt-hide-print">
            <button className="rpt-btn-print" onClick={() => window.print()}>🖨️ Export PDF</button>
          </div>
        </div>
        
        <div className="rpt-control-panel rpt-hide-print">
          <div className="rpt-input-group">
            <label>Select Report Type</label>
            <select className="rpt-select" value={reportType} onChange={(e) => setReportType(e.target.value)}>
              <option value="tastm">TASTM Ledger</option>
              <option value="conduct">GCTA Review</option>
            </select>
          </div>

          <div className="rpt-input-group">
            <label>Search PDL</label>
            <input 
              type="text" 
              placeholder="Search Name or ID..." 
              className="rpt-search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="rpt-input-group">
            <label>Eligibility Filter</label>
            <select className="rpt-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All Records</option>
              <option value="good">Good Standing / Eligible</option>
              <option value="locked">Locked / Disqualified</option>
            </select>
          </div>
        </div>

        <div className="rpt-table-container shadow-sm">
          <div className="rpt-table-header">
            <h3 className="rpt-h3">
              {reportType === 'conduct' ? 'GCTA Conduct Eligibility Ledger' : 'TASTM Labor Participation Ledger'}
            </h3>
            <span className="rpt-count">Showing {filteredData.length} entries</span>
          </div>

          <table className="rpt-table">
            <thead>
              <tr>
                <th>PDL Identity</th>
                <th>Meycauayan ID</th>
                {reportType === 'conduct' ? (
                  <>
                    <th>Conduct Status</th>
                    <th>Banked GCTA Days</th>
                  </>
                ) : (
                  <>
                    <th>Work Progress (60h)</th>
                    <th>Banked TASTM Days</th>
                  </>
                )}
                <th className="rpt-hide-print">Action</th>
              </tr>
            </thead>
            <tbody>
              {currentRows.map((pdl) => (
                <tr key={pdl.pdl_id}>
                    <td>
                    <strong className="text-slate-900">{pdl.last_name}, {pdl.first_name}</strong>
                    <br /><small className="text-slate-500">ID: #{pdl.pdl_id}</small>
                    </td>
                    <td><span className="rpt-id-badge">#{pdl.pdl_id}</span></td>
                    
                    {/* 🔄 CONDITIONAL RENDERING BASED ON DROPDOWN */}
                    {reportType === 'conduct' ? (
                    <>
                        {/* --- GCTA VIEW --- */}
                        <td>
                        <span className={pdl.is_locked_for_gcta ? "rpt-badge rpt-badge-red" : "rpt-badge rpt-badge-green"}>
                            {pdl.is_locked_for_gcta ? "🚫 LOCKED" : "✔️ GOOD STANDING"}
                        </span>
                        {pdl.incident_count > 0 && (
                            <span className="rpt-block text-red-500">{pdl.incident_count} Total Incidents</span>
                        )}
                        </td>
                        <td>
                        <div className="rpt-banked-info">
                            <strong className="text-purple-700">+{pdl.total_gcta_days} Days</strong>
                            <p className="rpt-text-small">Cumulative GCTA</p>
                        </div>
                        </td>
                    </>
                    ) : (
                    <>
                        {/* --- TASTM VIEW --- */}
                        <td>
                        <div className="rpt-tastm-info">
                            <span className="text-emerald-700 font-bold">{pdl.running_balance_hours} / 60 hrs</span>
                            <div className="rpt-mini-progress">
                            <div 
                                className="rpt-bar" 
                                style={{ width: `${Math.min((pdl.running_balance_hours / 60) * 100, 100)}%` }}
                            ></div>
                            </div>
                        </div>
                        </td>
                        <td>
                        <div className="rpt-banked-info">
                            <strong className="text-blue-700">+{pdl.total_tastm_days} Days</strong>
                            <p className="rpt-text-small">Cumulative TASTM</p>
                        </div>
                        </td>
                    </>
                    )}

                    <td className="rpt-hide-print">
                    <button className="rpt-btn-view" onClick={() => navigate(`/profile/${pdl.pdl_id}`)}>View</button>
                    </td>
                </tr>
                ))}
            </tbody>
          </table>

          <div className="rpt-pagination rpt-hide-print">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="rpt-page-btn">Back</button>
            <span className="rpt-page-info">Page {currentPage} of {totalPages || 1}</span>
            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="rpt-page-btn">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;