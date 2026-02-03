import React, { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
const Dashboard = lazy(() => import("./pages/Dashboard"));
const UserManagement = lazy(() => import("./pages/ManageUser"));
const Login = lazy(() => import("./pages/Login"));
const Profile = lazy(() => import("./pages/Profile"));
const SSRSReports = lazy(() => import("./pages/SSRSReports"));
import { LoadingSpinner } from "./components/public/LoadingSpinner";
import { DashboardLayout } from "./components/layout/DashBoardLayout";
const NotFound = lazy(() => import("./pages/NotFound"));

const App: React.FC = () => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="ssrs-reports" element={<SSRSReports />} />
          <Route path="user-management" element={<UserManagement />} />
          <Route path="profile" element={<Profile />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
};

export default App;
