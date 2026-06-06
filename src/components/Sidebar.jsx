import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "../features/auth/authSlice";
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  Bell,
  History,
  UserCircle,
  LogOut,
  X,
} from "lucide-react";

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate("/login");
  };

  const navItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
      role: "All",
    },
    { name: "Projects", path: "/projects", icon: FolderKanban, role: "All" },
    { name: "Users", path: "/users", icon: Users, role: "Admin" },
    { name: "Notifications", path: "/notifications", icon: Bell, role: "All" },
    {
      name: "Activity Logs",
      path: "/activity-logs",
      icon: History,
      role: "Admin",
    },
    { name: "Profile", path: "/profile", icon: UserCircle, role: "All" },
  ];

  const filteredItems = navItems.filter(
    (item) => item.role === "All" || (user && user.role === item.role),
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-200/50 dark:border-slate-800/40 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-screen ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header Logo */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200/50 dark:border-slate-800/40">
          <div className="flex items-center space-x-2">
            <svg
              className="w-7 h-7 text-brand-500"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M3 3h18v18H3V3zm2 2v14h14V5H5zm2 2h10v2H7V7zm0 4h10v2H7v-2zm0 4h7v2H7v-2z" />
            </svg>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-brand-600 to-indigo-600 dark:from-brand-400 dark:to-indigo-400 bg-clip-text text-transparent">
              PPM System
            </span>
          </div>
          <button
            className="p-1.5 rounded-lg lg:hidden hover:bg-slate-100 dark:hover:bg-slate-800"
            onClick={toggleSidebar}
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* User Card info */}
        <div className="flex items-center space-x-3 p-4 mx-4 my-6 bg-slate-50 dark:bg-slate-950/40 border border-slate-200/40 dark:border-slate-800/20 rounded-xl">
          <img
            src={
              user?.avatar ||
              "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&h=80&q=80"
            }
            alt="avatar"
            className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-800"
          />
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold truncate text-slate-800 dark:text-slate-200">
              {user?.name}
            </h4>
            <span className="inline-flex px-2 py-0.5 text-[10px] font-medium rounded-full bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-400 mt-1">
              {user?.role}
            </span>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-800 dark:hover:text-slate-200 ${
                    isActive
                      ? "bg-brand-50/80 text-brand-600 dark:bg-brand-950/30 dark:text-brand-400 active-nav-glow shadow-sm border border-brand-100/40 dark:border-brand-900/20"
                      : "text-slate-500 dark:text-slate-400"
                  }`
                }
                onClick={() => {
                  if (window.innerWidth < 1024) toggleSidebar();
                }}
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer Logout Button */}
        <div className="p-4 border-t border-slate-200/50 dark:border-slate-800/40">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 w-full px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
