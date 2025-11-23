import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./pdlList.css"; // We will create this next

const PdlList = () => {
  const navigate = useNavigate();
  const [pdlList, setPdlList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search States
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBlock, setFilterBlock] = useState("All");
  const DEFAULT_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23cbd5e1'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z'/%3E%3C/svg%3E";

  useEffect(() => {
    fetchPDLs();
  }, []);

  // Trigger search whenever term or list changes
  useEffect(() => {
    filterResults();
  }, [searchTerm, filterBlock, pdlList]);

  const fetchPDLs = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/pdl/getall", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setPdlList(data);
      setFilteredList(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  const filterResults = () => {
    let temp = pdlList;

    // 1. Search by Name
    if (searchTerm) {
      temp = temp.filter(pdl => 
        pdl.firstname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pdl.lastname.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 2. Filter by Cell Block
    if (filterBlock !== "All") {
      temp = temp.filter(pdl => pdl.cellblock === filterBlock);
    }

    setFilteredList(temp);
  };

  return (
    <div className="list-container">
      <div className="list-header">
        <div>
          <h2>📂 PDL Masterlist</h2>
          <p>Manage and view all registered inmates.</p>
        </div>
        <button className="btn-add" onClick={() => navigate("/add")}>
          + Add New PDL
        </button>
      </div>

      {/* === SEARCH & FILTER BAR === */}
      <div className="search-bar-container">
        <input 
          type="text" 
          placeholder="🔍 Search by name..." 
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        
        <select 
          className="filter-select"
          value={filterBlock}
          onChange={(e) => setFilterBlock(e.target.value)}
        >
          <option value="All">All Blocks</option>
          <option value="Block A">Block A</option>
          <option value="Block B">Block B</option>
          <option value="Block C">Block C</option>
        </select>
      </div>


      {loading ? (
        <p>Loading records...</p>
      ) : (
        <div className="table-wrapper">
          <table className="pdl-table">
            <thead>
              <tr>
                <th>Profile</th>
                <th>Name</th>
                <th>Cell Block</th>
                <th>Status</th>
                <th>Risk Level</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.length > 0 ? (
                filteredList.map((pdl) => (
                  <tr key={pdl.pdlid}>
                    <td>
                      <img 
                        src={pdl.profile_photo_url ? `http://localhost:5000${pdl.profile_photo_url}` : DEFAULT_AVATAR} 
                        alt="Profile"
                        className="table-avatar"
                        onError={(e) => { 
                          if (e.target.src !== DEFAULT_AVATAR) {
                            e.target.src = DEFAULT_AVATAR;
                          }
                        }} 
                      />
                    </td>
                    <td className="name-col">{pdl.lastname}, {pdl.firstname}</td>
                    <td>{pdl.cellblock}</td>
                    <td>
                      <span className={`status-badge ${pdl.casestatus === 'Sentenced' ? 'sentenced' : 'detained'}`}>
                        {pdl.casestatus}
                      </span>
                    </td>
                    <td>
                      <span className={`risk-dot ${pdl.risklevel === 'High' ? 'high' : 'low'}`}></span>
                      {pdl.risklevel || "N/A"}
                    </td>
                    <td>
                      <button className="btn-view" onClick={() => navigate(`/profile/${pdl.pdlid}`)}>
                        View Profile
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{textAlign: "center", padding: "20px"}}>
                    No records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PdlList;