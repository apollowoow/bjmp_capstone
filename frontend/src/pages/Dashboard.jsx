import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,  
} from 'recharts';
// 🎯 NEW: Professional Icons
import { 
  Users, AlertTriangle, ShieldAlert, Calendar, 
  Plus, ClipboardList, BarChart3, Zap, 
  History, UserPlus, FileEdit, Activity, ChevronRight, Play, FileText, UserCog,
  Database,
} from "lucide-react";
import API_BASE_URL from "../apiConfig";
import "./dashboard.css"; 
import { usePermissions } from "../hooks/usePermission";

const Dashboard = () => {
  const navigate = useNavigate();
 const { user,isAdmin, isWarden, isOfficer } = usePermissions();
  const [stats, setStats] = useState({
    totalPdl: 0,
    detained: 0,
    sentenced: 0,
    lockedCount: 0,
    frequentViolators: 0,
    recentIncidents: [],
    nearReleaseList: []
  });
  const [recentLogs, setRecentLogs] = useState([]); // 🕵️‍♂️ Audit Log State
  const [loading, setLoading] = useState(true);


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
        
        
        if (statRes.ok) {
          // 🔍 DEBUG LOGS HERE
          console.log("📊 FULL STAT DATA:", statData);
          
          if (statData.nearReleaseList && statData.nearReleaseList.length > 0) {
            console.log("🕊️ SAMPLE RELEASE ITEM:", statData.nearReleaseList[0]);
            // Dito mo makikita kung pdl.releaseDate ba o pdl.expected_release_date ang key!
          }
          
          setStats(statData);
        }

        // 2. Fetch Recent Audit Logs
        const auditRes = await fetch(`${API_BASE_URL}/api/users/audit`, { headers });
        const auditData = await auditRes.json();
        if (auditRes.ok) setRecentLogs(auditData.slice(0, 4));
        

      } catch (error) { 
        console.error("🔥 Data Fetch Error:", error); 
      } finally { 
        setLoading(false); 
      }
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
          <p>Meycauayan City Jail - Time Allowance Monitoring System</p>
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
                    <Activity size={14} /> 
                    {log.action.replace(/_/g, ' ').charAt(0).toUpperCase() + log.action.replace(/_/g, ' ').slice(1)} 
                  </div>
                </div>
              ))}
            </div>
            
          </div>
            <div className="content-box table-section">
            <div className="box-header">
              <h3 className="rpt-h3"><AlertTriangle size={20} className="header-icon" /> Recent Disciplinary Records</h3>
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
        </div>

        {/* ⚡ QUICK ACCESS */}
        <div className="right-column">
          <div className="content-box actions-section">
  <h3 className="ctb-h3"><Zap size={20} className="header-icon" /> Quick Access</h3>
  <div className="action-buttons">
      
      {/* 👮‍♂️ JAIL OFFICER TOOLS (Officer and Admin can see) */}
      {(isOfficer ) && (
          <>
              <button className="action-btn" onClick={() => navigate('/education')}>
                  <Play size={20} color="#60a5fa" /> Start Session
              </button>
              <button className="action-btn" onClick={() => navigate('/add')}>
                  <UserPlus size={20} color="#60a5fa" /> Add New PDL
              </button>
          </>
      )}

      {/* 🦅 WARDEN TOOLS (Warden and Admin can see) */}
      {(isWarden ) && (
          <>
              <button className="action-btn" onClick={() => navigate('/reports')}>
                  <FileText size={20}  /> Generate Report
              </button>
              <button className="action-btn" onClick={() => navigate('/audit-logs')}>
                  <Activity size={20}  /> Audit Logs
              </button>
              <button className="action-btn" onClick={() => navigate('/integrity-audit')}>
                  <ShieldAlert size={20}  /> Integrity Audit
              </button>
          </>
      )}

      {/* 🛡️ ADMIN ONLY TOOLS */}
      {isAdmin && (
          <>
              <button className="action-btn" onClick={() => navigate('/incidents')}>
                  <AlertTriangle size={20}/> Record Incident
              </button>
              <button className="action-btn" onClick={() => navigate('/addUser')}>
                  <UserCog size={20} /> Add User
              </button>
              <button className="action-btn" onClick={() => navigate('/maintenance')}>
                  <Database size={20}  /> System Backup
              </button>
          </>
      )}
  </div>
</div>

          
         <div className="content-box compact-section">
  <div className="box-header">
    <h3 className="rpt-h3">
      <Users size={20} className="header-icon" /> 
      Priority Releases
    </h3>
    <button className="rpt-btn-view" onClick={() => navigate('/reports')}>
      Reports <ChevronRight size={14} />
    </button>
  </div>

  <div className="compact-list-container">
    {stats.nearReleaseList.length === 0 ? (
      <div className="no-data-compact">
        <p>No PDLs scheduled for release in the next 30 days.</p>
      </div>
    ) : (
      <div className="compact-scroll-area">
        {stats.nearReleaseList.map((pdl, i) => (
          <div className="compact-pdl-card" key={i}>
            <div className="pdl-main-info">
              <span className="pdl-name-text">
                {pdl.lastname}, {pdl.firstname}
              </span>
              <span className="pdl-sub-text">Expected Discharge</span>
            </div>
            <div className="pdl-date-badge">
              <Calendar size={12} />
              {new Date(pdl.releaseDate).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
              })}
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
</div>
          
          
          


        </div>
      </div>
    </div>
  );
};

export default Dashboard;