import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../apiConfig";
import "./dashboard.css"; 

const Dashboard = () => {
  const navigate = useNavigate();
  
  // Default State matches your backend response structure
  const [stats, setStats] = useState({
    totalPdl: 0,
    highRisk: 0,
    detained: 0,
    sentenced: 0,
    recentIncidents: []
  });
  
  const [loading, setLoading] = useState(true);

  // Get User Name from localStorage (safely)
  const user = localStorage.getItem("user") 
    ? JSON.parse(localStorage.getItem("user")) 
    : { fullname: "Officer" };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");

        // Security Check: Redirect if no token
        if (!token) {
          navigate("/");
          return;
        }

        // 👇 UPDATED URL to match your new route file
        const response = await fetch(`${API_BASE_URL}/api/dashboard/stats`, {
          method: "GET",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        });
        
        const data = await response.json();

        if (response.ok) {
          setStats(data);
        } else {
          console.error("Failed to fetch stats:", data.message);
          // Optional: Handle 401 Unauthorized
          if (response.status === 401) navigate("/");
        }
      } catch (error) {
        console.error("Error connecting to server", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [navigate]);

  if (loading) return (
    <div className="dashboard-loading">
      <div className="spinner"></div>
      <p>Loading Analytics...</p>
    </div>
  );

  return (
    <div className="dashboard-container">
      {/* === HEADER === */}
      <div className="dashboard-header">
        <div>
          <h1>Welcome back, {user.fullname}</h1>
          <p>System Overview & Facility Status</p>
        </div>
        <div className="date-badge">
          📅 {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* === STATS CARDS === */}
      <div className="stats-grid">
        <div className="stat-card blue">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <h3>Total Population</h3>
            <h1>{stats.totalPdl}</h1>
          </div>
        </div>

        <div className="stat-card orange">
          <div className="stat-icon">⚖️</div>
          <div className="stat-info">
            <h3>Pending Cases</h3>
            <h1>{stats.detained}</h1>
          </div>
        </div>

        <div className="stat-card green">
          <div className="stat-icon">🔒</div>
          <div className="stat-info">
            <h3>Sentenced</h3>
            <h1>{stats.sentenced}</h1>
          </div>
        </div>

        <div className="stat-card red">
          <div className="stat-icon">⚠️</div>
          <div className="stat-info">
            <h3>High Risk PDLs</h3>
            <h1>{stats.highRisk}</h1>
          </div>
        </div>
      </div>

      {/* === BOTTOM CONTENT SECTION === */}
      <div className="dashboard-content">
        
        {/* Left: Recent Incidents Table */}
        <div className="content-box table-section">
          <div className="box-header">
            <h3>🚨 Recent Incident Reports</h3>
            <button className="btn-link" onClick={() => navigate('/incidents')}>View All</button>
          </div>

          {stats.recentIncidents.length === 0 ? (
            <div className="no-data">
              <p>✅ No recent incidents recorded.</p>
            </div>
          ) : (
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>PDL Name</th>
                  <th>Incident Type</th>
                  <th>Date Occurred</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentIncidents.map((inc, index) => (
                  <tr key={index}>
                    <td style={{fontWeight: '600', color: '#334155'}}>
                      {inc.firstname} {inc.lastname}
                    </td>
                    <td>
                      <span className={`badge ${inc.incidenttype === 'Major' ? 'danger' : 'warning'}`}>
                        {inc.incidenttype}
                      </span>
                    </td>
                    <td>{new Date(inc.dateoccurred).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Right: Quick Actions Panel */}
        <div className="content-box actions-section">
          <h3>⚡ Quick Actions</h3>
          <div className="action-buttons">
            <button className="action-btn" onClick={() => navigate('/add')}>
              <span className="btn-icon">➕</span> Add New PDL Record
            </button>
            <button className="action-btn" onClick={() => navigate('/incidents')}>
              <span className="btn-icon">📝</span> Log New Incident
            </button>
            <button className="action-btn" onClick={() => navigate('/programs')}>
              <span className="btn-icon">🎓</span> Manage Programs
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;