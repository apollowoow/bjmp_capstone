import React from 'react';
import { Link } from 'react-router-dom';

const Forbidden = () => {
  return (
    <div style={{ textAlign: 'center', marginTop: '100px', padding: '20px' }}>
      <h1 style={{ fontSize: '72px', color: '#ef4444' }}>403</h1>
      <h2>Access Forbidden</h2>
      
      <Link to="/dashboard" style={{ color: '#3b82f6', textDecoration: 'underline' }}>
        Go back to Dashboard
      </Link>
    </div>
  );
};

export default Forbidden;