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

  // 📄 PAGINATION STATES
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const DEFAULT_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23cbd5e1'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z'/%3E%3C/svg%3E";

  useEffect(() => {
    fetchPDLs();
  }, []);

  useEffect(() => {
    filterResults();
    setCurrentPage(1); // Reset to page 1 whenever search/filter changes
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

      
console.log("--- PDL BACKEND DATA ---");
    console.log("Raw Data Array:", data);
    if (data.length > 0) {
      console.log("First Item Picture Field:", data[0].pdl_picture);
      console.log("Full Image URL Example:", `${API_BASE_URL}/public/uploads/${data[0].pdl_picture}`);
    }
      setPdlList(data);
      
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterResults = () => {
    let temp = pdlList;
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      temp = temp.filter(pdl => 
        pdl.first_name.toLowerCase().includes(lowerSearch) ||
        pdl.last_name.toLowerCase().includes(lowerSearch) ||
        pdl.rfid_number?.toLowerCase().includes(lowerSearch) ||
        pdl.pdl_id.toString().includes(lowerSearch)
      );
    }
    if (statusFilter !== "All") {
      temp = temp.filter(pdl => pdl.pdl_status === statusFilter);
    }
    setFilteredList(temp);
  };

  // 🔢 PAGINATION LOGIC
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredList.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredList.length / itemsPerPage);

  const calculateAge = (birthday) => {
    if (!birthday) return "N/A";
    const birthDate = new Date(birthday);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    if (today < new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate())) age--;
    return age;
  };

  return (
    <div className="pdl-list-scope">
      <div className="list-container">
        <div className="list-header">
          <div>
            <h2>📂 Inmate Profiling & Analytics</h2>
            <p>Managing {filteredList.length} Active Records</p>
          </div>
          <button className="btn-add" onClick={() => navigate("/add")}>
            + Register New PDL
          </button>
        </div>

        <div className="search-bar-container">
          <input 
            type="text" 
            placeholder="🔍 Search by name, ID, or scan RFID tag..." 
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select 
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Legal Statuses</option>
            <option value="Detained">Detained (Pending)</option>
            <option value="Sentenced">Sentenced (Convicted)</option>
          </select>
        </div>

        {loading ? (
          <div className="loading-state">Syncing with Secure Database...</div>
        ) : (
          <>
            <div className="table-wrapper">
              <table className="pdl-table">
                <thead>
                  <tr>
                    <th>Identity</th>
                    <th>Full Name</th>
                    <th>RFID Tag</th>
                    <th>Status</th>
                    <th>Offense/Crime</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.length > 0 ? (
                    currentItems.map((pdl) => {
                      const age = calculateAge(pdl.birthday);
                      return (
                        <tr key={pdl.pdl_id}>
                          <td className="identity-cell">
                            <img 
                              src={pdl.pdl_picture || DEFAULT_AVATAR} 
                              alt="Profile"
                              className="table-avatar"
                              onError={(e) => { e.target.src = DEFAULT_AVATAR; }} 
                            />
                            <span className="pdl-id-badge">ID: {pdl.pdl_id}</span>
                          </td>
                          <td className="name-col">
                            <div className="name-wrapper">
                              <strong>{pdl.last_name}, {pdl.first_name}</strong>
                              <span className="sub-info">
                                {age !== "N/A" ? `${age} yrs` : "Age Pending"} • {pdl.gender}
                              </span>
                            </div>
                          </td>
                          <td>
                            <code className="rfid-code">{pdl.rfid_number || "---"}</code>
                          </td>
                          <td>
                            <span className={`status-badge ${pdl.pdl_status?.toLowerCase()}`}>
                              {pdl.pdl_status}
                            </span>
                          </td>
                          <td className="crime-col">
                            <span className="crime-text" title={pdl.crime_name}>
                              {pdl.crime_name || "Unclassified"}
                            </span>
                          </td>
                          <td>
                            <button className="btn-view" onClick={() => navigate(`/profile/${pdl.pdl_id}`)}>
                              Analyze
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="6" className="no-data">No PDL records match your search criteria.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* ⏭️ PAGINATION CONTROLS */}
            {totalPages > 1 && (
              <div className="pagination-controls">
                <button 
                  className="page-btn" 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                <span className="page-info">
                  Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
                </span>
                <button 
                  className="page-btn" 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PdlList;