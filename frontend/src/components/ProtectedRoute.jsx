import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div className="flex h-screen items-center justify-center font-bold text-slate-500">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const userRole = (user.role || '').toUpperCase();
  const normalizedAllowed = allowedRoles ? allowedRoles.map(r => r.toUpperCase()) : [];

  if (normalizedAllowed.length > 0 && !normalizedAllowed.includes(userRole)) {
    // Redirect to respective dashboard if unauthorized role
    if (userRole === 'FARMER') return <Navigate to="/farmer/dashboard" replace />;
    if (userRole === 'CUSTOMER') return <Navigate to="/customer/home" replace />;
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
