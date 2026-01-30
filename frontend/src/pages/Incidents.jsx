import React from 'react';
import API_BASE_URL from "../apiConfig";

const Incidents = () => {
  return (
    <div className="page-content">
      <div className="page-header">
        <h1 className="page-title">⚠️ Incident Reports</h1>
        <button className="btn-danger">Report Incident</button>
      </div>

      <div className="incident-list">
        {/* Example Incident Item */}
        <div className="incident-card">
          <div className="incident-header">
             <strong>Fight / Assault</strong>
             <span className="date">Nov 21, 2024</span>
          </div>
          <p>Inmate Juan Dela Cruz involved in a verbal argument...</p>
          <span className="status-badge">Under Investigation</span>
        </div>
      </div>
    </div>
  );
};

export default Incidents;