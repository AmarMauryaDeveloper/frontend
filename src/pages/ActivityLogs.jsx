import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchActivityLogs } from '../features/activityLogs/activityLogSlice';
import { TableSkeleton } from '../components/LoadingSkeleton';
import { 
  Search, 
  History, 
  ChevronLeft, 
  ChevronRight,
  User,
  KeyRound,
  FileUp,
  FolderSync,
  XCircle,
  Clock
} from 'lucide-react';

const ACTION_COLORS = {
  PROJECT_CREATE: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30',
  STATUS_CHANGE: 'bg-brand-50 text-brand-700 border-brand-200 dark:bg-brand-950/20 dark:text-brand-400 dark:border-brand-900/30',
  PROJECT_UPDATE: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30',
  PROJECT_DELETE: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30',
  USER_CREATE: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-900/30',
  USER_UPDATE: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/20 dark:text-purple-400 dark:border-purple-900/30',
  USER_DELETE: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30',
  FILE_UPLOAD: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30',
  LOGIN: 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
  LOGOUT: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-850 dark:text-slate-400 dark:border-slate-800',
};

const ACTION_ICONS = {
  PROJECT_CREATE: FolderSync,
  STATUS_CHANGE: FolderSync,
  PROJECT_UPDATE: FolderSync,
  PROJECT_DELETE: XCircle,
  USER_CREATE: User,
  USER_UPDATE: User,
  USER_DELETE: XCircle,
  FILE_UPLOAD: FileUp,
  LOGIN: KeyRound,
  LOGOUT: KeyRound,
};

const ActivityLogs = () => {
  const dispatch = useDispatch();
  const { logs, pagination, loading } = useSelector((state) => state.activityLogs);

  // States
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);

  useEffect(() => {
    dispatch(fetchActivityLogs({ search, page, limit }));
  }, [dispatch, search, page, limit]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Search Filter bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        <div className="relative w-full md:w-96">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="w-4 h-4 text-slate-400" />
          </span>
          <input
            type="text"
            placeholder="Search by action, user or details..."
            value={search}
            onChange={handleSearchChange}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/40 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500 text-slate-800 dark:text-slate-200"
          />
        </div>

        <div className="flex items-center space-x-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
          <History className="w-4 h-4 text-slate-400" />
          <span>Audit Log contains {pagination.total} total occurrences</span>
        </div>

      </div>

      {/* Main Table view */}
      {loading ? (
        <TableSkeleton rows={7} />
      ) : logs.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 rounded-2xl shadow-sm">
          <History className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
          <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">No logs found</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Try adjusting your search criteria.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950/40 border-b border-slate-200/50 dark:border-slate-800/40 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Action</th>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4">Date & Time</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                {logs.map((item) => {
                  const ActionIcon = ACTION_ICONS[item.action] || History;
                  return (
                    <tr key={item._id} className="hover:bg-slate-50/40 dark:hover:bg-slate-950/10 transition-colors">
                      
                      {/* User Card */}
                      <td className="px-6 py-4">
                        {item.user ? (
                          <div className="flex items-center space-x-3">
                            <img
                              src={item.user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&h=80&q=80'}
                              alt={item.user.name}
                              className="w-8 h-8 rounded-full object-cover border"
                            />
                            <div>
                              <p className="font-bold text-slate-800 dark:text-white">{item.user.name}</p>
                              <span className="text-[10px] text-slate-400 block mt-0.5">{item.user.role}</span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Deleted User</span>
                        )}
                      </td>

                      {/* Action Type Badge */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold border ${ACTION_COLORS[item.action]}`}>
                          <ActionIcon className="w-3 h-3 mr-0.5" />
                          {item.action}
                        </span>
                      </td>

                      {/* Details */}
                      <td className="px-6 py-4 font-medium text-slate-600 dark:text-slate-300 max-w-sm truncate" title={item.details}>
                        {item.details}
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4 text-slate-400">
                        <div className="flex items-center space-x-1 text-[10px]">
                          <Clock className="w-3.5 h-3.5" />
                          <span>
                            {new Date(item.createdAt).toLocaleDateString()} at {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>

            </table>
          </div>
        </div>
      )}

      {/* Pagination Footer */}
      {logs.length > 0 && (
        <div className="flex items-center justify-between pt-6 border-t border-slate-200/50 dark:border-slate-800/40">
          
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400">Show:</span>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(parseInt(e.target.value, 10));
                setPage(1);
              }}
              className="py-1 px-2 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/40 rounded-lg text-xs font-medium"
            >
              <option value="10">10</option>
              <option value="15">15</option>
              <option value="30">30</option>
            </select>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Page {pagination.page} of {pagination.pages}
            </span>
            <div className="flex items-center space-x-1">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page === pagination.pages}
                onClick={() => setPage(page + 1)}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};

export default ActivityLogs;
