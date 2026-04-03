import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../apiConfig";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; 
import "./reports.css";

const Reports = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState("");
  // 🎯 Updated Report Types: conduct, tastm, or release
  const [reportType, setReportType] = useState("conduct"); 
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 15;

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/reports/summary?month=${selectedMonth}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      
      // Console Log for debugging as requested earlier
      console.log(`[REPORTS] Received ${data.length} records for ${selectedMonth}`);
      
      setSummary(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchReportData(); }, [selectedMonth]);

 useEffect(() => {
    let results = summary;

    // 1. Handle Search
    if (searchTerm) {
      const low = searchTerm.toLowerCase();
      results = results.filter(p => 
        p.last_name.toLowerCase().includes(low) || 
        p.pdl_id.toString().includes(searchTerm)
      );
    }

    // 2. Handle Report Mode
    if (reportType === "release") {
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const limit = new Date(); limit.setDate(today.getDate() + 45);

      results = results.filter(p => {
        if (!p.expected_releasedate) return false;
        const rd = new Date(p.expected_releasedate);
        rd.setHours(0, 0, 0, 0);
        return rd >= today && rd <= limit;
      });
    } else {
      // 📑 AUDIT STATUS LOGIC (GCTA/TASTM)
      if (statusFilter === "locked") {
        // 🎯 Show if ANY disqualifier is present
        results = results.filter(p => 
          p.is_locked_for_gcta === true || 
          String(p.is_locked_for_gcta) === "true" || 
          Number(p.voided_gcta) > 0 || 
          Number(p.voided_tastm) > 0
        );
      } else if (statusFilter === "good") {
        // 🎯 Show ONLY if all disqualifiers are zero/false
        results = results.filter(p => 
          (p.is_locked_for_gcta === false || String(p.is_locked_for_gcta) === "false" || p.is_locked_for_gcta === null) && 
          Number(p.voided_gcta) === 0 && 
          Number(p.voided_tastm) === 0
        );
      }
    }

    setFilteredData(results);
    setCurrentPage(1);
  }, [searchTerm, reportType, statusFilter, summary]);

  // 📄 DYNAMIC PDF EXPORT
const exportToPDF = () => {
  try {
    const isRelease = reportType === 'release';
    const doc = new jsPDF(isRelease ? 'l' : 'p'); 
    const centerX = isRelease ? 140 : 105; // Adjusts center based on orientation

    // 🎯 1. OFFICIAL BJMP LETTERHEAD
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("REPUBLIC OF THE PHILIPPINES", centerX, 15, { align: "center" });
    
    doc.setFont("helvetica", "bold");
    doc.text("BUREAU OF JAIL MANAGEMENT AND PENOLOGY", centerX, 20, { align: "center" });
    
    doc.setFont("helvetica", "normal");
    doc.text("Meycauayan City Jail, Bulacan", centerX, 25, { align: "center" });
    
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    const title = isRelease ? "PRIORITY DISCHARGE FORECAST" : `MONTHLY ${reportType.toUpperCase()} COMPLIANCE AUDIT`;
    doc.text(title, centerX, 35, { align: "center" });

    // 🎯 2. DYNAMIC COLUMNS (Added Total Allowance & Original Date)
    const tableColumn = isRelease 
      ? ["ID", "PDL Name", "Orig. Release", "Total Allowance", "Expected Release"]
      : ["ID", "PDL Name", "Status", "Date Granted", reportType === 'conduct' ? "GCTA" : "TASTM", "Remarks"];
    
    const tableRows = filteredData.map(p => {
      if (isRelease) {
        return [
          `#${p.pdl_id}`,
          `${p.last_name}, ${p.first_name}`,
          p.original_release_date ? new Date(p.original_release_date).toLocaleDateString() : 'N/A',
          `${p.total_timeallowance_earned || 0} Days`,
          p.expected_releasedate ? new Date(p.expected_releasedate).toLocaleDateString() : 'N/A'
        ];
      } else {
        const isDqd = p.is_locked_for_gcta || p.voided_gcta > 0 || p.voided_tastm > 0;
        return [
          `#${p.pdl_id}`,
          `${p.last_name}, ${p.first_name}`,
          isDqd ? "DQ" : "ELIGIBLE",
          selectedMonth,
          reportType === 'conduct' ? `+${p.active_gcta}` : `+${p.active_tastm}`,
          p.audit_remarks || "N/A"
        ];
      }
    });

    // 🎯 3. GENERATE TABLE
    autoTable(doc, {
      startY: 45,
      head: [tableColumn],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42], fontSize: isRelease ? 8 : 9 }, 
      styles: { fontSize: isRelease ? 8 : 9, cellPadding: 2 },
    });

    doc.save(`BJMP_${isRelease ? 'Discharge' : 'Audit'}_${selectedMonth}.pdf`);
  } catch (error) { 
    console.error("PDF Generation Error:", error);
    alert("Error generating PDF. Check console."); 
  }
};

  // 📊 DYNAMIC CSV EXPORT
