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
import Msec from "../pages/Msec";
import UserManagement from "../pages/UserManagement"; // 🎯 NEW
import AuditLogs from "../pages/AuditLogs";
import SessionDetails from "../pages/SessionDetails";
import ProtectedRoute from "../components/ProtectedRoute";

const AppRoutes = () => {
  return (
    <Routes>
      {/* 🔓 PUBLIC ROUTE */}
      <Route path="/" element={<Login />} />

      {/* 🔒 BASE PROTECTED: Must be logged in to see anything below */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          
          {/* 📊 Everyone can see the Dashboard */}
          <Route path="/dashboard" element={<Dashboard />} />

          {/* 👥 PDL MANAGEMENT BUCKET: Needs 'canview' */}
         {/* 🛡️ 1. THE VIEWERS: Admin, Warden, and Jail Officer can enter these */}
            <Route element={<ProtectedRoute moduleName="PDL & RFID Management" action="canview" />}>
                <Route path="/pdl" element={<PDLList />} />
                <Route path="/profile/:id" element={<Profile />} />
            </Route>

            {/* 🛡️ 2. THE EDITORS: Only Admin and Warden can enter here */}
            <Route element={<ProtectedRoute moduleName="PDL & RFID Management" action="canedit" />}>
                <Route path="/edit/:id" element={<EditPdl />} />
            </Route>

            {/* 🛡️ 3. THE CREATORS: Only Admin can enter here (if Officer/Warden cancreate is false) */}
            <Route element={<ProtectedRoute moduleName="PDL & RFID Management" action="cancreate" />}>
                <Route path="/add" element={<Add />} />
                <Route path="/recommit/:id" element={<Add />} />
            </Route>

          {/* ⏱️ PROGRAMS & SESSIONS: Needs 'canview' from Attendance Module */}
          <Route element={<ProtectedRoute moduleName="Attendance & Sessions" action="canview" />}>
             <Route path="/education" element={<Education />} />
             <Route path="/education/session/:id" element={<SessionDetails />} />
          </Route>

          {/* ⚠️ CONDUCT: Needs 'canview' from Conduct & Penalties */}
          <Route element={
            <ProtectedRoute 
              moduleName="Conduct & Penalties" 
              action="canapprove" 
            />
          }>
            <Route path="/incidents" element={<Incidents />} />
          </Route>

          {/* 📑 GCTA & REPORTS: Strictly for Admin/Warden ('canapprove') */}
          <Route element={
            <ProtectedRoute 
              moduleName="Time Allowance Computation (GCTA/TASTM)" 
              action="canapprove" 
            />
          }>
            <Route path="/reports" element={<Reports />} />
            <Route path="/msec" element={<Msec />} />
          </Route>

          {/* 👤 USER MANAGEMENT: Super Admin Only */}
          <Route element={<ProtectedRoute moduleName="User Management" action="cancreate" />}>
            <Route path="/addUser" element={<AddUser />} />
          </Route>
          <Route element={<ProtectedRoute moduleName="User Management" action="canview" />}>
            <Route path="/users" element={<UserManagement />} />
            <Route path="/audit-logs" element={<AuditLogs />} />
          </Route>

          {/* 🛡️ 2. THE CREATORS: Only those with 'cancreate' can reach the Add User form */}
          <Route element={<ProtectedRoute moduleName="User Management" action="cancreate" />}>
            <Route path="/addUser" element={<AddUser />} />
          </Route>

        </Route>
      </Route>
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;