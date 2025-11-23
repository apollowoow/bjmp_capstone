import React from 'react';
import { Routes, Route, Navigate } from "react-router-dom";

import Layout from "../components/Layout";
import Login from "../pages/Login";
import AddUser from "../pages/AddUser";
import Dashboard from "../pages/Dashboard"; 
import PDLList from "../pages/PDLList";
import Education from "../pages/Education";
import Incidents from "../pages/Incidents";
import Add from "../pages/Add";

// 👇 IMPORT THE GUARD
import ProtectedRoute from "../components/ProtectedRoute";

const AppRoutes = () => {
  return (
    <Routes>
      {/* PUBLIC ROUTE (Login) */}
      <Route path="/" element={<Login />} />

      {/* 👇 PROTECTED ROUTES WRAPPER */}
      <Route element={<ProtectedRoute />}>
        
        {/* INSIDE THE WALL: The Sidebar Layout */}
        <Route element={<Layout />}>
           <Route path="/dashboard" element={<Dashboard />} />
           <Route path="/add" element={<Add />} />
           <Route path="/addUser" element={<AddUser />} />
           <Route path="/pdl" element={<PDLList />} />
           <Route path="/education" element={<Education />} />
           <Route path="/incidents" element={<Incidents />} />
        </Route>

      </Route>
    </Routes>
  );
};

export default AppRoutes;