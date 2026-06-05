import React from 'react';

export const CardSkeleton = () => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 rounded-xl p-6 space-y-4 animate-pulse">
      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3"></div>
      <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-1/2"></div>
      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full"></div>
    </div>
  );
};

export const TableSkeleton = ({ rows = 5 }) => {
  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 rounded-xl p-4 animate-pulse">
      <div className="flex border-b border-slate-200 dark:border-slate-800 pb-3 mb-3">
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4"></div>
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4"></div>
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4"></div>
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4"></div>
      </div>
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="flex py-3 space-x-4">
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4"></div>
        </div>
      ))}
    </div>
  );
};

export const ChartSkeleton = () => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 rounded-xl p-6 h-80 flex items-center justify-center animate-pulse">
      <div className="space-y-4 w-full">
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4 mx-auto"></div>
        <div className="flex items-end justify-center space-x-6 h-48 pt-4">
          <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded w-12"></div>
          <div className="h-36 bg-slate-200 dark:bg-slate-800 rounded w-12"></div>
          <div className="h-16 bg-slate-200 dark:bg-slate-800 rounded w-12"></div>
          <div className="h-40 bg-slate-200 dark:bg-slate-800 rounded w-12"></div>
          <div className="h-28 bg-slate-200 dark:bg-slate-800 rounded w-12"></div>
        </div>
      </div>
    </div>
  );
};