const exportToCSV = () => {
  const isRelease = reportType === 'release';
  const isGcta = reportType === 'conduct';

  // 🏛️ 1. OFFICIAL BJMP HEADER LOGIC
  const reportTitle = isRelease 
    ? "PRIORITY DISCHARGE FORECAST" 
    : `MONTHLY ${reportType.toUpperCase()} COMPLIANCE AUDIT`;

  // We create an array of arrays for the header section
  const officialHeader = [
    ["REPUBLIC OF THE PHILIPPINES", "", "", "", "", ""],
    ["BUREAU OF JAIL MANAGEMENT AND PENOLOGY", "", "", "", "", ""],
    ["Meycauayan City Jail, Bulacan", "", "", "", "", ""],
    [reportTitle, "", "", "", "", ""],
    [`Report Period: ${selectedMonth}`, "", "", "", "", ""],
    [`Generated: ${new Date().toLocaleString()}`, "", "", "", "", ""],
    ["", "", "", "", "", ""] // Spacer row
  ];

  // 📝 2. DYNAMIC COLUMN HEADERS
  const tableHeaders = isRelease 
    ? ["PDL_ID", "Full_Name", "PNP_Committal", "Original_Release", "Total_Allowance", "Expected_Release"]
    : ["PDL_ID", "Full_Name", "Audit_Status", "Date_Granted", isGcta ? "GCTA_Days" : "TASTM_Days", "Remarks"];
  
  // 🗃️ 3. DATA MAPPING
  const rows = filteredData.map(p => {
    if (isRelease) {
      return [
        p.pdl_id,
        `"${p.last_name}, ${p.first_name}"`, // Quotes handle commas in names
        p.date_commited_pnp || "N/A",
        p.original_release_date || "N/A",
        `${p.total_timeallowance_earned || 0} Days`,
        p.expected_releasedate || "N/A"
      ];
    } else {
      const isDqd = p.is_locked_for_gcta || p.voided_gcta > 0 || p.voided_tastm > 0;
      return [
        p.pdl_id,
        `"${p.last_name}, ${p.first_name}"`,
        isDqd ? "Disqualified" : "Eligible",
        selectedMonth,
        isGcta ? p.active_gcta : p.active_tastm,
        `"${p.audit_remarks || 'No violations'}"`
      ];
    }
  });

  // 🧵 4. STITCHING IT ALL TOGETHER
  // We join each sub-array with a comma, then join the whole thing with newlines
  const csvString = [
    ...officialHeader,
    tableHeaders, 
    ...rows
  ].map(row => row.join(",")).join("\n");

  // 💾 5. TRIGGER DOWNLOAD
  const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `BJMP_${isRelease ? 'Release' : 'Audit'}_${selectedMonth}.csv`;
  link.click();
  
  console.log("✅ Official CSV Exported with BJMP Letterhead");
};

  const currentRows = filteredData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  if (loading) return <div className="rpt-loading">🔄 Fetching Records...</div>;

  return (
    <div className="rpt-main-scope">
      <div className="rpt-content-wrapper">
        <div className="rpt-simple-header rpt-hide-print">
          <div className="rpt-header-left">
            <h1 className="rpt-h1">📊 Reports & Analytics</h1>
            <p className="rpt-p-sub">Meycauayan City Jail Official Reporting System.</p>
          </div>
          <div className="rpt-export-actions">
              <button className="rpt-btn-csv" onClick={exportToCSV}>📊 Excel</button>
              <button className="rpt-btn-pdf" onClick={exportToPDF}>📄 PDF</button>
          </div>
        </div>
        
        <div className="rpt-control-panel rpt-hide-print">
          <div className="rpt-input-group">
            <label>Report Type</label>
            <select className="rpt-select" value={reportType} onChange={(e) => setReportType(e.target.value)}>
              <option value="conduct">GCTA Conduct Review</option>
              <option value="tastm">TASTM Labor Ledger</option>
              <option value="release">🌟 Near Release Forecast</option>
            </select>
          </div>

          <div className="rpt-input-group">
            <label>Month Period</label>
            <input type="month" className="rpt-select" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} />
          </div>

          <div className="rpt-input-group">
            <label>Search Registry</label>
            <input type="text" className="rpt-search" placeholder="Name or ID..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>

          <div className="rpt-input-group">
            <label>Audit Filter</label>
            {/* 🎯 Disable the Audit Filter if Release Forecast is selected */}
            <select 
              className="rpt-select" 
              value={statusFilter} 
              disabled={reportType === 'release'}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Records</option>
              <option value="good">Eligible Records</option>
              <option value="locked">Voided / Locked</option>
            </select>
          </div>
        </div>

        <div className="rpt-table-container">
          <div className="rpt-table-header">
            <h3 className="rpt-h3">
              {reportType === 'release' ? '🌟 Priority Discharge Forecast' : (reportType === 'conduct' ? 'GCTA Monthly Audit' : 'TASTM Monthly Audit')}
            </h3>
            <span className="rpt-count">{filteredData.length} entries found</span>
          </div>

          <table className="rpt-table">
           <thead>
              <tr>
                <th>PDL Identity</th>
                {/* 🎯 Header switches based on mode */}
                <th>{reportType === 'release' ? 'Release Timeline' : 'Status'}</th>
                <th>{reportType === 'release' ? 'Total Allowance' : 'Monthly Result'}</th>
                <th className="rpt-hide-print">Profile</th>
              </tr>
            </thead>
            <tbody>
              {currentRows.map((pdl) => {
  const isDqd = pdl.is_locked_for_gcta || Number(pdl.voided_gcta) > 0 || Number(pdl.voided_tastm) > 0;
  const isRelease = reportType === "release";

  return (
    <tr key={pdl.pdl_id} className={isRelease ? "rpt-row-priority" : ""}>
      {/* 1. PDL Identity */}
      <td>
        <strong>{pdl.last_name}, {pdl.first_name}</strong>
        <br /><small className="text-slate-500">ID: #{pdl.pdl_id}</small>
      </td>

      {/* 2. Status or Release Timeline */}
      <td>
        {isRelease ? (
          <div className="rpt-timeline">
            <small style={{ color: "#64748b", textDecoration: "line-through" }}>
              Orig: {pdl.original_release_date ? new Date(pdl.original_release_date).toLocaleDateString() : 'N/A'}
            </small>
            <br />
            <span className="rpt-release-date">
              📅 <strong>{new Date(pdl.expected_releasedate).toLocaleDateString()}</strong>
            </span>
          </div>
        ) : (
          <>
            <span className={isDqd ? "rpt-badge rpt-badge-red" : "rpt-badge rpt-badge-green"}>
              {isDqd ? "🚫 DQ" : "✔️ OK"}
            </span>
            {isDqd && (
              <div className="rpt-audit-note">
                <small><strong>Why:</strong> {pdl.is_locked_for_gcta ? "Disciplinary" : pdl.audit_remarks}</small>
              </div>
            )}
          </>
        )}
      </td>

      {/* 3. Monthly Result or Total Time Allowance */}
      <td>
        {isRelease ? (
          <div className="rpt-allowance-info">
            <strong style={{ color: "#059669" }}>{pdl.total_timeallowance_earned || 0} Total Days Saved</strong>
            <br /><small className="text-slate-400">{pdl.crime_name}</small>
          </div>
        ) : (
          <strong>+{reportType === 'conduct' ? pdl.active_gcta : pdl.active_tastm} Days</strong>
        )}
      </td>

      {/* 4. Action */}
      <td className="rpt-hide-print">
        <button className="rpt-btn-view" onClick={() => navigate(`/profile/${pdl.pdl_id}`)}>View</button>
      </td>
    </tr>
  );
})}
            </tbody>
          </table>

          <div className="rpt-pagination rpt-hide-print">
            <button 
              disabled={currentPage === 1} 
              onClick={() => setCurrentPage(p => p - 1)} 
              className="rpt-page-btn"
            >
              Prev
            </button>
            <span className="rpt-page-info">
              Page {currentPage} of {totalPages || 1}
            </span>
            <button 
              disabled={currentPage >= totalPages} 
              onClick={() => setCurrentPage(p => p + 1)} 
              className="rpt-page-btn"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;