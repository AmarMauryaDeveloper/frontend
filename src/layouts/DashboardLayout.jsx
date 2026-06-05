import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { connectSocket, disconnectSocket } from '../services/socketService';
import { addNotificationReceived } from '../features/notifications/notificationSlice';
import { toast } from 'react-toastify';

const DashboardLayout = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Get current access token
  const token = localStorage.getItem('accessToken');

  useEffect(() => {
    if (isAuthenticated && token) {
      // Establish Socket connection
      const socket = connectSocket(token);

      // Listen for notification alerts
      socket.on('notification', (notification) => {
        // Dispatch to Redux to update unread badge counts immediately
        dispatch(addNotificationReceived(notification));

        // Trigger native Toast pop-up
        toast.info(
          <div className="text-xs">
            <p className="font-bold">{notification.title}</p>
            <p className="mt-0.5">{notification.message}</p>
          </div>
        );
      });

      return () => {
        disconnectSocket();
      };
    }
  }, [isAuthenticated, token, dispatch]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 transition-colors duration-300">
      
      {/* Sidebar Navigation */}
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main Panel Content */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        
        {/* Header Navigation */}
        <Navbar toggleSidebar={toggleSidebar} />

        {/* Routed Pages Outlet container */}
        <main className="flex-1 overflow-y-auto px-6 py-8 relative focus:outline-none">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
