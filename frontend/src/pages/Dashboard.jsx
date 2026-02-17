import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../apiConfig";
import "./dashboard.css"; 

const Dashboard = () => {
  const navigate = useNavigate();
 const [stats, setStats] = useState({
  totalPdl: 0,
  detained: 0,
  sentenced: 0,
  lockedCount: 0,
  frequentViolators: 0, // 🎯 Updated Key
  recentIncidents: []
});
  const [loading, setLoading] = useState(true);

  const user = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : { fullname: "Officer" };
  const MAX_CAPACITY = 200; // Adjusted for demo

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) { navigate("/"); return; }

        const response = await fetch(`${API_BASE_URL}/api/dashboard/stats`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await response.json();
        if (response.ok) setStats(data);
      } catch (error) { console.error("Error", error); }
      finally { setLoading(false); }
    };
    fetchStats();
  }, [navigate]);

  if (loading) return <div className="dashboard-loading"><div className="spinner"></div></div>;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1>Welcome, {user.fullname}</h1>
          <p>Meycauayan City Jail - GCTA Monitoring System</p>
        </div>
        <div className="date-badge">📅 {new Date().toLocaleDateString()}</div>
      </div>

      <div className="stats-grid">
        <div className="stat-card blue">
            <h3>Total Population</h3>
            <h1>{stats.totalPdl}</h1>
        </div>
        <div className="stat-card orange">
            <h3>Pending Cases</h3>
            <h1>{stats.detained}</h1>
        </div>
        <div className="stat-card green">
            <h3>Sentenced</h3>
            <h1>{stats.sentenced}</h1>
        </div>
        <div className="stat-card red">
            <h3>Frequent Violators</h3>
            <h1>{stats.frequentViolators}</h1>
        </div>
        {/* 🎯 IMPACT CARD: Shows the Locked GCTA count */}
        <div className="stat-card purple">
            <h3>GCTA Locked</h3>
            <h1 style={{color: '#7c3aed'}}>{stats.lockedCount}</h1>
            <p className="rpt-text-small">Disqualified PDLs</p>
        </div>
        {/* 🎯 REALISM CARD: Congestion Rate */}
        <div className="stat-card cyan">
            <h3>Facility Capacity</h3>
            <h1>{((stats.totalPdl / MAX_CAPACITY) * 100).toFixed(1)}%</h1>
            <div className="rpt-mini-progress">
                <div className="rpt-bar" style={{ width: `${(stats.totalPdl / MAX_CAPACITY) * 100}%` }}></div>
            </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="content-box table-section">
          <div className="box-header">
            <h3 className="rpt-h3">🚨 Recent Disciplinary Actions</h3>
            <button className="rpt-btn-view" onClick={() => navigate('/incidents')}>
              Log New Action
            </button>
          </div>
          {stats.recentIncidents.length === 0 ? (
            <div className="no-data"><p>✅ All PDLs are currently in good standing.</p></div>
          ) : (
            <table className="dashboard-table">
              <thead>
                <tr><th>PDL Name</th><th>Offense</th><th>End Date</th></tr>
              </thead>
              <tbody>
                {stats.recentIncidents.map((inc, i) => (
                  <tr key={i}>
                    <td>{inc.firstname} {inc.lastname}</td>
                    <td><span className={`badge ${inc.incidenttype === 'Grave' ? 'danger' : 'warning'}`}>{inc.incidenttype}</span></td>
                    <td>{new Date(inc.dateoccurred).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="content-box actions-section">
          <h3 className="ctb-h3">⚡ Quick Access</h3>
          <div className="action-buttons">
            <button className="action-btn" onClick={() => navigate('/add')}>➕ Inmate Profiling</button>
            <button className="action-btn" onClick={() => navigate('/incidents')}>📝 Record Violation</button>
            <button className="action-btn" onClick={() => navigate('/reports')}>📊 Eligibility Report</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;