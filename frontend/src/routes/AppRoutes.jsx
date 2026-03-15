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
import Profile from "../pages/Profile"; 
import EditPdl from "../pages/EditPdl"; 
import Reports from "../pages/Reports";
import SessionDetails from "../pages/SessionDetails";
import ProtectedRoute from "../components/ProtectedRoute";

const AppRoutes = () => {
  return (
    <Routes>
      {/* PUBLIC ROUTE */}
      <Route path="/" element={<Login />} />

      {/* PROTECTED ROUTES */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
           <Route path="/dashboard" element={<Dashboard />} />
           <Route path="/add" element={<Add />} />
           <Route path="/addUser" element={<AddUser />} />
           <Route path="/pdl" element={<PDLList />} />
           <Route path="/profile/:id" element={<Profile />} />
           <Route path="/recommit/:id" element={<Add />} />

           {/* 👇 2. ADD THE DYNAMIC EDIT ROUTE */}
           <Route path="/edit/:id" element={<EditPdl />} />
            <Route path="/education/session/:id" element={<SessionDetails />} />
           <Route path="/education" element={<Education />} />
           <Route path="/incidents" element={<Incidents />} />
            <Route path="/reports" element={<Reports />} />
        </Route>
      </Route>
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;