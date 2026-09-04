import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import CustomCursor from './components/common/CustomCursor';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CustomerHome from './pages/CustomerHome';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import CustomerOrders from './pages/CustomerOrders';

import FarmerDashboard from './pages/farmer/FarmerDashboard';
import FarmerProducts from './pages/farmer/FarmerProducts';
import AddProduct from './pages/farmer/AddProduct';
import FarmerOrders from './pages/farmer/FarmerOrders';
import FarmerEarnings from './pages/farmer/FarmerEarnings';
import FarmerProfitLoss from './pages/farmer/FarmerProfitLoss';
import FarmerNotifications from './pages/farmer/FarmerNotifications';
import FarmerProfile from './pages/farmer/FarmerProfile';

// Explore Redirect Helper Component
const ExploreRedirect = () => {
  const { user, loading } = useContext(AuthContext);
  if (loading) {
    return <div className="flex h-screen items-center justify-center text-slate-500 font-medium">Loading...</div>;
  }
  if (!user) {
    return <Navigate to="/login?redirect=/products#products-section" replace />;
  }
  const userRole = (user.role || '').toUpperCase();
  if (userRole === 'CUSTOMER') {
    return <Navigate to="/customer/home#products-section" replace />;
  }
  return <Navigate to="/products#products-section" replace />;
};

const App = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <CustomCursor />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/explore" element={<ExploreRedirect />} />
            
            {/* Public/Customer Browsable Products Routes */}
            <Route path="/products" element={<Products />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/customer/cart" element={<Cart />} />

            {/* Protected Routes for CUSTOMER */}
            <Route element={<ProtectedRoute allowedRoles={['CUSTOMER']} />}>
              <Route path="/customer/home" element={<CustomerHome />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/customer/orders" element={<CustomerOrders />} />
              <Route path="/customer/orders/:id" element={<CustomerOrders />} />
            </Route>

            {/* Protected Routes for FARMER */}
            <Route element={<ProtectedRoute allowedRoles={['FARMER']} />}>
              <Route path="/farmer/dashboard" element={<FarmerDashboard />} />
              <Route path="/farmer/products" element={<FarmerProducts />} />
              <Route path="/farmer/products/add" element={<AddProduct />} />
              <Route path="/farmer/products/:id/edit" element={<AddProduct />} />
              <Route path="/farmer/orders" element={<FarmerOrders />} />
              <Route path="/farmer/earnings" element={<FarmerEarnings />} />
              <Route path="/farmer/profit-loss" element={<FarmerProfitLoss />} />
              <Route path="/farmer/notifications" element={<FarmerNotifications />} />
              <Route path="/farmer/profile" element={<FarmerProfile />} />
            </Route>

            {/* Fallback Route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;
