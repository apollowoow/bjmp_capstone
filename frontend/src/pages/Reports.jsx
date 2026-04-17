import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../apiConfig";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; 
import "./reports.css";
import { 
  BarChart3, FileSpreadsheet, FileText, Calendar, 
  Search, Filter, Eye, ChevronLeft, ChevronRight,
  ShieldAlert, CheckCircle2, TrendingDown, ClipboardList,
  AlertCircle, Info
} from 'lucide-react';

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

    // 🎯 Step 1: Determine which endpoint to hit
    // Pag attendance, sa bagong controller tayo. Pag iba, sa original summary.
    const endpoint = reportType === 'attendance' 
      ? `/api/reports/attendance?month=${selectedMonth}` 
      : `/api/reports/summary?month=${selectedMonth}`;

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const data = await response.json();
    
    console.log(`[REPORTS] Mode: ${reportType} | Received: ${data.length} records`);
    
    setSummary(Array.isArray(data) ? data : []);
  } catch (err) { 
    console.error("Fetch Error:", err); 
  } finally { 
    setLoading(false); 
  }
};
  useEffect(() => { 
  fetchReportData(); 
}, [selectedMonth, reportType]);

useEffect(() => {
  let results = summary;

  // 1. Handle Search (Registry search)
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
  } 

  else if (reportType === "attendance") {
    // I-filter base sa piniling Program (Education, Vocational, etc.)
    if (statusFilter !== "all") {
      results = results.filter(p => 
        p.program_category && p.program_category.includes(statusFilter)
      );
    }
  }
  
  // 🎯 NEW: TASTM Specific Logic (Filter for 15 days)
  else if (reportType === "tastm") {
    // Ipakita lang ang mga nakakuha ng saktong 15 days earned
    results = results.filter(p => Number(p.active_tastm) === 15);

    // I-apply pa rin ang Audit Status (Voided vs Good) sa loob ng 15-day group na 'to
    if (statusFilter === "locked") {
      results = results.filter(p => Number(p.voided_tastm) > 0);
    } else if (statusFilter === "good") {
      results = results.filter(p => Number(p.voided_tastm) === 0);
    }
  }

  // 📑 GCTA / Conduct Logic (Normal filtering)
  else if (reportType === "conduct") {
    if (statusFilter === "locked") {
      results = results.filter(p => 
        p.is_locked_for_gcta === true || 
        String(p.is_locked_for_gcta) === "true" || 
        Number(p.voided_gcta) > 0
      );
    } else if (statusFilter === "good") {
      results = results.filter(p => 
        (p.is_locked_for_gcta === false || String(p.is_locked_for_gcta) === "false" || p.is_locked_for_gcta === null) && 
        Number(p.voided_gcta) === 0
      );
    }
  }

  setFilteredData(results);
  setCurrentPage(1);
}, [searchTerm, reportType, statusFilter, summary]);


  const logExport = async (format) => {
    try {
        const token = localStorage.getItem("token");
        await fetch(`${API_BASE_URL}/api/reports/audit-export`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                format: format,
                reportType: reportType,
                monthPeriod: selectedMonth,
                recordCount: filteredData.length
            })
        });
    } catch (err) {
        console.error("Audit Ping Failed:", err);
    }
};
  // 📄 DYNAMIC PDF EXPORT
