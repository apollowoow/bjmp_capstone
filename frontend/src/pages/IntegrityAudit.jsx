import React, { useState, useEffect, useCallback } from 'react';
import { ShieldAlert, Wrench,AlertCircle, CheckCircle, Loader2, Search, ChevronLeft, ChevronRight, History, UserCheck, FileText, CalendarDays, XCircle } from 'lucide-react';
import "./integrity.css";
import RepairModal from "../components/RepairModal";
import API_BASE_URL from "../apiConfig";
import { useNavigate } from 'react-router-dom';

const IntegrityAudit = () => {
    const [activeTab, setActiveTab] = useState('attendance'); 
    const navigate = useNavigate();
    const [viewMode, setViewMode] = useState('tampered'); 
    const [records, setRecords] = useState([]);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [authPassword, setAuthPassword] = useState("");
    const [authError, setAuthError] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const formatDate = (dateString) => {
    // 🎯 THE FIX: Check if dateString is actually there and not "1970"
    if (!dateString || dateString === "0" || new Date(dateString).getTime() === 0) {
        return "Pending Re-seal"; 
    }
    
    const options = { 
        year: 'numeric', 
        month: 'short', 
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
};

    const fetchAuditRecords = useCallback(async () => {
        setLoading(true);
        setRecords([]); 
        
        try {
            const token = localStorage.getItem("token");
            const endpoint = viewMode === 'tampered' 
                ? `${API_BASE_URL}/api/sessions/tampered?type=${activeTab}`
                : `${API_BASE_URL}/api/sessions/restored-records?type=${activeTab}`;

            const res = await fetch(endpoint, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            
            if (res.ok) {
                setRecords(data);
            }
        } catch (err) {
            console.error("Audit Fetch Failed:", err);
        } finally {
            setLoading(false);
        }
    }, [activeTab, viewMode]);

    useEffect(() => {
        fetchAuditRecords();
        setCurrentPage(1); 
        setSearchTerm("");
      
    }, [fetchAuditRecords]);


    const handleVerifyAccess = async (e) => {
    if (e) e.preventDefault();
    setIsVerifying(true);
    setAuthError("");

    try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE_URL}/api/auth/verify-session-password`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ password: authPassword, 
            module: "INTEGRITY_AUDIT" })
        });

        if (res.ok) {
            setIsAuthorized(true); // 🔓 UNLOCK THE GATE
        } else {
            setAuthError("Invalid administrative password. Unauthorized access attempt logged.");
        }
    } catch (err) {
        setAuthError("Security server unreachable.");
    } finally {
        setIsVerifying(false);
    }
};

    const filteredRecords = records.filter(pdl => {
        const matchesName = `${pdl.first_name} ${pdl.last_name}`.toLowerCase().includes(searchTerm.toLowerCase());
        let matchesMonth = true;
        if (selectedMonth) {
            const dateToCompare = viewMode === 'restored' ? pdl.restoration_date : (activeTab === 'attendance' ? pdl.timestamp_in : pdl.date_granted || pdl.month_year);
            matchesMonth = dateToCompare && new Date(dateToCompare).toISOString().slice(0, 7) === selectedMonth;
        }
        return matchesName && matchesMonth;
    });

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredRecords.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);

    const handleOpenRepair = (pdl) => {
    // 🎯 We map the fields precisely so the Modal knows what to do
    setSelectedRecord({
        // 🆔 Handle different ID names across the 3 tables
        id: activeTab === 'attendance' 
            ? (pdl.attendance_id || pdl.session_id) 
            : (pdl.tastm_log_id || pdl.gcta_log_id || pdl.log_id), 
        
        pdl_id: pdl.pdl_id,
        pdl_name: `${pdl.last_name}, ${pdl.first_name}`,
        type: activeTab,
        
        // 📊 Ensure 0 is treated as a value, not a "falsy" skip
        old_val: activeTab === 'attendance' 
            ? (pdl.hours_attended ?? 0) 
            : activeTab === 'tastm' 
                ? (pdl.total_hours_accumulated ?? 0) 
                : (pdl.days_earned ?? 0),
        
        // 🕵️ FORENSIC METADATA: This is the switch for "Receipt Mode"
        restored_by: pdl.restored_by_name || null, 
        restoration_date: pdl.restoration_date || null,
        remarks: pdl.remarks || ""
    });
    
    setIsModalOpen(true);
};
    return (
        <div className="integrity-scope">
            <div className="audit-header">
                <div className="header-text">
                    <h1><ShieldAlert size={28} /> Security Audit Center</h1>
                    <p>Forensic oversight for the Meycauayan City Jail Judicial Ledger</p>
                </div>
            
                <div className="ia-header-controls">
        <div className="ia-search-container">
            <Search size={18} className="ia-search-icon" />
            <input 
                type="text" 
                placeholder="Search PDL Name..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>

        <div className="ia-filter-item month-filter">
            <CalendarDays size={18} className="ia-filter-icon" />
            <input 
                type="month" 
                value={selectedMonth} 
                onChange={(e) => setSelectedMonth(e.target.value)} 
            />
        </div>
    </div>
                
            </div>
            

            <div className="audit-action-bar">
                <div className="audit-tabs">
                    {['attendance', 'tastm', 'gcta'].map((tab) => (
                        <button 
                            key={tab}
                            className={activeTab === tab ? 'active' : ''} 
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab.toUpperCase()}
                        </button>
                    ))}
                </div>

                <div className="ia-view-mode-toggle">
                    <button 
                        className={viewMode === 'tampered' ? 'mode-active mode-danger' : ''} 
                        onClick={() => setViewMode('tampered')}
                    >
                        <ShieldAlert size={16} /> Breaches
                    </button>
                    <button 
                        className={viewMode === 'restored' ? 'mode-active mode-success' : ''} 
                        onClick={() => setViewMode('restored')}
                    >
                        <History size={16} /> Restored Ledger
                    </button>
                </div>
            </div>

            <div className="audit-card">
                {loading ? (
                    <div className="ia-loading-state">
                        <Loader2 className="ia-spin" size={40} />
                        <p>Scanning Ledger...</p>
                    </div>
                ) : currentItems.length > 0 ? (
                    <>
                        <table className="ia-audit-table">
                            <thead>
                                <tr>
                                    <th>PDL Name</th>
                                    <th>Date</th> 
                                    <th>{activeTab === 'attendance' ? 'Session' : 'Period'}</th>
                                    
                                    {viewMode === 'tampered' ? (
                                        <>
                                            <th>Violation</th>
                                            <th>Integrity</th>
                                            <th>Action</th>
                                        </>
                                    ) : (
                                        <>
                                            <th>Reference Used</th>
                                            <th>Restored By</th>
                                            <th>Details</th>
                                        </>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {currentItems.map((pdl, idx) => (
                                    <tr key={idx}>
                                        <td><strong>{pdl.last_name}, {pdl.first_name}</strong></td>
                                        <td className="ia-date-cell">
                                            {formatDate(activeTab === 'attendance' ? pdl.timestamp_in : pdl.date_granted || pdl.month_year)}
                                        </td>
                                        <td>{pdl.session_name || pdl.month_year}</td>
                                        
                                        {viewMode === 'tampered' ? (
                                            <>
                                                <td className="ia-text-danger">Signature Mismatch</td>
                                                <td><span className="ia-badge-tampered">TAMPERED</span></td>
                                                <td>
                                                    <button className="ia-btn-repair-small" onClick={() => handleOpenRepair(pdl)}>
                                                        <Wrench size={14} /> Repair
                                                    </button>
                                                </td>
                                            </>
                                        ) : (
                                            <>
                                                <td className="ia-ref-cell">
                                                    <FileText size={14} /> 
                                                    <span>{pdl.remarks?.split('[')[1]?.split(']')[0] || "Paper Log"}</span>
                                                </td>
                                                <td className="ia-fixer-cell">
                                                    <UserCheck size={14} /> 
                                                    <span>{pdl.restored_by_name || "Admin"}</span>
                                                </td>
                                                <td>
                                                    <button className="ia-btn-view-history" onClick={() => handleOpenRepair(pdl)}>
                                                        <History size={14} /> Receipt
                                                    </button>
                                                </td>
                                            </>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div className="ia-pagination">
                            <button 
                                className="ia-pag-btn"
                                disabled={currentPage === 1} 
                                onClick={() => setCurrentPage(prev => prev - 1)}
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <span className="ia-pag-info">Page {currentPage} of {totalPages || 1}</span>
                            <button 
                                className="ia-pag-btn"
                                disabled={currentPage === totalPages || totalPages === 0} 
                                onClick={() => setCurrentPage(prev => prev + 1)}
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="no-breach">
                        <CheckCircle size={56} className="ia-check-icon" />
                        <h3>{viewMode === 'tampered' ? 'System Integrity Intact' : 'No Restoration History'}</h3>
                        <p>No records found for <strong>{activeTab.toUpperCase()}</strong> in this view.</p>
                    </div>
                )}
            </div>
{!isAuthorized && (
            <div className="ia-security-overlay">
                <div className="ia-auth-card">
                    <div className="ia-lock-header">
                        <ShieldAlert size={48} className="ia-lock-icon" />
                        <h2>Restricted Access</h2>
                        <p>Authorization required to view Judicial Integrity Logs.</p>
                    </div>

                    <form onSubmit={handleVerifyAccess}>
                        <div className="ia-auth-field">
                            <label>Confirm Admin Password</label>
                            <input 
                                type="password" 
                                placeholder="••••••••"
                                value={authPassword}
                                onChange={(e) => setAuthPassword(e.target.value)}
                                autoFocus
                                required
                            />
                            {authError && <span className="ia-auth-error"><AlertCircle size={14} /> {authError}</span>}
                        </div>

                        <button type="submit" className="ia-btn-unlock" disabled={isVerifying}>
                            {isVerifying ? <Loader2 size={18} className="ia-spin" /> : "Unlock Forensic Ledger"}
                        </button>
                    </form>
                    
                    <button 
                        className="ia-btn-exit" 
                        onClick={() => navigate("/dashboard")} // 🚀 Direct navigation to the dashboard route
                    >
                        Return to Dashboard
                    </button>
                </div>
            </div>
        )}
            <RepairModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                record={selectedRecord} 
                onSuccess={fetchAuditRecords} 
            />
        </div>
    );
};

export default IntegrityAudit;