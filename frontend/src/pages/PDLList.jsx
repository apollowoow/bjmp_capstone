import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../apiConfig";
import "./pdlList.css"; 

const PdlList = () => {
  const navigate = useNavigate();
  const [pdlList, setPdlList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search and Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const DEFAULT_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23cbd5e1'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z'/%3E%3C/svg%3E";

  useEffect(() => {
    fetchPDLs();
  }, []);

  useEffect(() => {
    filterResults();
  }, [searchTerm, statusFilter, pdlList]);

  const fetchPDLs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      const response = await fetch(`${API_BASE_URL}/api/pdl/getall`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error(`Server error: ${response.status}`);

      const data = await response.json();
      setPdlList(data);
      setFilteredList(data);
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterResults = () => {
    let temp = pdlList;

    if (searchTerm) {
      temp = temp.filter(pdl => 
        pdl.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pdl.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pdl.pdl_id.toString().includes(searchTerm)
      );
    }

    if (statusFilter !== "All") {
      temp = temp.filter(pdl => pdl.pdl_status === statusFilter);
    }

    setFilteredList(temp);
  };

  return (
    <div className="pdl-list-scope"> {/* 🛡️ CSS SCOPE WRAPPER */}
      <div className="list-container">
        <div className="list-header">
          <div>
            <h2>📂 Inmate Profiling</h2>
            <p>Monitor active inmates and legal statuses.</p>
          </div>
          <button className="btn-add" onClick={() => navigate("/add")}>
            + Register New PDL
          </button>
        </div>

        <div className="search-bar-container">
          <input 
            type="text" 
            placeholder="🔍 Search by name or PDL ID..." 
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          
          <select 
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Detained">Detained</option>
            <option value="Sentenced">Sentenced</option>
          </select>
        </div>

        {loading ? (
          <div className="loading-state">Loading records from server...</div>
        ) : (
          <div className="table-wrapper">
            <table className="pdl-table">
              <thead>
                <tr>
                  <th>Profile</th>
                  <th>PDL ID</th>
                  <th>Full Name</th>
                  <th>Status</th>
                  <th>PNP Commitment Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredList.length > 0 ? (
                  filteredList.map((pdl) => (
                    <tr key={pdl.pdl_id}>
                      <td>
                        <img 
                          src={pdl.pdl_picture ? pdl.pdl_picture : DEFAULT_AVATAR} 
                          alt="Profile"
                          className="table-avatar"
                          onError={(e) => { e.target.src = DEFAULT_AVATAR; }} 
                        />
                      </td>
                      <td className="id-col">#{pdl.pdl_id}</td>
                      <td className="name-col">
                        <strong>{pdl.last_name}</strong>, {pdl.first_name} {pdl.middle_name || ""}
                      </td>
                      <td>
                        <span className={`status-badge ${pdl.pdl_status?.toLowerCase()}`}>
                          {pdl.pdl_status}
                        </span>
                      </td>
                      <td>
                        {pdl.date_commited_pnp ? (
                          new Date(pdl.date_commited_pnp).toLocaleDateString()
                        ) : (
                          <span className="warning-text">⚠️ Missing Date</span>
                        )}
                      </td>
                      <td>
                        <button className="btn-view" onClick={() => navigate(`/profile/${pdl.pdl_id}`)}>
                          View Profile
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="no-data">No matching inmate records found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PdlList;