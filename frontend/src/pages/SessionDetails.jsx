import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API_BASE_URL from "../apiConfig";
import "./education.css";

const SessionDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    // --- States ---
    const [attendees, setAttendees] = useState([]);
    const [sessionInfo, setSessionInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    
    // --- Pagination States ---
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5; // Shows 8 PDLs per page

    useEffect(() => {
        fetchSessionData();
    }, [id]);

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
                        
                        <h1>📜 Attendance Records</h1>
                        <p>Topic: <strong>{sessionInfo?.session_name || 'N/A'}</strong> | Date: {sessionInfo ? new Date(sessionInfo.session_date).toLocaleDateString() : ''}</p>
                    </div>
                    <div className="header-actions">
                         <span className="badge-program">{sessionInfo?.program_name}</span>
                    </div>
                </div>

                {/* 🛠️ Management Card */}
                <div className="section card">
                    <div className="card-header" style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '15px' }}>
                        <h2>👥 Attendees List</h2>
                        
                        {/* 🔍 Search Input */}
                        <div style={{ position: 'relative' }}>
                            <input 
                                type="text"
                                placeholder="Search Name or ID..."
                                className="manual-search-input"
                                style={{ width: '250px', marginBottom: 0 }}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
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
                                        <tr key={pdl.pdl_id}>
                                            <td>
                                                <img 
                                                    src={`${API_BASE_URL}/public/uploads/${pdl.pdl_picture}`} 
                                                    alt="PDL" 
                                                    className="mini-pdl-photo" 
                                                />
                                            </td>
                                            <td><strong>{pdl.last_name}, {pdl.first_name}</strong></td>
                                            <td><code style={{ fontSize: '0.8rem' }}>#{pdl.pdl_id}</code></td>
                                            <td>
                                                <input 
                                                    type="number" 
                                                    step="0.5"
                                                    className="manual-search-input"
                                                    style={{ width: '80px', margin: 0, textAlign: 'center', padding: '8px' }}
                                                    defaultValue={pdl.hours_attended}
                                                    onBlur={(e) => handleUpdateHours(pdl.pdl_id, e.target.value)}
                                                />
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                <span className="live-indicator" style={{ fontSize: '0.65rem' }}>VERIFIED</span>
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