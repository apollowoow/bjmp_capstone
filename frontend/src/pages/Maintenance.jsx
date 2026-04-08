import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
    Database, Camera, RotateCcw, ShieldAlert, Loader2, 
    AlertCircle, CheckCircle2, Clock, FileCode, Search, 
    Calendar, ChevronLeft, ChevronRight 
} from 'lucide-react';
import "./maintenance.css"; 
import API_BASE_URL from "../apiConfig";

const Maintenance = () => {
    const [backups, setBackups] = useState([]);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(null);
    const [status, setStatus] = useState({ show: false, type: '', message: '' });
    
    // 📂 Filtering & Pagination States
    const [searchQuery, setSearchQuery] = useState("");
    const [monthFilter, setMonthFilter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // 📂 Backup/Restore Flow States
    const [showNamingModal, setShowNamingModal] = useState(false);
    const [showConfirmBackup, setShowConfirmBackup] = useState(false);
    const [showConfirmRestore, setShowConfirmRestore] = useState(false);
    const [snapshotName, setSnapshotName] = useState("");
    const [selectedRestoreFile, setSelectedRestoreFile] = useState(null);

    // 🔒 Security Gate State
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [pendingAction, setPendingAction] = useState(null); 
    const [authPassword, setAuthPassword] = useState("");
    const [authError, setAuthError] = useState("");

    const fetchSnapshots = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE_URL}/api/maintenance/snapshots`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) setBackups(data);
        } catch (err) { console.error("Failed to fetch:", err); } 
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchSnapshots(); }, [fetchSnapshots]);

    // 🔍 SEARCH & FILTER LOGIC
    const filteredBackups = useMemo(() => {
    return backups
        .filter(file => {
            const matchesSearch = file.toLowerCase().includes(searchQuery.toLowerCase());
            
            // Extract month from filename: MCJ_Name_YYYY-MM-DD...
            const datePart = file.split('_').pop(); // Kunin yung timestamp (e.g., 2026-04-06...)
            const month = datePart.split('-')[1]; // Kunin yung MM part
            const matchesMonth = monthFilter === "all" || month === monthFilter;

            return matchesSearch && matchesMonth;
        })
        .sort((a, b) => {
            // Kunin uli yung timestamp part para sa sorting
            const timeA = a.split('_').pop();
            const timeB = b.split('_').pop();

            // 💡 DESCENDING ORDER (Latest first)
            // Ibabalik natin ang comparison ng B to A para ang pinakamalaking date ay nasa index 0
            return timeB.localeCompare(timeA);
        });
}, [backups, searchQuery, monthFilter]);

    // 🔢 PAGINATION LOGIC
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredBackups.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredBackups.length / itemsPerPage);
    
    const triggerStatus = (type, message) => {
        setStatus({ show: true, type, message });
        if (type !== 'restore-success') { // Don't auto-hide on restore success because of reload
            setTimeout(() => setStatus({ show: false, type: '', message: '' }), 4000);
        }
    };
    // 🛡️ AUTH HANDLER
    const handleVerifyAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setAuthError("");
        try {
            const token = localStorage.getItem("token");
            const authRes = await fetch(`${API_BASE_URL}/api/auth/verify-session-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ password: authPassword, module: "SYSTEM_MAINTENANCE" })
            });

            if (authRes.ok) {
                setShowAuthModal(false);
                pendingAction.type === 'BACKUP' ? executeBackup(pendingAction.data) : executeRestore(pendingAction.data);
            } else { setAuthError("Invalid Admin Password."); }
        } catch (err) { setAuthError("Auth Server Unreachable."); } 
        finally { setLoading(false); }
    };

    const executeBackup = async (name) => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE_URL}/api/maintenance/backup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ customName: name })
            });
            if (res.ok) {
                fetchSnapshots();
                triggerStatus('success', `Snapshot "${name}" has been safely archived in the vault.`);
            } else {
                triggerStatus('error', 'Failed to create snapshot. Please check server storage.');
            }
        } catch (err) {
            triggerStatus('error', 'Network error: Backend is unreachable.');
        } finally {
            setLoading(false);
        }
    };

    // 🔄 3. UPDATED: EXECUTE RESTORE (Removed alert + added delay before reload)
    const executeRestore = async (fileName) => {
        setActionLoading(fileName);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE_URL}/api/maintenance/restore`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ fileName })
            });

            if (res.ok) {
                triggerStatus('restore-success', 'System Rollback Successful. Synchronizing database state...');
                // 🎯 Give the user 3 seconds to read the success message before reloading
                setTimeout(() => {
                    window.location.reload();
                }, 3000);
            } else {
                triggerStatus('error', 'Critical: Restoration process failed.');
            }
        } catch (err) {
            triggerStatus('error', 'Critical: Connection lost during restoration.');
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className="mt-maintenance-scope">
            <header className="mt-page-header">
                <div className="mt-header-text">
                    <h1><Database size={32} /> System Maintenance</h1>
                    <p>Judicial Ledger Backup & Disaster Recovery Protocols</p>
                </div>
                <button className="mt-btn-primary" onClick={() => setShowNamingModal(true)}>
                    <Camera size={18} /> Create Manual Snapshot
                </button>
            </header>

            {/* 🔍 SEARCH & FILTERS BAR */}
            <div className="mt-toolbar">
                <div className="mt-search-wrapper">
                    <Search size={18} className="mt-search-icon" />
                    <input 
                        type="text" 
                        placeholder="Search snapshot name..." 
                        value={searchQuery}
                        onChange={(e) => {setSearchQuery(e.target.value); setCurrentPage(1);}}
                    />
                </div>
                <div className="mt-filter-wrapper">
                    <Calendar size={18} className="mt-filter-icon" />
                    <select value={monthFilter} onChange={(e) => {setMonthFilter(e.target.value); setCurrentPage(1);}}>
                        <option value="all">All Months</option>
                        <option value="01">January</option>
                        <option value="02">February</option>
                        <option value="03">March</option>
                        <option value="04">April</option>
                        <option value="05">May</option>
                        <option value="06">June</option>
                        <option value="07">July</option>
                        <option value="08">August</option>
                        <option value="09">September</option>
                        <option value="10">October</option>
                        <option value="11">November</option>
                        <option value="12">December</option>
                    </select>
                </div>
            </div>

            <div className="mt-card">
                <div className="mt-table-container">
                    <table className="mt-table">
                        <thead>
                            <tr>
                                <th>Snapshot Filename</th>
                                <th>Type</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentItems.map((file, idx) => (
                                <tr key={idx}>
                                    <td className="mt-filename"><FileCode size={16} /> <strong>{file}</strong></td>
                                    <td><span className="mt-type-label">SQL DUMP</span></td>
                                    <td><div className="mt-badge-success"><CheckCircle2 size={12} /> VERIFIED</div></td>
                                    <td>
                                        <button className="mt-btn-restore" onClick={() => {
                                            setSelectedRestoreFile(file);
                                            setShowConfirmRestore(true);
                                        }}>
                                            <RotateCcw size={14} /> Rollback
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* 🔢 PAGINATION CONTROLS */}
                <div className="mt-pagination">
                    <p>Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredBackups.length)} of {filteredBackups.length}</p>
                    <div className="mt-page-btns">
                        <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)}><ChevronLeft size={16}/></button>
                        <span>Page {currentPage} of {totalPages || 1}</span>
                        <button disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(prev => prev + 1)}><ChevronRight size={16}/></button>
                    </div>
                </div>
            </div>

            {/* 🏷️ MODAL: NAMING */}
            {showNamingModal && (
                <div className="mt-modal-overlay">
                    <div className="mt-modal-card">
                        <h2>Snapshot Label</h2>
                        <input type="text" placeholder="e.g., Pre_GCTA_Update" value={snapshotName} onChange={(e) => setSnapshotName(e.target.value)} autoFocus />
                        <div className="mt-modal-actions">
                            <button className="mt-btn-confirm" onClick={() => {setShowNamingModal(false); setShowConfirmBackup(true);}}>Next</button>
                            <button className="mt-btn-cancel" onClick={() => setShowNamingModal(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ❓ MODAL: CONFIRM BACKUP */}
            {showConfirmBackup && (
                <div className="mt-modal-overlay">
                    <div className="mt-modal-card">
                        <ShieldAlert size={40} className="mt-warn-icon" />
                        <h2>Create Backup?</h2>
                        <p>Label: <strong>{snapshotName}</strong></p>
                        <div className="mt-modal-actions">
                            <button className="mt-btn-confirm" onClick={() => {setShowConfirmBackup(false); setPendingAction({type:'BACKUP', data: snapshotName}); setShowAuthModal(true);}}>Yes</button>
                            <button className="mt-btn-cancel" onClick={() => setShowConfirmBackup(false)}>No</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ❓ MODAL: CONFIRM RESTORE */}
            {showConfirmRestore && (
                <div className="mt-modal-overlay">
                    <div className="mt-modal-card">
                        <RotateCcw size={40} className="mt-warn-icon" />
                        <h2>Confirm System Rollback?</h2>
                        <p>Target: <strong>{selectedRestoreFile}</strong></p>
                        <div className="mt-modal-actions">
                            <button className="mt-btn-confirm" onClick={() => {setShowConfirmRestore(false); setPendingAction({type:'RESTORE', data: selectedRestoreFile}); setShowAuthModal(true);}}>Yes, Rollback</button>
                            <button className="mt-btn-cancel" onClick={() => setShowConfirmRestore(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {/* 🔒 MODAL: PASSWORD AUTH */}
            {showAuthModal && (
                <div className="mt-modal-overlay">
                    <div className="mt-modal-card">
                        <ShieldAlert size={40} className="mt-warn-icon" />
                        <h2>Admin Verification</h2>
                        <form onSubmit={handleVerifyAuth}>
                            <input type="password" placeholder="Password" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} autoFocus required />
                            {authError && <span className="mt-error-text"><AlertCircle size={14} /> {authError}</span>}
                            <div className="mt-modal-actions">
                                <button type="submit" className="mt-btn-confirm">Verify</button>
                                <button type="button" className="mt-btn-cancel" onClick={() => setShowAuthModal(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {status.show && (
                <div className={`mt-status-toast ${status.type === 'error' ? 'mt-toast-error' : 'mt-toast-success'}`}>
                    <div className="mt-toast-content">
                        {status.type === 'error' ? <AlertCircle size={24} /> : <CheckCircle2 size={24} />}
                        <div className="mt-toast-text">
                            <strong>{status.type === 'error' ? 'System Error' : 'System Success'}</strong>
                            <p>{status.message}</p>
                        </div>
                    </div>
                    {/* Add a progress bar for extra "techy" look */}
                    <div className="mt-toast-progress"></div>
                </div>
            )}
        </div>
    );
};

export default Maintenance;