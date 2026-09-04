import React from 'react';
import { Link } from 'react-router-dom';
import { Bell, ArrowRight } from 'lucide-react';
import { markNotificationRead } from '../../services/farmerService';

const typeIcon = (type) => {
  if (type === 'order') return '🛒';
  if (type === 'alert') return '⚠️';
  if (type === 'promo') return '🎉';
  return '🔔';
};

const NotificationPreview = ({ notifications = [], loading = false, onRead }) => {
  const recent = notifications.slice(0, 5);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleRead = async (id) => {
    try {
      await markNotificationRead(id);
      onRead?.();
    } catch {
      /* silent */
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-premium p-6">
        <div className="w-40 h-5 bg-slate-100 rounded animate-pulse mb-4" />
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-12 bg-slate-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-premium p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-bold text-slate-900">Notifications</h3>
          {unreadCount > 0 && (
            <span className="w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </div>
        <Link
          to="/farmer/notifications"
          className="flex items-center gap-1 text-xs font-semibold text-agri-green hover:underline"
        >
          View All <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {recent.length === 0 ? (
        <div className="text-center py-8">
          <Bell className="w-8 h-8 text-slate-200 mx-auto mb-2" />
          <p className="text-slate-500 text-sm">No notifications</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {recent.map((n) => {
            const id = n._id || n.id;
            return (
              <div
                key={id}
                onClick={() => !n.read && handleRead(id)}
                className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                  n.read
                    ? 'border-slate-100 bg-white hover:bg-slate-50'
                    : 'border-emerald-100 bg-emerald-50/50 hover:bg-emerald-50'
                }`}
              >
                <span className="text-lg shrink-0 mt-0.5">{typeIcon(n.type)}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold truncate ${n.read ? 'text-slate-600' : 'text-slate-900'}`}>
                    {n.title}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{n.message}</p>
                </div>
                {!n.read && (
                  <span className="w-2 h-2 bg-emerald-500 rounded-full mt-1.5 shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default NotificationPreview;
