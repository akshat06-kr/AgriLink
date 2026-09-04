import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import FarmerSidebar from '../../components/farmer/FarmerSidebar';
import {
  fetchNotifications, markNotificationRead, markAllNotificationsRead
} from '../../services/farmerService';
import {
  Bell, CheckCheck, ShoppingCart, Info, AlertTriangle,
  Clock, CheckCircle2, Menu, RefreshCw, ChevronRight
} from 'lucide-react';

const FarmerNotifications = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all' | 'unread'
  const [markingAll, setMarkingAll] = useState(false);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const res = await fetchNotifications();
      setNotifications(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkRead = async (id, link) => {
    try {
      await markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
      if (link) {
        navigate(link);
      }
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      setMarkingAll(true);
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      alert('Failed to mark all as read');
    } finally {
      setMarkingAll(false);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;
  const filtered = notifications.filter((n) => (filter === 'unread' ? !n.read : true));

  const getIcon = (type) => {
    switch (type) {
      case 'order':
        return <ShoppingCart className="w-5 h-5 text-emerald-600" />;
      case 'alert':
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-600" />;
      default:
        return <Bell className="w-5 h-5 text-blue-600" />;
    }
  };

  const getBg = (type) => {
    switch (type) {
      case 'order':
        return 'bg-emerald-50';
      case 'alert':
      case 'warning':
        return 'bg-amber-50';
      default:
        return 'bg-blue-50';
    }
  };

  return (
    <div className="flex min-h-screen bg-surface-50">
      <FarmerSidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-100 px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <Menu className="w-5 h-5 text-slate-600" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-slate-900 leading-tight">Notifications</h1>
              <p className="text-xs text-slate-400">Activity alerts, new orders & updates</p>
            </div>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              disabled={markingAll}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-agri-green rounded-xl text-xs font-semibold transition-all disabled:opacity-50"
            >
              <CheckCheck className="w-4 h-4" />
              <span>{markingAll ? 'Marking...' : 'Mark all as read'}</span>
            </button>
          )}
        </header>

        <main className="flex-1 p-4 sm:p-6 space-y-4 max-w-3xl w-full mx-auto">
          {/* Filters Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  filter === 'all'
                    ? 'bg-agri-green text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                All ({notifications.length})
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  filter === 'unread'
                    ? 'bg-agri-green text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                Unread ({unreadCount})
              </button>
            </div>

            <button
              onClick={loadNotifications}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-agri-green' : ''}`} />
            </button>
          </div>

          {/* List */}
          {loading ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-sm">
              <RefreshCw className="w-8 h-8 text-agri-green animate-spin mx-auto mb-2" />
              <p className="text-xs text-slate-500">Loading notifications...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-sm">
              <Bell className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-800">No notifications</p>
              <p className="text-xs text-slate-400 mt-1">
                {filter === 'unread' ? 'You are all caught up! No unread activity.' : 'No alerts recorded yet.'}
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-100 overflow-hidden">
              {filtered.map((item) => (
                <div
                  key={item._id}
                  onClick={() => handleMarkRead(item._id, item.link)}
                  className={`p-4 flex items-start gap-3.5 hover:bg-slate-50/80 cursor-pointer transition-all ${
                    !item.read ? 'bg-emerald-50/20' : ''
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${getBg(item.type)}`}>
                    {getIcon(item.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`text-sm ${!item.read ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'}`}>
                        {item.title}
                      </p>
                      {!item.read && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{item.message}</p>
                    <p className="text-[10px] text-slate-400 mt-1.5 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {item.created_at
                        ? new Date(item.created_at).toLocaleString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : 'Recently'}
                    </p>
                  </div>

                  {item.link && (
                    <ChevronRight className="w-4 h-4 text-slate-300 self-center shrink-0" />
                  )}
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default FarmerNotifications;
