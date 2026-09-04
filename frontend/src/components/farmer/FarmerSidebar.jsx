import React, { useState, useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import {
  LayoutDashboard, PackagePlus, Package, ShoppingCart,
  DollarSign, TrendingUp, Bell, User, LogOut, Leaf, X, Menu
} from 'lucide-react';

const navLinks = [
  { to: '/farmer/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/farmer/products/add', icon: PackagePlus, label: 'Add Product' },
  { to: '/farmer/products', icon: Package, label: 'My Products' },
  { to: '/farmer/orders', icon: ShoppingCart, label: 'Orders' },
  { to: '/farmer/earnings', icon: DollarSign, label: 'Earnings' },
  { to: '/farmer/profit-loss', icon: TrendingUp, label: 'Profit & Loss' },
  { to: '/farmer/notifications', icon: Bell, label: 'Notifications' },
  { to: '/farmer/profile', icon: User, label: 'Profile' },
];

const FarmerSidebar = ({ mobileOpen, onClose }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white border-r border-slate-100">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-6 py-5 border-b border-slate-100">
        <div className="w-9 h-9 bg-gradient-to-br from-agri-green to-agri-dark rounded-xl flex items-center justify-center shadow-sm">
          <Leaf className="w-5 h-5 text-white" />
        </div>
        <div>
          <span className="font-black text-slate-900 text-lg leading-none">Agri</span>
          <span className="font-black text-agri-green text-lg leading-none">Link</span>
          <p className="text-[10px] text-slate-400 font-medium mt-0.5">Farm Dashboard</p>
        </div>
        {mobileOpen && (
          <button onClick={onClose} className="ml-auto p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        )}
      </div>

      {/* Farmer Quick Info */}
      {user && (
        <div className="mx-4 mt-4 mb-2 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-agri-green to-agri-dark rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
              {(user.name || 'F').charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-800 truncate">{user.name || 'Farmer'}</p>
              <p className="text-[10px] text-agri-green font-medium truncate">
                {user.farm_details?.farm_name || 'My Farm'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
        {navLinks.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/farmer/dashboard'}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-agri-green text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`
            }
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-slate-100">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all duration-200"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 h-screen sticky top-0 shadow-premium">
        <SidebarContent />
      </aside>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
          <aside className="relative w-72 h-full shadow-2xl">
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  );
};

export default FarmerSidebar;
