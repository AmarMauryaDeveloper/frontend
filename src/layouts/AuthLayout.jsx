import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

const AuthLayout = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 transition-colors duration-300 relative overflow-hidden">
      {/* Dynamic background accents */}
      <div className="absolute top-0 -left-4 w-96 h-96 bg-brand-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 dark:opacity-5 animate-blob"></div>
      <div className="absolute bottom-0 -right-4 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 dark:opacity-5 animate-blob animation-delay-2000"></div>

      <div className="w-full max-w-md bg-white/70 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/40 rounded-2xl shadow-xl p-8 hover-glow">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center space-x-2">
            <svg className="w-8 h-8 text-brand-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 3h18v18H3V3zm2 2v14h14V5H5zm2 2h10v2H7V7zm0 4h10v2H7v-2zm0 4h7v2H7v-2z"/>
            </svg>
            <span className="font-extrabold text-2xl tracking-tight bg-gradient-to-r from-brand-600 to-indigo-600 dark:from-brand-400 dark:to-indigo-400 bg-clip-text text-transparent">
              Flow SaaS
            </span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">
            Enterprise Project Management Platform
          </p>
        </div>
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
