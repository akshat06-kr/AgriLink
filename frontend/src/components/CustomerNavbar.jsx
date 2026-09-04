import React, { useState, useContext, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Leaf, 
  ShoppingBag, 
  ShoppingCart, 
  Bell, 
  User, 
  LogOut, 
  Menu, 
  X, 
  Search, 
  CheckCircle2, 
  Package, 
  Clock, 
  ChevronDown,
  LayoutDashboard,
  Sprout,
  ArrowRight
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import api from '../services/api';

const CustomerNavbar = ({ searchQuery = '', onSearchChange }) => {
  const { user, logout } = useContext(AuthContext);
  const { distinctItemsCount } = useContext(CartContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [localSearch, setLocalSearch] = useState(searchQuery || '');

  const profileRef = useRef(null);
  const notifRef = useRef(null);

  // Keep local search input synced with prop
  useEffect(() => {
    setLocalSearch(searchQuery || '');
  }, [searchQuery]);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (user) {
        try {
          const res = await api.get('/notifications');
          if (Array.isArray(res.data)) {
            setNotifications(res.data);
            const unread = res.data.filter(n => !n.read).length;
            setUnreadCount(unread);
          }
        } catch (err) {
          // Silent fallback
        }
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 20000);
    return () => clearInterval(interval);
  }, [user]);

  // Handle clicking outside dropdowns
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setProfileDropdownOpen(false);
    setMobileMenuOpen(false);
    navigate('/login');
  };

  const markNotificationAsRead = async (id, link) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => (n.id === id || n._id === id) ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
    setNotificationsOpen(false);
    if (link) {
      navigate(link);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    if (typeof onSearchChange === 'function') {
      onSearchChange(localSearch);
    }
    if (location.pathname !== '/customer/home' && location.pathname !== '/products') {
      navigate(`/customer/home?q=${encodeURIComponent(localSearch)}`);
    } else {
      const el = document.getElementById('products-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  const handleHomeClick = (e) => {
    e.preventDefault();
    if (typeof onSearchChange === 'function') {
      onSearchChange('');
    }
    const userRole = (user?.role || '').toUpperCase();
    const targetPath = userRole === 'FARMER' ? '/farmer/dashboard' : '/customer/home';
    if (location.pathname === targetPath || location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate(targetPath);
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 50);
    }
    setMobileMenuOpen(false);
  };

  const handleProductsClick = (e) => {
    e.preventDefault();
    const userRole = (user?.role || '').toUpperCase();
    const targetPath = userRole === 'CUSTOMER' ? '/customer/home#products-section' : '/products#products-section';
    if (location.pathname === '/customer/home' || location.pathname === '/' || location.pathname === '/products') {
      const el = document.getElementById('products-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: 600, behavior: 'smooth' });
      }
    } else {
      navigate(targetPath);
      setTimeout(() => {
        const el = document.getElementById('products-section');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
    setMobileMenuOpen(false);
  };

  const isCurrent = (path) => location.pathname === path;

  return (
    <nav className="bg-white/95 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-slate-100 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 py-3">
          
          {/* Logo & Primary Navigation Links */}
          <div className="flex items-center gap-6 lg:gap-8">
            <Link 
              to={(user?.role || '').toUpperCase() === 'FARMER' ? '/farmer/dashboard' : '/customer/home'} 
              onClick={handleHomeClick}
              className="flex items-center gap-2 group"
            >
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-agri-green flex items-center justify-center border border-emerald-100 group-hover:bg-agri-green group-hover:text-white transition-all duration-300 shadow-sm">
                <Leaf className="h-5 w-5 transform group-hover:scale-110 transition-transform" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-1">
                  Agri<span className="text-agri-green">Link</span>
                </span>
                <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 -mt-1">
                  {(user?.role || '').toUpperCase() === 'FARMER' ? 'Farmer Portal' : 'Customer Market'}
                </span>
              </div>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center space-x-1 lg:space-x-1.5">
              <Link 
                to="/customer/home" 
                onClick={handleHomeClick}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  isCurrent('/customer/home') 
                    ? 'bg-emerald-50 text-agri-green' 
                    : 'text-slate-600 hover:text-agri-green hover:bg-slate-50'
                }`}
              >
                Home
              </Link>
              <Link 
                to="/products" 
                onClick={handleProductsClick}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  isCurrent('/products') 
                    ? 'bg-emerald-50 text-agri-green' 
                    : 'text-slate-600 hover:text-agri-green hover:bg-slate-50'
                }`}
              >
                Products
              </Link>
              <Link 
                to={user?.role === 'FARMER' ? '/farmer/orders' : '/customer/orders'} 
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  isCurrent('/customer/orders') || isCurrent('/farmer/orders')
                    ? 'bg-emerald-50 text-agri-green' 
                    : 'text-slate-600 hover:text-agri-green hover:bg-slate-50'
                }`}
              >
                Orders
              </Link>

              {user?.role === 'FARMER' && (
                <Link 
                  to="/farmer/dashboard" 
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 flex items-center gap-1.5 ml-2 transition-all"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  Farmer Dashboard
                </Link>
              )}
            </div>
          </div>

          {/* Center Search Input */}
          <div className="hidden lg:flex flex-1 max-w-sm mx-6">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <input
                type="text"
                placeholder="Search vegetables, fruits, crops..."
                value={localSearch}
                onChange={(e) => {
                  setLocalSearch(e.target.value);
                  if (typeof onSearchChange === 'function') {
                    onSearchChange(e.target.value);
                  }
                }}
                className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-slate-100/90 hover:bg-slate-100 border border-transparent rounded-full focus:bg-white focus:border-agri-green focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-800 transition-all"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              {localSearch && (
                <button
                  type="button"
                  onClick={() => {
                    setLocalSearch('');
                    if (typeof onSearchChange === 'function') onSearchChange('');
                  }}
                  className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600 font-bold"
                >
                  ✕
                </button>
              )}
            </form>
          </div>

          {/* Right Action Icons & Profile */}
          <div className="flex items-center space-x-2 sm:space-x-3.5">
            
            {/* Notifications Dropdown */}
            {user && (
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="p-2.5 text-slate-600 hover:text-agri-green hover:bg-slate-100 rounded-2xl relative transition-colors"
                  title="Notifications"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center animate-pulse">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {notificationsOpen && (
                  <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-100 py-3 z-50 overflow-hidden">
                    <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                      <h3 className="font-bold text-slate-900 text-sm">Notifications</h3>
                      {unreadCount > 0 && (
                        <button 
                          onClick={markAllAsRead}
                          className="text-xs text-agri-green hover:underline font-semibold"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 text-xs">
                          <Bell className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                          No notifications right now
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div 
                            key={notif.id || notif._id} 
                            onClick={() => markNotificationAsRead(notif.id || notif._id, notif.link)}
                            className={`p-3.5 hover:bg-slate-50 cursor-pointer transition-colors ${!notif.read ? 'bg-emerald-50/50' : ''}`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="p-2 rounded-xl bg-emerald-100 text-agri-green shrink-0 mt-0.5">
                                <Package className="w-4 h-4" />
                              </div>
                              <div className="flex-1">
                                <p className="text-xs sm:text-sm font-bold text-slate-800">{notif.title}</p>
                                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{notif.message}</p>
                                <span className="text-[10px] text-slate-400 mt-1 block">
                                  {new Date(notif.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Shopping Cart Icon */}
            <Link 
              to="/customer/cart" 
              className="p-2.5 text-slate-600 hover:text-agri-green hover:bg-slate-100 rounded-2xl relative transition-colors flex items-center"
              title="View Cart"
              aria-label="View Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {distinctItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-agri-green text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-md">
                  {distinctItemsCount}
                </span>
              )}
            </Link>

            {/* Profile Dropdown / Auth Buttons */}
            {user ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 p-1 sm:px-3 sm:py-1.5 rounded-2xl hover:bg-slate-100 transition-colors border border-slate-200/80"
                >
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-agri-green to-agri-light text-white font-black flex items-center justify-center text-xs shadow-sm">
                    {user.name ? user.name[0].toUpperCase() : 'U'}
                  </div>
                  <div className="hidden sm:flex flex-col text-left">
                    <span className="text-xs font-bold text-slate-800 leading-tight line-clamp-1">{user.name}</span>
                    <span className="text-[10px] text-agri-green font-bold uppercase">{user.role}</span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-64 bg-white rounded-3xl shadow-2xl border border-slate-100 py-2 z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/70">
                      <p className="text-sm font-black text-slate-900">{user.name}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                      <span className="inline-block mt-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-agri-green">
                        Verified {user.role}
                      </span>
                    </div>

                    <div className="py-1">
                      {user.role === 'FARMER' ? (
                        <>
                          <Link
                            to="/farmer/dashboard"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-700 hover:bg-emerald-50 hover:text-agri-green transition-colors"
                          >
                            <LayoutDashboard className="w-4 h-4 text-emerald-600" />
                            Farmer Dashboard
                          </Link>
                          <Link
                            to="/farmer/products"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-700 hover:bg-emerald-50 hover:text-agri-green transition-colors"
                          >
                            <Package className="w-4 h-4 text-emerald-600" />
                            My Listed Harvest
                          </Link>
                          <Link
                            to="/farmer/profile"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-700 hover:bg-emerald-50 hover:text-agri-green transition-colors"
                          >
                            <User className="w-4 h-4 text-emerald-600" />
                            Farm Profile
                          </Link>
                        </>
                      ) : (
                        <>
                          <Link
                            to="/customer/home"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-700 hover:bg-emerald-50 hover:text-agri-green transition-colors"
                          >
                            <ShoppingBag className="w-4 h-4 text-emerald-600" />
                            Customer Market
                          </Link>
                          <Link
                            to="/customer/orders"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-700 hover:bg-emerald-50 hover:text-agri-green transition-colors"
                          >
                            <Package className="w-4 h-4 text-emerald-600" />
                            My Orders
                          </Link>
                          <Link
                            to="/customer/cart"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-700 hover:bg-emerald-50 hover:text-agri-green transition-colors"
                          >
                            <ShoppingCart className="w-4 h-4 text-emerald-600" />
                            My Cart ({distinctItemsCount})
                          </Link>
                        </>
                      )}
                    </div>

                    <div className="border-t border-slate-100 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs sm:text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Log Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link 
                  to="/login" 
                  className="text-xs sm:text-sm font-bold text-slate-700 hover:text-agri-green px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="btn-primary py-2 px-4 text-xs sm:text-sm font-bold rounded-xl"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Drawer Trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2.5 text-slate-700 hover:bg-slate-100 rounded-2xl transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-100 py-4 px-2 space-y-3 bg-white animate-fadeIn">
            {/* Mobile Search */}
            <form onSubmit={handleSearchSubmit} className="relative mb-3">
              <input
                type="text"
                placeholder="Search fresh produce..."
                value={localSearch}
                onChange={(e) => {
                  setLocalSearch(e.target.value);
                  if (typeof onSearchChange === 'function') onSearchChange(e.target.value);
                }}
                className="w-full pl-9 pr-4 py-2.5 text-xs bg-slate-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            </form>

            {/* Nav Grid */}
            <div className="grid grid-cols-2 gap-2">
              <Link
                to="/customer/home"
                onClick={handleHomeClick}
                className="flex items-center gap-2 p-3 rounded-2xl bg-slate-50 text-slate-800 font-bold text-xs hover:bg-emerald-50"
              >
                <ShoppingBag className="w-4 h-4 text-agri-green" />
                Home
              </Link>
              <Link
                to="/products"
                onClick={handleProductsClick}
                className="flex items-center gap-2 p-3 rounded-2xl bg-slate-50 text-slate-800 font-bold text-xs hover:bg-emerald-50"
              >
                <Leaf className="w-4 h-4 text-agri-green" />
                Products
              </Link>
              <Link
                to={user?.role === 'FARMER' ? '/farmer/orders' : '/customer/orders'}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 p-3 rounded-2xl bg-slate-50 text-slate-800 font-bold text-xs hover:bg-emerald-50"
              >
                <Package className="w-4 h-4 text-agri-green" />
                Orders
              </Link>
              <Link
                to="/customer/cart"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 p-3 rounded-2xl bg-slate-50 text-slate-800 font-bold text-xs hover:bg-emerald-50"
              >
                <ShoppingCart className="w-4 h-4 text-agri-green" />
                Cart ({distinctItemsCount})
              </Link>
            </div>

            {user?.role === 'FARMER' && (
              <Link
                to="/farmer/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between p-3 rounded-2xl bg-amber-50 text-amber-900 border border-amber-200 font-bold text-xs"
              >
                <span className="flex items-center gap-2">
                  <LayoutDashboard className="w-4 h-4 text-amber-600" />
                  Go to Farmer Dashboard
                </span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}

            {user ? (
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between px-2">
                <div>
                  <p className="text-xs font-bold text-slate-900">{user.name}</p>
                  <p className="text-[10px] text-slate-400">{user.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex gap-2 pt-2 border-t border-slate-100">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-1/2 text-center py-2.5 rounded-2xl border border-slate-200 text-xs font-bold text-slate-700"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-1/2 text-center py-2.5 rounded-2xl btn-primary text-xs font-bold"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default CustomerNavbar;
