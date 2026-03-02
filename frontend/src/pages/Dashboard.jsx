import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// 📊 Import Recharts components
import { 
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid 
} from 'recharts';
import API_BASE_URL from "../apiConfig";
import "./dashboard.css"; 

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalPdl: 0,
    detained: 0,
    sentenced: 0,
    lockedCount: 0,
    frequentViolators: 0,
    recentIncidents: []
  });
  const [loading, setLoading] = useState(true);

  const user = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : { fullname: "Officer" };
  const IDEAL_CAPACITY = 41; // 🎯 Revision requirement: Ideal Rate 

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

  // 🥧 Pie Chart Data: Population Breakdown
  const populationData = [
    { name: "Detained", value: stats.detained, color: "#f59e0b" },
    { name: "Sentenced", value: stats.sentenced, color: "#10b981" }
  ];

  // 📊 Bar Chart Data: Congestion Check 
  const congestionData = [
    { name: "Ideal Limit", count: IDEAL_CAPACITY, fill: "#94a3b8" },
    { name: "Current Population", count: stats.totalPdl, fill: stats.totalPdl > IDEAL_CAPACITY ? "#ef4444" : "#3b82f6" }
  ];

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

      {/* 📈 NEW VISUALS SECTION */}
      <div className="charts-row">
        <div className="content-box chart-container">
          <h3 className="rpt-h3">PDL Population Breakdown</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={populationData}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {populationData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="content-box chart-container">
          <h3 className="rpt-h3">Congestion Analysis (Ideal: {IDEAL_CAPACITY})</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={congestionData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" fontSize={12} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card blue">
            <h3>Total PDL</h3>
            <h1>{stats.totalPdl}</h1>
        </div>
        <div className="stat-card red">
            <h3>Frequent Violators</h3>
            <h1>{stats.frequentViolators}</h1>
        </div>
        <div className="stat-card purple">
            <h3>GCTA Locked</h3>
            <h1 style={{color: '#7c3aed'}}>{stats.lockedCount}</h1>
            <p className="rpt-text-small">Disqualified PDLs</p>
        </div>
      </div>

      <div className="dashboard-content">
        {/* 🚨 UNTOUCHED: Recent Disciplinary Actions */}
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

        {/* ⚡ UNTOUCHED: Quick Access */}
        <div className="content-box actions-section">
          <h3 className="ctb-h3">⚡ Quick Access</h3>
          <div className="action-buttons">
            <button className="action-btn" onClick={() => navigate('/add')}>➕ PDL Profiling</button>
            <button className="action-btn" onClick={() => navigate('/incidents')}>📝 Record Violation</button>
            <button className="action-btn" onClick={() => navigate('/reports')}>📊 Eligibility Report</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;