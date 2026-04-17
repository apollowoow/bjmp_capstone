import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API_BASE_URL from "../apiConfig";
import "./education.css";
import { X, Wrench, ShieldCheck, ArrowRight, ArrowLeft, Loader2, AlertCircle,  ShieldAlert, CheckCircle2, FileText} from 'lucide-react';
import { usePermissions } from "../hooks/usePermission";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; // 🎯 Kunin natin yung function mismo

const SessionDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, canDo } = usePermissions();
    
    // --- States ---
    const [attendees, setAttendees] = useState([]);
    const [sessionInfo, setSessionInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [showRepairModal, setShowRepairModal] = useState(false);
    const [selectedPdl, setSelectedPdl] = useState(null);
    const [repairData, setRepairData] = useState({ hours: "", ref: "" });
    const [repairStep, setRepairStep] = useState(1);
    const [status, setStatus] = useState({ type: null, message: "" }); // { type: 'error' | 'success' | 'loading', message: '' }
    const [isAgreed, setIsAgreed] = useState(false);
        const DEFAULT_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23cbd5e1'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z'/%3E%3C/svg%3E";

    // --- Pagination States ---
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5; // Shows 8 PDLs per page

    useEffect(() => {
        fetchSessionData();
    }, [id]);

    const handleOpenRepairModal = (pdl) => {
        setSelectedPdl(pdl);
        setRepairData({ hours: pdl.hours_attended, ref: "" });
        setRepairStep(1);
        setStatus({ type: null, message: "" });
        setIsAgreed(false);
        setShowRepairModal(true);
    };
    // 🎯 Move to Final Review
    const handleNextStep = () => {
        if (!repairData.ref) return alert("🚨 Reference Required!");
        setRepairStep(2);
    };

 const generateAttendancePDF = () => {
    const doc = new jsPDF();
    
    // 🎨 Layout Settings
    const pageWidth = doc.internal.pageSize.getWidth();
    const tableColumn = ["No.", "PDL Name", "ID Number", "Time In", "Signature"];
    const tableRows = [];

    // 🎯 Mapping Attendees (Make sure 'attendees' state has these fields)
    attendees.forEach((pdl, index) => {
        const pdlData = [
            index + 1,
            `${pdl.last_name?.toUpperCase()}, ${pdl.first_name}`, // Standard format: LASTNAME, First
            pdl.pdl_id,
            pdl.timestamp_in ? new Date(pdl.timestamp_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '---',
            "____________________" 
        ];
        tableRows.push(pdlData);
    });

    // 🏛️ Header Section
    doc.setFontSize(10);
    doc.text("Republic of the Philippines", pageWidth / 2, 10, { align: "center" });
    doc.setFontSize(11);
    doc.text("BUREAU OF JAIL MANAGEMENT AND PENOLOGY", pageWidth / 2, 15, { align: "center" });
    doc.setFontSize(13);
    doc.setFont(undefined, 'bold');
    doc.text("MEYCAUAYAN CITY JAIL - ATTENDANCE SHEET", pageWidth / 2, 22, { align: "center" });
    
    // ℹ️ Session Details (Using your log variables)
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    doc.text(`Program: ${sessionInfo?.program_name || 'N/A'}`, 14, 32);
    doc.text(`Session Name: ${sessionInfo?.session_name || 'N/A'}`, 14, 37);
    doc.text(`Date: ${sessionInfo?.session_date || new Date().toLocaleDateString()}`, 14, 42);
    doc.text(`Target Credits: ${sessionInfo?.hours_to_earn || '0'} hours`, 14, 47);

    // 📊 Attendance Table
    autoTable(doc, {
    startY: 52,
    head: [tableColumn],
    body: tableRows,
    theme: 'grid',
    // 🎯 HeadStyles: Siguraduhin nating pantay ang padding at alignment
    headStyles: { 
        fillColor: [15, 23, 42], 
        textColor: [255, 255, 255], 
        halign: 'center', // Center lahat ng text sa header
        fontSize: 10,
        fontStyle: 'bold',
        cellPadding: 3
    },
    columnStyles: {
        // 🎯 FIX: Ginawa nating 15 ang width para hindi sakal ang "No."
        0: { cellWidth: 15, halign: 'center' }, 
        1: { cellWidth: 'auto' }, // Hayaan ang pangalan na kumuha ng space
        2: { cellWidth: 30, halign: 'center' }, // PDL ID
        3: { cellWidth: 30, halign: 'center' }, // Time In
        4: { cellWidth: 45, halign: 'center' }, // Signature area
    },
    styles: { 
        fontSize: 9, 
        cellPadding: 4, 
        valign: 'middle',
        overflow: 'linebreak' // Para kung mahaba ang pangalan, mag-wrap siya
    },
    didDrawPage: (data) => {
        // Page numbers footer (Optional)
        const str = "Page " + doc.internal.getNumberOfPages();
        doc.setFontSize(8);
        doc.text(str, data.settings.margin.left, doc.internal.pageSize.height - 10);
    }
});

    // 🖋️ Footer / Signatories
    const finalY = doc.lastAutoTable.finalY + 20;
    doc.setFontSize(10);
    doc.text("Prepared By:", 14, finalY);
    doc.setFont(undefined, 'bold');
    doc.text(`${sessionInfo?.officer_in_charge?.toUpperCase() || '____________________'}`, 14, finalY + 10);
    doc.setFont(undefined, 'normal');
    doc.text("Officer-in-Charge / Facilitator", 14, finalY + 15);

    doc.text("Noted By:", 140, finalY);
    doc.text("____________________", 140, finalY + 10);
    doc.text("Jail Warden", 140, finalY + 15);

    // 📁 Save File
    const fileName = `Attendance_${sessionInfo?.session_name || 'Session'}_${sessionInfo?.session_date || 'Date'}.pdf`;
    doc.save(fileName.replace(/\s+/g, '_')); // Replace spaces with underscores for safety
};

    const submitRepair = async () => {
        if (!repairData.ref) {
            setStatus({ type: 'error', message: "Paper Log Reference is required!" });
            return;
        }

        setStatus({ type: 'loading', message: "Generating cryptographic seal..." });

        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE_URL}/api/sessions/repair-integrity`, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json", 
                    Authorization: `Bearer ${token}` 
                },
                body: JSON.stringify({ 
                    session_id: id, 
                    pdl_id: selectedPdl.pdl_id, 
                    corrected_hours: repairData.hours, 
                    paper_log_ref: repairData.ref 
                })
            });

            const result = await res.json();

            if (res.ok) {
                setStatus({ type: 'success', message: "Record successfully re-sealed and verified!" });
                // Wait 2 seconds so they can see the success message, then close
                setTimeout(() => {
                    setShowRepairModal(false);
                    fetchSessionData(); 
                }, 2000);
            } else {
                setStatus({ type: 'error', message: ` ${result.error || "Repair failed."}` });
            }
        } catch (err) {
            setStatus({ type: 'error', message: " Network error. Check your connection." });
        }
    };
    // 🎯 Fetch Data from Backend
    const fetchSessionData = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE_URL}/api/sessions/details/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            
            if (res.ok) {
                setAttendees(data.attendees || []);
                setSessionInfo(data.session || null);
            }
            setLoading(false);
        } catch (err) {
            console.error("Fetch Error:", err);
            setLoading(false);
        }
    };

    // 🎯 Update Individual Hours (The Overtime Fix)
    const handleUpdateHours = async (pdl_id, new_hours) => {
    // 🛡️ SECURITY GUARD: Kill the process if no permission
        if (!canDo("Attendance & Sessions", "canedit")) {
            console.error("🚫 Permission Denied: You cannot edit attendance.");
            return; 
        }

        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE_URL}/api/sessions/update-attendance-hours`, {
                method: "PUT",
                headers: { 
                    "Content-Type": "application/json", 
                    Authorization: `Bearer ${token}` 
                },
                body: JSON.stringify({ session_id: id, pdl_id, new_hours })
            });

            if (res.ok) {
                console.log(`✅ PDL #${pdl_id} hours updated to ${new_hours}`);
            }
        } catch (err) {
            console.error("Update failed:", err);
        }
    };

    // 🔍 Search & Pagination Logic
    const filteredAttendees = attendees.filter(pdl => 
        pdl.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pdl.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pdl.pdl_id.toString().includes(searchTerm)
    );

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredAttendees.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredAttendees.length / itemsPerPage);

    // Auto-reset to page 1 when searching
    useEffect(() => { setCurrentPage(1); }, [searchTerm]);

    if (loading) return <div className="education-scope"><div className="wait-animation">🔄 Loading Ledger Details...</div></div>;

    return (
        <div className="education-scope">
            <div className="education-container">
                
                {/* 🔙 Navigation & Header */}
                <button className="btn-grant-gcta" onClick={() => navigate('/education')} style={{ marginBottom: '15px' }}>
                            ⬅️ Back to Judicial Ledger
                        </button>
                <div className="page-header">
                    <div className="header-text">
                        
                        <h1>Attendance Records</h1>
                        <p>Topic: <strong>{sessionInfo?.session_name || 'N/A'}</strong> | Date: {sessionInfo ? new Date(sessionInfo.session_date).toLocaleDateString() : ''}</p>
                    </div>
                    <div className="header-actions">
                         <span className="badge-program">{sessionInfo?.program_name}</span>
                    </div>
                </div>

                {/* 🛠️ Management Card */}
                <div className="section card">
                    <div className="card-header" style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '15px' }}>
           
                        
                        {/* 🔍 Search Input */}
                  
                            <input 
                               placeholder="Search Name or ID..."
                                className="manual-search-input"
                                style={{ width: '100%', marginBottom: 0 }}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            
               
                         <button 
                                onClick={generateAttendancePDF}
                                style={{
                                    backgroundColor: '#0f172a',
                                    color: 'white',
                                    padding: '8px 16px',
                                    borderRadius: '6px',
                                    border: 'none',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    fontSize: '0.9rem'
                                }}
                            >
                            <FileText size={18} /> Generate Sheet
                        </button>
                       
                    </div>

                    <div className="table-responsive">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Photo</th>
                                    <th>PDL Name</th>
                                    <th>ID Number</th>
                                    <th>Hours Rendered</th>
                                    <th style={{ textAlign: 'center' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentItems.length > 0 ? (
                                    currentItems.map((pdl) => (
                                        <tr 
                                            key={pdl.pdl_id} 
                                            className={pdl.is_tampered ? "row-tampered" : ""}
                                            style={pdl.is_tampered ? { backgroundColor: '#fff1f2' } : {}}
                                        >
                                            <td>
                                                <img 
    src={pdl.pdl_picture ? `${API_BASE_URL}/public/uploads/${pdl.pdl_picture}` : DEFAULT_AVATAR} 
    alt="PDL" 
    className="mini-pdl-photo" 
    style={pdl.is_tampered ? { border: '2px solid #ef4444' } : {}}
/>
                                            </td>
                                            <td>
                                                <strong style={pdl.is_tampered ? { color: '#991b1b' } : {}}>
                                                    {pdl.last_name}, {pdl.first_name}
                                                </strong>
                                            </td>
                                            <td><code style={{ fontSize: '0.8rem' }}>#{pdl.pdl_id}</code></td>
                                            <td>
                                                {canDo("Attendance & Sessions", "canedit") ? (
                                                    <input 
    type="number" 
    step="1"
    min="0" // 🛡️ Bawal ang negative
    max="8" // 🎯 Eto yung limit mo
    className={`manual-search-input ${pdl.is_tampered ? 'input-locked' : ''}`}
    style={{ 
        width: '80px', 
        margin: 0, 
        textAlign: 'center', 
        padding: '8px',
        backgroundColor: pdl.is_tampered ? '#f1f5f9' : 'white',
        cursor: pdl.is_tampered ? 'not-allowed' : 'text',
        borderColor: pdl.is_tampered ? '#ef4444' : '#e2e8f0',
        color: pdl.is_tampered ? '#94a3b8' : '#1e293b'
    }}
    defaultValue={pdl.hours_attended}
    disabled={pdl.is_tampered} 
    onBlur={(e) => {
        let value = parseFloat(e.target.value);
        // 🛡️ Client-side guard: Pag lumampas, i-force natin sa 8
        if (value > 8) value = 8;
        if (value < 0 || isNaN(value)) value = 0;
        
        handleUpdateHours(pdl.pdl_id, value);
    }}
    title={pdl.is_tampered ? "This record is locked due to an integrity mismatch." : "Maximum allowed is 8"}
/>
                                                ) : (
                                                    <span style={{ fontWeight: 'bold', color: '#64748b' }}>
                                                        {pdl.hours_attended} hrs
                                                    </span>
                                                )}
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                {pdl.is_tampered ? (
                                                    <div className="tamper-column-actions">
                                                        {/* 🚩 The Alert Badge */}
                                                        <div className="tamper-badge pulse">
                                                            <ShieldAlert size={14} />
                                                            <span>TAMPERED</span>
                                                        </div>
                                                    
                                                    </div>
                                                ) : (
                                                    /* ✅ The Verified Badge */
                                                    <div className="verified-badge">
                                                        <ShieldCheck size={14} />
                                                        <span>VERIFIED</span>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                                            No matching PDL records found for this session.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {showRepairModal && (
    <div className="repair-modal-overlay">
        <div className={`repair-modal-content ${repairStep === 2 ? 'confirm-mode' : ''}`}>
            
            {/* Status Banner */}
            {status.message && (
                <div className={`modal-status-banner ${status.type}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                    {status.type === 'error' && <AlertCircle size={18} />}
                    {status.type === 'success' && <CheckCircle2 size={18} />}
                    {status.type === 'loading' && <Loader2 size={18} className="animate-spin" />}
                    <span>{status.message}</span>
                </div>
            )}

            {repairStep === 1 ? (
                <>
                    <div className="modal-header">
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Wrench size={20} /> Integrity Repair Protocol
                        </h3>
                        <button className="close-btn" onClick={() => setShowRepairModal(false)}>
                            <X size={20} />
                        </button>
                    </div>
                    <div className="modal-body">
                        <div className="input-group">
                            <label>Corrected Hours (from Paper Log)</label>
                            <input 
                                type="number" 
                                value={repairData.hours} 
                                onChange={(e) => setRepairData({...repairData, hours: e.target.value})}
                            />
                        </div>
                        <div className="input-group">
                            <label>Paper Log Reference (Folio/Page)</label>
                            <input 
                                type="text" 
                                placeholder="e.g. Logbook 2026-A, Page 45" 
                                value={repairData.ref} 
                                onChange={(e) => setRepairData({...repairData, ref: e.target.value})}
                            />
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button className="btn-cancel" onClick={() => setShowRepairModal(false)}>Cancel</button>
                        <button 
                            className="btn-next" 
                            onClick={() => { setStatus({type: null, message: ""}); setRepairStep(2); }}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                            Review Repair <ArrowRight size={16} />
                        </button>
                    </div>
                </>
            ) : (
                <>
                    <div className="modal-header security-header">
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <ShieldCheck size={20} /> Final Authorization
                        </h3>
                    </div>
                    <div className="modal-body security-body">
                        <div className="review-card">
                            <div className="review-item"><span>PDL:</span> <strong>{selectedPdl?.last_name}</strong></div>
                            <div className="review-item"><span>Change:</span> <strong className="text-highlight">{selectedPdl?.hours_attended} → {repairData.hours} hrs</strong></div>
                            <div className="review-item"><span>Reference:</span> <strong>{repairData.ref}</strong></div>
                        </div>
                        
                        <label className="checkbox-container">
                            <input type="checkbox" checked={isAgreed} onChange={(e) => setIsAgreed(e.target.checked)} />
                            <span className="checkmark"></span>
                            I confirm this correction matches the physical log evidence.
                        </label>
                    </div>
                    <div className="modal-footer">
                        <button 
                            className="btn-back" 
                            disabled={status.type === 'loading'} 
                            onClick={() => setRepairStep(1)}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                            <ArrowLeft size={16} /> Back
                        </button>
                        <button 
                            className="btn-authorize" 
                            disabled={!isAgreed || status.type === 'loading' || status.type === 'success'} 
                            onClick={submitRepair}
                        >
                            {status.type === 'loading' ? "Sealing..." : "Confirm & Re-Seal"}
                        </button>
                    </div>
                </>
            )}
        </div>
    </div>
)}      
                    {/* 🔢 Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="pagination-controls" style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div className="pag-info" style={{ fontSize: '0.85rem', color: '#64748b' }}>
                                Page <strong>{currentPage}</strong> of {totalPages}
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button 
                                    className="pag-btn" 
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(prev => prev - 1)}
                                >
                                    Previous
                                </button>
                                <button 
                                    className="pag-btn" 
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage(prev => prev + 1)}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SessionDetails;