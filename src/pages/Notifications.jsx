import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  fetchNotifications, 
  markNotificationRead, 
  markAllNotificationsRead 
} from '../features/notifications/notificationSlice';
import { TableSkeleton } from '../components/LoadingSkeleton';
import { Bell, Check, CheckCheck, Clock, ShieldAlert } from 'lucide-react';
import { toast } from 'react-toastify';

const Notifications = () => {
  const dispatch = useDispatch();
  const { notifications, unreadCount, loading } = useSelector((state) => state.notifications);

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  const handleMarkRead = (id) => {
    dispatch(markNotificationRead(id));
  };

  const handleMarkAllRead = () => {
    dispatch(markAllNotificationsRead());
    toast.success('All notifications cleared as read.');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      
      {/* Header and Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            You have {unreadCount} unread system alerts in your inbox.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="inline-flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Mark all read</span>
          </button>
        )}
      </div>

      {/* Main List */}
      {loading ? (
        <TableSkeleton rows={5} />
      ) : notifications.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 rounded-2xl shadow-sm">
          <Bell className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
          <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">Clean Inbox</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            You don't have any notifications at the moment.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 rounded-2xl shadow-sm overflow-hidden divide-y divide-slate-100 dark:divide-slate-800/60">
          {notifications.map((item) => (
            <div
              key={item._id}
              onClick={() => { if (!item.read) handleMarkRead(item._id); }}
              className={`p-5 flex items-start space-x-4 transition-colors cursor-pointer ${
                item.read 
                  ? 'hover:bg-slate-50/50 dark:hover:bg-slate-800/10' 
                  : 'bg-brand-50/20 dark:bg-brand-950/10 hover:bg-brand-50/40 dark:hover:bg-brand-950/20 border-l-2 border-brand-500'
              }`}
            >
              {/* Left Action Icon indicator */}
              <div className={`p-2 rounded-xl mt-0.5 ${
                item.read 
                  ? 'bg-slate-50 text-slate-400 dark:bg-slate-800' 
                  : 'bg-brand-50 text-brand-500 dark:bg-brand-950/40'
              }`}>
                <ShieldAlert className="w-4 h-4" />
              </div>

              {/* Message details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-4">
                  <h5 className={`text-sm font-bold ${item.read ? 'text-slate-700 dark:text-slate-300' : 'text-slate-800 dark:text-white'}`}>
                    {item.title}
                  </h5>
                  <div className="flex items-center space-x-1 text-[10px] text-slate-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>
                      {new Date(item.createdAt).toLocaleDateString()} at {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                  {item.message}
                </p>

                {/* Sender card profile */}
                {item.sender && (
                  <div className="flex items-center space-x-2 mt-3 text-[10px] text-slate-400 font-semibold">
                    <span>From:</span>
                    <img
                      src={item.sender.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=40&h=40&q=80'}
                      alt={item.sender.name}
                      className="w-5.5 h-5.5 rounded-full object-cover"
                    />
                    <span className="text-slate-600 dark:text-slate-300">{item.sender.name} ({item.sender.role})</span>
                  </div>
                )}
              </div>

              {/* Status Action dot */}
              <div className="flex items-center justify-center self-center pl-2">
                {item.read ? (
                  <span className="h-2 w-2 rounded-full bg-slate-300 dark:bg-slate-700"></span>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMarkRead(item._id);
                    }}
                    className="p-1 bg-brand-50 hover:bg-brand-100 text-brand-600 rounded-full transition-colors border border-brand-100"
                    title="Mark as read"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default Notifications;