const exportToPDF = () => {
  try {
    const isRelease = reportType === 'release';
    const isAttendance = reportType === 'attendance'; // 🎯 New check
    const doc = new jsPDF(isRelease ? 'l' : 'p'); 
    const pageWidth = doc.internal.pageSize.getWidth();
    const centerX = pageWidth / 2;

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
    
    // 🏷️ Dynamic Title
    const title = isRelease ? "PRIORITY DISCHARGE FORECAST" : 
                  isAttendance ? "MONTHLY PROGRAM PARTICIPATION AUDIT" : 
                  `MONTHLY ${reportType.toUpperCase()} COMPLIANCE AUDIT`;
    doc.text(title, centerX, 35, { align: "center" });

    // 🎯 2. DYNAMIC COLUMNS
    let tableColumn = [];
    if (isRelease) {
      tableColumn = ["ID", "PDL Name", "Orig. Release", "Total Allowance", "Expected Release"];
    } else if (isAttendance) {
      tableColumn = ["ID", "PDL Name", "Program Category", "Hours Rendered"];
    } else {
      tableColumn = ["ID", "PDL Name", "Status", "Date Granted", reportType === 'conduct' ? "GCTA" : "TASTM", "Remarks"];
    }
    
    const tableRows = filteredData.map(p => {
      if (isRelease) {
        return [
          `#${p.pdl_id}`,
          `${p.last_name}, ${p.first_name}`,
          p.original_release_date ? new Date(p.original_release_date).toLocaleDateString() : 'N/A',
          `${p.total_timeallowance_earned || 0} Days`,
          p.expected_releasedate ? new Date(p.expected_releasedate).toLocaleDateString() : 'N/A'
        ];
      } else if (isAttendance) {
        return [
          `#${p.pdl_id}`,
          `${p.last_name}, ${p.first_name}`,
          p.program_category || 'General',
          `${parseFloat(p.total_hours_this_month || 0).toFixed(1)} hrs`,
          `+${p.active_gcta || 0} Days`
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

    // 🖋️ 4. SIGNATORIES FOOTER (Added as requested)
    const finalY = doc.lastAutoTable.finalY + 20;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    // Prepared By (Left Side)
    doc.text("Prepared By:", 14, finalY);
    doc.text("__________________________", 14, finalY + 10);
    doc.text("Records Officer / Assistant", 14, finalY + 15);

    // Noted By (Right Side)
    const rightAlignX = isRelease ? 220 : 140; // Adjust based on orientation
    doc.text("Noted By:", rightAlignX, finalY);
    doc.text("__________________________", rightAlignX, finalY + 10);
    doc.text("Jail Warden", rightAlignX, finalY + 15);

    doc.save(`BJMP_${reportType}_${selectedMonth}.pdf`);
    logExport("PDF");
  } catch (error) { 
    console.error("PDF Error:", error);
    alert("Error generating PDF."); 
  }
};

  // 📊 DYNAMIC CSV EXPORT
const exportToCSV = () => {
  const isRelease = reportType === 'release';
  const isAttendance = reportType === 'attendance';
  const isGcta = reportType === 'conduct';

  // 🏛️ 1. OFFICIAL BJMP HEADER LOGIC
  const reportTitle = isRelease 
    ? "PRIORITY DISCHARGE FORECAST" 
    : isAttendance ? "MONTHLY PROGRAM PARTICIPATION AUDIT" 
    : `MONTHLY ${reportType.toUpperCase()} COMPLIANCE AUDIT`;

  const officialHeader = [
    ["REPUBLIC OF THE PHILIPPINES", "", "", "", ""],
    ["BUREAU OF JAIL MANAGEMENT AND PENOLOGY", "", "", "", ""],
    ["Meycauayan City Jail, Bulacan", "", "", "", ""],
    [reportTitle, "", "", "", ""],
    [`Report Period: ${selectedMonth}`, "", "", "", ""],
    [`Generated: ${new Date().toLocaleString()}`, "", "", "", ""],
    ["", "", "", "", ""] 
  ];

  // 📝 2. DYNAMIC COLUMN HEADERS
  let tableHeaders = [];
  if (isRelease) {
    tableHeaders = ["PDL_ID", "Full_Name", "PNP_Committal", "Original_Release", "Total_Allowance", "Expected_Release"];
  } else if (isAttendance) {
    tableHeaders = ["PDL_ID", "Full_Name", "Program_Category", "Hours_Rendered"];
  } else {
    tableHeaders = ["PDL_ID", "Full_Name", "Audit_Status", "Date_Granted", isGcta ? "GCTA_Days" : "TASTM_Days", "Remarks"];
  }
  
  // 🗃️ 3. DATA MAPPING
  const rows = filteredData.map(p => {
    if (isRelease) {
      return [
        p.pdl_id,
        `"${p.last_name}, ${p.first_name}"`,
        p.date_commited_pnp || "N/A",
        p.original_release_date || "N/A",
        `${p.total_timeallowance_earned || 0} Days`,
        p.expected_releasedate || "N/A"
      ];
    } else if (isAttendance) {
      return [
        p.pdl_id,
        `"${p.last_name}, ${p.first_name}"`,
        p.program_category || "General",
        parseFloat(p.total_hours_this_month || 0).toFixed(1),
        p.active_gcta || 0
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

  const csvString = [...officialHeader, tableHeaders, ...rows].map(row => row.join(",")).join("\n");

  const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `BJMP_${reportType}_${selectedMonth}.csv`;
  link.click();
  logExport("CSV");
};

  const currentRows = filteredData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  if (loading) return <div className="rpt-loading">🔄 Fetching Records...</div>;

 return (
  <div className="rpt-main-scope">
    <div className="rpt-content-wrapper">
      
      {/* 1. HEADER SECTION */}
      <div className="rpt-simple-header rpt-hide-print">
        <div className="rpt-header-left">
          <h1 className="rpt-h1">
            <BarChart3 size={32} className="rpt-header-icon" /> 
            Reports & Analytics
          </h1>
          <p className="rpt-p-sub">Meycauayan City Jail Official Reporting System.</p>
        </div>
        <div className="rpt-export-actions">
            <button className="rpt-btn-csv" onClick={exportToCSV}>
              <FileSpreadsheet size={18} /> Excel
            </button>
            <button className="rpt-btn-pdf" onClick={exportToPDF}>
              <FileText size={18} /> PDF
            </button>
        </div>
      </div>
      
      {/* 2. CONTROL PANEL (FILTERS) */}
      <div className="rpt-control-panel rpt-hide-print">
       <div className="rpt-input-group">
  <label><ClipboardList size={12} /> Report Type</label>
  <select 
    className="rpt-select" 
    value={reportType} 
    onChange={(e) => {
      setReportType(e.target.value);
      setStatusFilter("all"); // 🎯 Mahalaga: Reset filter pag nagpalit ng mode
    }}
  >
    <option value="conduct">GCTA Conduct Review</option>
    <option value="tastm">TASTM Labor Ledger</option>
    <option value="attendance">Program & Attendance</option>
    <option value="release">Priority Release Forecast</option>
  </select>
</div>

        <div className="rpt-input-group">
          <label><Calendar size={12} /> Month Period</label>
          <input type="month" className="rpt-select" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} />
        </div>

        <div className="rpt-input-group">
          <label><Search size={12} /> Search Registry</label>
          <div className="rpt-search-wrapper">
            <Search size={16} className="rpt-search-icon-inner" />
            <input type="text" className="rpt-search" placeholder="Last Name or ID..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </div>

        <div className="rpt-input-group">
            <label>
              <Filter size={12} /> 
              {reportType === 'attendance' ? 'Program Category' : 'Audit Filter'}
            </label>
            <select 
              className="rpt-select" 
              value={statusFilter} 
              disabled={reportType === 'release'}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {/* 🎯 Condition: Kung Attendance ang pinili, ipakita ang Categories */}
              {reportType === 'attendance' ? (
                <>
                  <option value="all">All Programs</option>
                  <option value="Education">Education (ALS)</option>
                  <option value="Vocational">TESDA / Vocational</option>
                  <option value="Livelihood">Livelihood Training</option>
                  <option value="Religious">Religious / Values Formation</option>
                  <option value="Sports">Sports & Recreation</option>
                </>
              ) : (
                <>
                  {/* 🛡️ Original Options for GCTA/TASTM */}
                  <option value="all">All Records</option>
                  <option value="good">Eligible Records</option>
                  <option value="locked">Voided / Locked</option>
                </>
              )}
            </select>
          </div>
      </div>

      {/* 3. REPORT DATA TABLE */}
      <div className="rpt-table-container">
         <div className="rpt-table-header">
  <h3 className="rpt-h3">
    {reportType === 'release' ? (
      <><TrendingDown size={20} color="#059669" /> Priority Discharge Forecast</>
    ) : reportType === 'attendance' ? (
      <><ClipboardList size={20} color="#2563eb" /> Program Participation Audit</>
    ) : (
      <><ClipboardList size={20} color="#3b82f6" /> {reportType === 'conduct' ? 'GCTA Monthly Audit' : 'TASTM Monthly Audit'}</>
    )}
  </h3>
  
  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
    {/* 🗓️ Optional: Nagdagdag ako ng maliit na indicator para sa selected month */}
    <span className="rpt-period-badge">
       <Calendar size={12} /> {selectedMonth}
    </span>
    <span className="rpt-count">
      <Info size={12} /> {filteredData.length} entries found
    </span>
  </div>
</div>

       <table className="rpt-table">
  <thead>
    <tr>
      <th>PDL Identity</th>
      {/* 🎯 Dynamic Header 2 */}
      <th>
        {reportType === 'release' ? 'Release Timeline' : 
         reportType === 'attendance' ? 'Program Category' : 'Audit Status'}
      </th>
      {/* 🎯 Dynamic Header 3 */}
      <th>
        {reportType === 'release' ? 'Total Allowance' : 
         reportType === 'attendance' ? 'Monthly Participation' : 'Monthly Result'}
      </th>
      <th className="rpt-hide-print">Control</th>
    </tr>
  </thead>
  <tbody>
    {currentRows.map((pdl) => {
      // 🛡️ Logic checks
      const isDqd = pdl.is_locked_for_gcta || Number(pdl.voided_gcta) > 0 || Number(pdl.voided_tastm) > 0;
      const isRelease = reportType === "release";
      const isAttendance = reportType === "attendance";

      return (
        <tr key={pdl.pdl_id} className={isRelease ? "rpt-row-priority" : ""}>
          {/* 1. PDL Identity (Common) */}
          <td>
            <div className="rpt-id-block">
              <strong>{pdl.last_name}, {pdl.first_name}</strong>
              <small className="rpt-id-sub">Jail ID: #{pdl.pdl_id}</small>
            </div>
          </td>

          {/* 2. Middle Column: Status / Timeline / Program Badge */}
          <td className="rpt-col-status">
            {isAttendance ? (
              <div className="rpt-program-wrapper">
                <span className="rpt-badge rpt-badge-blue">
                  <ClipboardList size={12} /> 
                  {pdl.program_category && pdl.program_category !== 'None' ? pdl.program_category : 'General'}
                </span>
              </div>
            ) : isRelease ? (
              <div className="rpt-timeline">
                <small className="rpt-orig-date">
                  Orig: {pdl.original_release_date ? new Date(pdl.original_release_date).toLocaleDateString() : 'N/A'}
                </small>
                <span className="rpt-release-date">
                  <Calendar size={14} /> <strong>{new Date(pdl.expected_releasedate).toLocaleDateString()}</strong>
                </span>
              </div>
            ) : (
              <div className="rpt-status-wrapper">
                <span className={isDqd ? "rpt-badge rpt-badge-red" : "rpt-badge rpt-badge-green"}>
                  {isDqd ? <><ShieldAlert size={12} /> DQ</> : <><CheckCircle2 size={12} /> OK</>}
                </span>
                {isDqd && (
                  <div className="rpt-audit-note">
                    <small><strong>Reason:</strong> {pdl.is_locked_for_gcta ? "Disciplinary Board" : pdl.audit_remarks}</small>
                  </div>
                )}
              </div>
            )}
          </td>

          {/* 3. Result Column: Allowance / Credits / Hours */}
          <td>
            {isAttendance ? (
              <div className="rpt-participation-block">
                <strong style={{ color: '#2563eb', fontSize: '1.15rem' }}>
                   {parseFloat(pdl.total_hours_this_month || 0).toFixed(1)} Hours
                </strong>
                <div className="rpt-participation-sub">
                   <ClipboardList size={12} /> <span>Monthly Total</span>
                </div>
              </div>
            ) : isRelease ? (
              <div className="rpt-allowance-info">
                <strong className="rpt-text-success">
                   <TrendingDown size={14} /> {pdl.total_timeallowance_earned || 0} Days Saved
                </strong>
                <small className="rpt-crime-sub">{pdl.crime_name}</small>
              </div>
            ) : (
              <strong className="rpt-monthly-val">
                +{reportType === 'conduct' ? pdl.active_gcta : pdl.active_tastm} Days
              </strong>
            )}
          </td>

          {/* 4. Action (Common) */}
          <td className="rpt-hide-print">
            <button className="rpt-btn-view" onClick={() => navigate(`/profile/${pdl.pdl_id}`)}>
              <Eye size={14} /> Profile
            </button>
          </td>
        </tr>
      );
    })}
  </tbody>
</table>

        {/* 4. PAGINATION CONTROLS */}
        <div className="rpt-pagination rpt-hide-print">
          <button 
            disabled={currentPage === 1} 
            onClick={() => setCurrentPage(p => p - 1)} 
            className="rpt-page-btn"
          >
            <ChevronLeft size={16} /> Prev
          </button>
          <span className="rpt-page-info">
            Page <strong>{currentPage}</strong> of {totalPages || 1}
          </span>
          <button 
            disabled={currentPage >= totalPages} 
            onClick={() => setCurrentPage(p => p + 1)} 
            className="rpt-page-btn"
          >
            Next <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  </div>
);
};

export default Reports;