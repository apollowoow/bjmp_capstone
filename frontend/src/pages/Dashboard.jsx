import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid 
} from 'recharts';
// 🎯 NEW: Professional Icons
import { 
  Users, AlertTriangle, ShieldAlert, Calendar, 
  Plus, ClipboardList, BarChart3, Zap, 
  History, UserPlus, FileEdit, Activity, ChevronRight
} from "lucide-react";
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
  const [recentLogs, setRecentLogs] = useState([]); // 🕵️‍♂️ Audit Log State
  const [loading, setLoading] = useState(true);

  const user = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : { fullname: "Officer" };
  const IDEAL_CAPACITY = 41;
  const hasSynced = useRef(false);

  // 🔄 BACKGROUND MASTER SYNC
  useEffect(() => {
    if (hasSynced.current) return;
    hasSynced.current = true;

    const runMasterSync = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json" 
        };

        const gctaRes = await fetch(`${API_BASE_URL}/api/sessions/silent-gcta-sync`, { method: "POST", headers });
        const gctaData = await gctaRes.json();
        const tastmRes = await fetch(`${API_BASE_URL}/api/sessions/silent-tastm-sync`, { method: "POST", headers });
        const tastmData = await tastmRes.json();

        if (gctaData.granted > 0 || tastmData.granted > 0) {
          console.log(`[Sync] GCTA: ${gctaData.granted} | TASTM: ${tastmData.granted} updates applied.`);
        }
      } catch (err) { console.error("Sync Error:", err); }
    };
    runMasterSync();
  }, []);

  // 📊 FETCH STATS & AUDIT LOGS
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) { navigate("/"); return; }

        const headers = { "Authorization": `Bearer ${token}` };

        // 1. Fetch Stats
        const statRes = await fetch(`${API_BASE_URL}/api/dashboard/stats`, { headers });
        const statData = await statRes.json();
        if (statRes.ok) setStats(statData);

        // 2. Fetch Recent Audit Logs (Limit to 5)
        const auditRes = await fetch(`${API_BASE_URL}/api/users/audit`, { headers });
        const auditData = await auditRes.json();
        if (auditRes.ok) setRecentLogs(auditData.slice(0, 5));

      } catch (error) { console.error("Data Fetch Error", error); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [navigate]);

  const populationData = [
    { name: "Detained", value: stats.detained, color: "#f59e0b" },
    { name: "Sentenced", value: stats.sentenced, color: "#10b981" }
  ];

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
        <div className="date-badge">
          <Calendar size={18} /> {new Date().toLocaleDateString()}
        </div>
      </div>

      <div className="charts-row">
        <div className="content-box chart-container">
          <h3 className="rpt-h3">PDL Population Breakdown</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={populationData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                {populationData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
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

      {/* 📈 STATS GRID WITH ICONS */}
      <div className="stats-grid">
        <div className="stat-card blue">
          <div className="stat-icon"><Users size={24} /></div>
          <div>
            <h3>Total PDL</h3>
            <h1>{stats.totalPdl}</h1>
          </div>
        </div>
        <div className="stat-card red">
          <div className="stat-icon"><AlertTriangle size={24} /></div>
          <div>
            <h3>Frequent Violators</h3>
            <h1>{stats.frequentViolators}</h1>
          </div>
        </div>
        <div className="stat-card purple">
          <div className="stat-icon"><ShieldAlert size={24} /></div>
          <div>
            <h3>GCTA Locked</h3>
            <h1 style={{color: '#7c3aed'}}>{stats.lockedCount}</h1>
            <p className="rpt-text-small">Disqualified PDLs</p>
          </div>
        </div>
      </div>

      <div className="dashboard-main-content">
        <div className="left-column">
          {/* 🚨 RECENT DISCIPLINARY ACTIONS */}
          <div className="content-box table-section">
            <div className="box-header">
              <h3 className="rpt-h3"><AlertTriangle size={20} className="header-icon" /> Recent Disciplinary Actions</h3>
              <button className="rpt-btn-view" onClick={() => navigate('/incidents')}>
                <Plus size={16} /> Log New Action
              </button>
            </div>
            {stats.recentIncidents.length === 0 ? (
              <div className="no-data"><p>✅ All PDLs are currently in good standing.</p></div>
            ) : (
              <table className="dashboard-table">
                <thead><tr><th>PDL Name</th><th>Offense</th><th>Date</th></tr></thead>
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

          {/* 🕵️‍♂️ NEW: RECENT AUDIT LOGS PREVIEW */}
          <div className="content-box audit-preview-section">
            <div className="box-header">
              <h3 className="rpt-h3"><History size={20} className="header-icon" /> Recent System Activities</h3>
              <button className="rpt-btn-view" onClick={() => navigate('/audit-logs')}>
                View Full Trail <ChevronRight size={16} />
              </button>
            </div>
            <div className="audit-list">
              {recentLogs.map((log, i) => (
                <div className="audit-item" key={i}>
                  <div className="audit-meta">
                    <span className="audit-op">{log.operator_name || "System"}</span>
                    <span className="audit-time">{new Date(log.created_at).toLocaleTimeString()}</span>
                  </div>
                  <div className="audit-action">
                    <Activity size={14} /> {log.action} on <code>{log.table_name}</code>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ⚡ QUICK ACCESS */}
        <div className="right-column">
          <div className="content-box actions-section">
            <h3 className="ctb-h3"><Zap size={20} className="header-icon" /> Quick Access</h3>
            <div className="action-buttons">
              <button className="action-btn" onClick={() => navigate('/add')}>
                <UserPlus size={20} /> PDL Profiling
              </button>
              <button className="action-btn" onClick={() => navigate('/incidents')}>
                <FileEdit size={20} /> Record Violation
              </button>
              <button className="action-btn" onClick={() => navigate('/reports')}>
                <BarChart3 size={20} /> Eligibility Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;