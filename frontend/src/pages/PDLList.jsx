import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../apiConfig";
import { 
  FolderOpen, UserPlus, Search, Filter, 
  Tag, ChevronLeft, ChevronRight, BarChart4,
  User, Database, Fingerprint
} from "lucide-react";
import "./pdlList.css"; 

const PdlList = () => {
  const navigate = useNavigate();
  const [pdlList, setPdlList] = useState([]);
  const [releasedList, setReleasedList] = useState([]);
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
  }, [statusFilter]);

  useEffect(() => {
    filterResults();
    setCurrentPage(1); // Reset to page 1 whenever search/filter changes
  }, [searchTerm, statusFilter, pdlList]);

  const fetchPDLs = async () => {
  try {
    setLoading(true);
    setPdlList([]); // 🧹 Clear old data so the user doesn't see "Detained" while loading "Released"
    
    const token = localStorage.getItem("token");
    const endpoint = statusFilter === "Released" 
      ? `${API_BASE_URL}/api/pdl/releaseall` 
      : `${API_BASE_URL}/api/pdl/getall`;

    const response = await fetch(endpoint, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) throw new Error(`Server error: ${response.status}`);
    const data = await response.json();

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
        {/* Header Section */}
        <div className="list-header">
          <div className="header-title-wrapper">
            <FolderOpen size={32} className="header-icon-main" />
            <div>
              <h2>PDL Profiling & Analytics</h2>
              <p><Database size={12} /> Managing {filteredList.length} Active Records</p>
            </div>
          </div>
          <button className="btn-add" onClick={() => navigate("/add")}>
            <UserPlus size={18} /> Register New PDL
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="search-bar-container">
          <div className="search-input-wrapper">
            <Search size={18} className="search-icon-inside" />
            <input 
              type="text" 
              placeholder="Search by name, ID, or scan RFID tag..." 
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="filter-wrapper">
            <Filter size={18} className="filter-icon-inside" />
            <select 
              className="filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Legal Statuses</option>
              <option value="Detained">Detained (Pending)</option>
              <option value="Sentenced">Sentenced (Convicted)</option>
              <option value="Released">Released</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="pdl-spinner"></div>
            Syncing with Secure Database...
          </div>
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
                            <div className="avatar-wrapper">
                              <img 
                                src={pdl.pdl_picture || DEFAULT_AVATAR} 
                                alt="Profile"
                                className="table-avatar"
                                onError={(e) => { e.target.src = DEFAULT_AVATAR; }} 
                              />
                            </div>
                            <span className="pdl-id-badge">#{pdl.pdl_id}</span>
                          </td>
                          <td className="name-col">
                            <div className="name-wrapper">
                              <strong>{pdl.last_name}, {pdl.first_name}</strong>
                              <span className="sub-info">
                                <User size={10} /> {age !== "N/A" ? `${age} yrs` : "Age Pending"} • {pdl.gender}
                              </span>
                            </div>
                          </td>
                          <td>
                            <div className="rfid-wrapper">
                              <Fingerprint size={14} color="#64748b" />
                              <code className="rfid-code">{pdl.rfid_number || "---"}</code>
                            </div>
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
                            <button 
                              className="btn-view" 
                              onClick={() => {
                                const isReleased = pdl.pdl_status === 'Released';
                                const path = isReleased 
                                  ? `/profile/${pdl.release_id}?type=released` 
                                  : `/profile/${pdl.pdl_id}`;
                                navigate(path);
                              }}
                            >
                              <BarChart4 size={14} /> Analyze
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

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="pagination-controls">
                <button 
                  className="page-btn" 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft size={16} /> Previous
                </button>
                <span className="page-info">
                  Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
                </span>
                <button 
                  className="page-btn" 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next <ChevronRight size={16} />
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