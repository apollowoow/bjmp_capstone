import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from "../apiConfig";
import "./msec.css";
import { usePermissions } from "../hooks/usePermission";
const Msec = () => {
    const navigate = useNavigate();

    const { isAdmin } = usePermissions();

    // --- State Management ---
    const [evaluationList, setEvaluationList] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
    const [filterType, setFilterType] = useState("All");
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [alert, setAlert] = useState({ show: false, title: "", message: "", type: "info" });

    // --- Fetch Logic ---
    const fetchEvaluation = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${API_BASE_URL}/api/sessions/msec/evaluation?month=${selectedMonth}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                console.log("📥 Raw Data from Server:", data);
                setEvaluationList(data);
            }
        } catch (err) {
            console.error("MSEC Fetch Error:", err);
        } finally {
            setLoading(false);
        }
    };

    // --- Effects ---
    useEffect(() => {
        fetchEvaluation();
    }, [selectedMonth]);

    useEffect(() => {
        setCurrentPage(1); // Reset page on filter/search
    }, [searchTerm, filterType, selectedMonth]);

    // --- Action Handler (Void/Enable) ---
    const handleAction = async (pdlId, name, isVoiding) => {
        if (!isAdmin) return;
        const actionType = isVoiding ? "disqualify" : "reenable";
        const endpoint = `${API_BASE_URL}/api/sessions/msec/${actionType}`;

        // 🎯 ADD THIS: Identify what we are targeting based on your dropdown filter
        const target = (filterType === "All" || filterType === "Both") ? "BOTH" : filterType;

        setAlert({
            show: true,
            title: isVoiding ? `Confirm ${target} Void` : `Restore ${target}`,
            message: `Void ${target} credits for ${name} in ${selectedMonth}?`,
            type: isVoiding ? "danger" : "info",
            onConfirm: async () => {
                try {
                    const token = localStorage.getItem("token");
                    await fetch(endpoint, {
                        method: "POST",
                        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                        // 🚀 SEND THE TARGET HERE
                        body: JSON.stringify({ 
                            pdl_id: pdlId, 
                            month_year: selectedMonth,
                            target: target 
                        })
                    });
                    fetchEvaluation();
                    setAlert({ show: false });
                } catch (err) { console.error(err); }
            }
        });
    };

    // --- ⚡ Filter & Pagination Logic ---
    // --- ⚡ Updated Filter & Pagination Logic ---
    const filteredList = evaluationList.filter(pdl => {
        // 1. Search Logic
        const matchesSearch = pdl.last_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            pdl.pdl_id.toString().includes(searchTerm);

        // 2. Category Logic (The Granular Fix)
        let matchesCategory = true;

        if (filterType === "GCTA") {
            // Show if they have active GCTA credits OR if GCTA is currently Voided
            matchesCategory = Number(pdl.monthly_gcta) > 0 || pdl.gcta_status === 'Voided';
        } 
        else if (filterType === "TASTM") {
            // Show if they have active TASTM credits OR if TASTM is currently Voided
            matchesCategory = Number(pdl.monthly_tastm) > 0 || pdl.tastm_status === 'Voided';
        } 
        else if (filterType === "Both") {
            // Show only if BOTH types are involved (Active or Voided)
            const hasG = Number(pdl.monthly_gcta) > 0 || pdl.gcta_status === 'Voided';
            const hasT = Number(pdl.monthly_tastm) > 0 || pdl.tastm_status === 'Voided';
            matchesCategory = hasG && hasT;
        }

        return matchesSearch && matchesCategory;
    });

    const totalPages = Math.ceil(filteredList.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    // 🎯 This is what we use in the table map
    const currentItems = filteredList.slice(indexOfFirstItem, indexOfLastItem);

    return (
        <div className="msec-scope">
            <div className="msec-container">
                <header className="msec-header">
                    <div className="header-left">
                        <button className="btn-back" onClick={() => navigate(-1)}>← Back</button>
                        <div className="title-group">
                            <h1>⚖️ MSEC Evaluation Board</h1>
                            <p>Monthly screening for <strong>{selectedMonth}</strong></p>
                        </div>
                    </div>
                    <div className="header-right">
                        <div className="month-selector">
                            <label>Period:</label>
                            <input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} />
                        </div>
                    </div>
                </header>

                <div className="msec-toolbar card">
                    <div className="toolbar-main">
                        <select className="msec-select" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                            <option value="All">All Credits</option>
                            <option value="GCTA">GCTA Only</option>
                            <option value="TASTM">TASTM Only</option>
                            <option value="Both">Both</option>
                        </select>
                        <input className="msec-search" type="text" placeholder="Search PDL..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                    <div className="msec-stats">Showing: <strong>{filteredList.length}</strong> PDLs</div>
                </div>

                <div className="msec-table-card card">
                   <table className="msec-table">
                        <thead>
                            <tr>
                            <th>PDL Identity</th>
                            {/* 🎯 Header Logic: Only show what is filtered */}
                            {(filterType === "All" || filterType === "Both" || filterType === "GCTA") && <th>GCTA</th>}
                            {(filterType === "All" || filterType === "Both" || filterType === "TASTM") && <th>TASTM</th>}
                            <th>Total</th>
                            <th>Status</th>
                            {isAdmin && <th style={{ textAlign: 'center' }}>Master Lock</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                            <tr>
                                <td colSpan={filterType === "Both" || filterType === "All" ? 6 : 5} className="loading-row">
                                Syncing...
                                </td>
                            </tr>
                            ) : currentItems.length > 0 ? (
                            currentItems.map((pdl) => (
                                <tr key={pdl.pdl_id} className={pdl.gcta_status === 'Voided' && pdl.tastm_status === 'Voided' ? 'row-voided' : ''}>
                                
                                {/* 1. IDENTITY */}
                                <td>
                                    <div className="pdl-cell">
                                    <img src={`${API_BASE_URL}/public/uploads/${pdl.pdl_picture}`} onError={(e) => e.target.src = "/default-avatar.png"} alt="" />
                                    <div className="pdl-info">
                                        <strong>{pdl.last_name}, {pdl.first_name}</strong>
                                        <span>#{pdl.pdl_id}</span>
                                    </div>
                                    </div>
                                </td>

                                {/* 2. GCTA COLUMN (Conditional) */}
                                {(filterType === "All" || filterType === "Both" || filterType === "GCTA") && (
                                    <td className="credit-col">
                                    <div className="credit-action-wrapper">
                                        <span className={`badge-gcta ${pdl.gcta_status === 'Voided' ? 'void-text' : ''}`}>
                                        +{pdl.monthly_gcta}
                                        </span>
                                        {isAdmin && (
                                        pdl.gcta_status === 'Active' ? (
                                            <button className="btn-mini-void" title="Void GCTA" onClick={() => handleAction(pdl.pdl_id, pdl.last_name, true, "GCTA")}>🚫</button>
                                        ) : (
                                            <button className="btn-mini-enable" title="Enable GCTA" onClick={() => handleAction(pdl.pdl_id, pdl.last_name, false, "GCTA")}>✅</button>
                                        )
                                        )}
                                    </div>
                                    </td>
                                )}

                                {/* 3. TASTM COLUMN (Conditional) */}
                                {(filterType === "All" || filterType === "Both" || filterType === "TASTM") && (
                                    <td className="credit-col">
                                    <div className="credit-action-wrapper">
                                        <span className={`badge-tastm ${pdl.tastm_status === 'Voided' ? 'void-text' : ''}`}>
                                        +{pdl.monthly_tastm}
                                        </span>
                                        {isAdmin && (
                                        pdl.tastm_status === 'Active' ? (
                                            <button className="btn-mini-void" title="Void TASTM" onClick={() => handleAction(pdl.pdl_id, pdl.last_name, true, "TASTM")}>🚫</button>
                                        ) : (
                                            <button className="btn-mini-enable" title="Enable TASTM" onClick={() => handleAction(pdl.pdl_id, pdl.last_name, false, "TASTM")}>✅</button>
                                        )
                                        )}
                                    </div>
                                    </td>
                                )}

                                {/* 4. DYNAMIC TOTAL */}
                                <td><strong className="total-days">+{Number(pdl.monthly_gcta) + Number(pdl.monthly_tastm)}</strong></td>

                                {/* 5. MULTI-STATUS */}
                                <td>
                                    <div className="msec-status-container">
                                    {(filterType === "All" || filterType === "Both" || filterType === "GCTA") && (
                                        <span className={`status-pill pill-${pdl.gcta_status.toLowerCase()}`}>G: {pdl.gcta_status}</span>
                                    )}
                                    {(filterType === "All" || filterType === "Both" || filterType === "TASTM") && (
                                        <span className={`status-pill pill-${pdl.tastm_status.toLowerCase()}`}>T: {pdl.tastm_status}</span>
                                    )}
                                    </div>
                                </td>

                                {/* 6. ADMIN INDICATOR */}
                                {isAdmin ? (
                                    <td style={{ textAlign: 'center', color: '#94a3b8' }}>🔓</td>
                                ) : (
                                    <td style={{ textAlign: 'center' }}>
                                    <span className="lock-icon-text">🔒 Read-Only</span>
                                    </td>
                                )}
                                </tr>
                            ))
                            ) : (
                            <tr>
                                <td colSpan={filterType === "Both" || filterType === "All" ? 6 : 5} className="empty-row">
                                No records match your filters.
                                </td>
                            </tr>
                            )}
                        </tbody>
                        </table>
                    {/* 📟 PAGINATION CONTROLS */}
                    {!loading && totalPages > 1 && (
                        <div className="msec-pagination">
                            <div className="pagination-info">
                                Showing <strong>{indexOfFirstItem + 1}</strong> to <strong>{Math.min(indexOfLastItem, filteredList.length)}</strong> of {filteredList.length} PDLs
                            </div>
                            <div className="pagination-buttons">
                                <button
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(prev => prev - 1)}
                                    className="pag-btn"
                                >
                                    Previous
                                </button>
                                <span className="page-number">Page {currentPage} of {totalPages}</span>
                                <button
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage(prev => prev + 1)}
                                    className="pag-btn"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* CONFIRMATION MODAL */}
            {alert.show && (
                <div className="msec-modal-overlay">
                    <div className={`msec-modal-card msec-alert-${alert.type}`}>
                        <h3>{alert.title}</h3>
                        <p>{alert.message}</p>
                        <div className="msec-modal-actions">
                            <button className="msec-btn-cancel" onClick={() => setAlert({ show: false })}>
                                Cancel
                            </button>
                            <button className="msec-btn-confirm" onClick={alert.onConfirm}>
                                Confirm Action
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Msec;