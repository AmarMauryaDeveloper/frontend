import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ThemeProvider } from './contexts/ThemeContext';

// Layout wrappers
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Auth Pages
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// Main Pages
import Dashboard from './pages/Dashboard';
import ProjectList from './pages/ProjectList';
import ProjectDetails from './pages/ProjectDetails';
import Users from './pages/Users';
import Notifications from './pages/Notifications';
import ActivityLogs from './pages/ActivityLogs';
import Profile from './pages/Profile';

// Helper component for Admin route protection
const AdminRoute = ({ children }) => {
  const { user } = useSelector((state) => state.auth);
  
  if (user && user.role !== 'Admin') {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

const App = () => {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          {/* Guest routes (Auth) */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
          </Route>

          {/* Protected routes */}
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            
            {/* Projects */}
            <Route path="/projects" element={<ProjectList />} />
            <Route path="/projects/:id" element={<ProjectDetails />} />
            
            {/* Notifications */}
            <Route path="/notifications" element={<Notifications />} />
            
            {/* Profile */}
            <Route path="/profile" element={<Profile />} />

            {/* Admin only paths */}
            <Route 
              path="/users" 
              element={
                <AdminRoute>
                  <Users />
                </AdminRoute>
              } 
            />
            <Route 
              path="/activity-logs" 
              element={
                <AdminRoute>
                  <ActivityLogs />
                </AdminRoute>
              } 
            />
          </Route>

          {/* Catch all / Redirects */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;
