import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  // 1. Check if Token exists in LocalStorage
  const token = localStorage.getItem("token");

  // 2. If no token, kick them out to Login Page ("/")
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // 3. If token exists, let them see the content (The Outlet)
  return <Outlet />;
};

export default ProtectedRoute;