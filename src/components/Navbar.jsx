import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation, Link } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import { 
  fetchNotifications, 
  markNotificationRead, 
  markAllNotificationsRead 
} from '../features/notifications/notificationSlice';
import { 
  Menu, 
  Sun, 
  Moon, 
  Bell, 
  CheckCheck,
  Search,
  ExternalLink
} from 'lucide-react';

const Navbar = ({ toggleSidebar }) => {
  const { theme, toggleTheme } = useTheme();
  const { unreadCount, notifications } = useSelector((state) => state.notifications);
  const { user } = useSelector((state) => state.auth);
  
  const dispatch = useDispatch();
  const location = useLocation();
  
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  // Handle outside clicks to close notifications dropdown
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Compute page title based on location
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.startsWith('/dashboard')) return 'Dashboard';
    if (path.startsWith('/projects')) return 'Projects';
    if (path.startsWith('/users')) return 'User Management';
    if (path.startsWith('/notifications')) return 'Notification Center';
    if (path.startsWith('/activity-logs')) return 'Activity Audit Logs';
    if (path.startsWith('/profile')) return 'My Profile';
    return 'Flow SaaS';
  };

  const handleMarkRead = (id, event) => {
    event.stopPropagation();
    dispatch(markNotificationRead(id));
  };

  const handleMarkAllRead = () => {
    dispatch(markAllNotificationsRead());
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/40 transition-colors duration-300">
      
      {/* Mobile Menu & Page Title */}
      <div className="flex items-center space-x-4">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-xl lg:hidden hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-xl font-bold font-display text-slate-800 dark:text-white capitalize">
            {getPageTitle()}
          </h2>
        </div>
      </div>

      {/* Global Actions */}
      <div className="flex items-center space-x-3">
        
        {/* Search bar - Visual Mock */}
        <div className="relative hidden md:block w-64 mr-2">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="w-4 h-4 text-slate-400" />
          </span>
          <input
            type="text"
            placeholder="Search projects, tasks..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/40 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 text-slate-800 dark:text-slate-200"
          />
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors duration-200"
          title="Toggle Theme"
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5 text-amber-500" />
          ) : (
            <Moon className="w-5 h-5 text-indigo-600" />
          )}
        </button>

        {/* Notification Bell Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors duration-200 relative"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white ring-2 ring-white dark:ring-slate-900 animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Dropdown Content */}
          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 md:w-96 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-3 duration-250">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/20">
                <span className="text-sm font-bold text-slate-800 dark:text-white">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="flex items-center space-x-1 text-xs text-brand-600 hover:text-brand-500 dark:text-brand-400 dark:hover:text-brand-300 font-medium"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Mark all read</span>
                  </button>
                )}
              </div>

              {/* List */}
              <div className="max-h-[350px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                {notifications.length === 0 ? (
                  <div className="py-10 text-center text-slate-400 dark:text-slate-500">
                    <p className="text-sm">All caught up! No notifications.</p>
                  </div>
                ) : (
                  notifications.slice(0, 10).map((item) => (
                    <div
                      key={item._id}
                      onClick={() => dispatch(markNotificationRead(item._id))}
                      className={`flex flex-col p-4 text-left transition-colors duration-150 cursor-pointer ${
                        item.read 
                          ? 'hover:bg-slate-50 dark:hover:bg-slate-800/20' 
                          : 'bg-brand-50/20 dark:bg-brand-950/10 hover:bg-brand-50/40 dark:hover:bg-brand-950/20 border-l-2 border-brand-500'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className={`text-xs font-semibold ${item.read ? 'text-slate-700 dark:text-slate-300' : 'text-brand-600 dark:text-brand-400'}`}>
                          {item.title}
                        </span>
                        {!item.read && (
                          <button
                            onClick={(e) => handleMarkRead(item._id, e)}
                            className="text-[10px] text-slate-400 hover:text-brand-500"
                            title="Mark as read"
                          >
                            Mark read
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                        {item.message}
                      </p>
                      <span className="text-[9px] text-slate-400 dark:text-slate-500 mt-2">
                        {new Date(item.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} • {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              <Link
                to="/notifications"
                onClick={() => setShowNotifications(false)}
                className="flex items-center justify-center space-x-1.5 py-3 text-xs font-bold text-slate-600 dark:text-slate-400 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950/40 dark:hover:bg-slate-950/70 border-t border-slate-100 dark:border-slate-800"
              >
                <span>View all in Notification Center</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          )}
        </div>

        {/* User Info Avatar Link */}
        <Link 
          to="/profile" 
          className="flex items-center border border-slate-200 dark:border-slate-800 rounded-full hover:ring-2 hover:ring-brand-500/20 transition-all duration-200"
        >
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&h=80&q=80'}
            alt="user avatar"
            className="w-8 h-8 rounded-full object-cover"
          />
        </Link>
      </div>
    </header>
  );
};

export default Navbar;
