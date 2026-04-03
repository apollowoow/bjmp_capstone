import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from "../apiConfig";
import "./msec.css";

const Msec = () => {
    const navigate = useNavigate();

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
        const actionType = isVoiding ? "disqualify" : "reenable";
        const endpoint = `${API_BASE_URL}/api/sessions/msec/${actionType}`;

        setAlert({
            show: true,
            title: isVoiding ? "Confirm Disqualification" : "Restore Credits",
            message: isVoiding
                ? `Void all credits for ${name} for ${selectedMonth}?`
                : `Restore and activate credits for ${name} for ${selectedMonth}?`,
            type: isVoiding ? "danger" : "info",
            onConfirm: async () => {
                try {
                    const token = localStorage.getItem("token");
                    const response = await fetch(endpoint, {
                        method: "POST",
                        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                        body: JSON.stringify({ pdl_id: pdlId, month_year: selectedMonth })
                    });
                    if (response.ok) {
                        setAlert({ show: false });
                        fetchEvaluation(); // Refresh data
                    }
                } catch (err) {
                    console.error(err);
                }
            }
        });
    };

    // --- ⚡ Filter & Pagination Logic ---
    const filteredList = evaluationList.filter(pdl => {
        const matchesSearch = pdl.last_name.toLowerCase().includes(searchTerm.toLowerCase()) || pdl.pdl_id.toString().includes(searchTerm);
        let matchesCategory = true;
        if (filterType === "GCTA") matchesCategory = Number(pdl.monthly_gcta) > 0;
        if (filterType === "TASTM") matchesCategory = Number(pdl.monthly_tastm) > 0;
        if (filterType === "Both") matchesCategory = Number(pdl.monthly_gcta) > 0 && Number(pdl.monthly_tastm) > 0;
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
                                <th>GCTA</th>
                                <th>TASTM</th>
                                <th>Total</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="6" className="loading-row">Syncing...</td></tr>
                            ) : currentItems.length > 0 ? (
                                currentItems.map(pdl => (
                                    <tr key={pdl.pdl_id} className={pdl.msec_status === 'Voided' ? 'row-voided' : ''}>
                                        <td>
                                            <div className="pdl-cell">
                                                <img src={`${API_BASE_URL}/public/uploads/${pdl.pdl_picture}`} onError={(e) => e.target.src = "/default-avatar.png"} alt="" />
                                                <div className="pdl-info">
                                                    <strong>{pdl.last_name}, {pdl.first_name}</strong>
                                                    <span>#{pdl.pdl_id}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td><span className="badge-gcta">+{pdl.monthly_gcta}</span></td>
                                        <td><span className="badge-tastm">+{pdl.monthly_tastm}</span></td>
                                        <td><strong className="total-days">+{Number(pdl.monthly_gcta) + Number(pdl.monthly_tastm)}</strong></td>
                                        <td>
                                           <span className={`msec-status-tag status-${pdl.msec_status.toLowerCase()}`}>
                                                    {pdl.msec_status === 'Active' ? '🟢 Active' : '🔴 Voided'}
                                                </span>
                                        </td>
                                        <td>
                                            {pdl.msec_status === 'Active' ? (
                                                <button className="btn-dq" onClick={() => handleAction(pdl.pdl_id, pdl.last_name, true)}>🚫 Void</button>
                                            ) : (
                                                <button className="btn-enable" onClick={() => handleAction(pdl.pdl_id, pdl.last_name, false)}>✅ Enable</button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="6" className="empty-row">No records match your filters.</td></tr>
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