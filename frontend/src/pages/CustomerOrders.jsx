import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import CustomerNavbar from '../components/CustomerNavbar';
import Footer from '../components/Footer';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import {
  Package,
  Clock,
  CheckCircle2,
  Truck,
  MapPin,
  Calendar,
  AlertCircle,
  ChevronRight,
  ShoppingBag,
  RefreshCw,
  Sparkles,
  ArrowLeft
} from 'lucide-react';

const orderSteps = ['Order Placed', 'Confirmed', 'Packed', 'Shipped', 'Delivered'];

const CustomerOrders = () => {
  const { id: routeOrderId } = useParams();
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // Fetch customer orders
      const res = await api.get('/customer/orders');
      if (Array.isArray(res.data)) {
        setOrders(res.data);
        if (routeOrderId) {
          const matched = res.data.find(o => (o._id || o.id) === routeOrderId);
          if (matched) setSelectedOrder(matched);
        }
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      // Fallback endpoint try
      try {
        const fallbackRes = await api.get('/orders/customer');
        if (Array.isArray(fallbackRes.data)) {
          setOrders(fallbackRes.data);
        }
      } catch (e) {
        setError('Unable to load orders. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [routeOrderId]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filteredOrders = orders.filter(order => {
    if (statusFilter === 'All') return true;
    if (statusFilter === 'Active') return order.order_status !== 'Delivered';
    if (statusFilter === 'Delivered') return order.order_status === 'Delivered';
    return true;
  });

  const getStepIndex = (currentStatus) => {
    const idx = orderSteps.indexOf(currentStatus);
    return idx === -1 ? 0 : idx;
  };

  return (
    <div className="bg-surface-50 min-h-screen flex flex-col selection:bg-agri-green selection:text-white">
      <CustomerNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900">Your Farm Orders</h1>
            <p className="text-sm text-slate-500 mt-1">
              Track live farm harvest, packing, and direct delivery
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 bg-white p-1 rounded-2xl border border-slate-200 shadow-sm self-start sm:self-auto">
            {['All', 'Active', 'Delivered'].map((filter) => (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  statusFilter === filter
                    ? 'bg-agri-green text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-3xl p-6 border border-slate-200 animate-pulse space-y-4">
                <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                <div className="h-16 bg-slate-100 rounded-xl"></div>
                <div className="h-6 bg-slate-200 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-3xl p-8 text-center max-w-lg mx-auto my-8">
            <p className="text-red-700 font-semibold mb-3">{error}</p>
            <button onClick={fetchOrders} className="btn-primary py-2 px-5 text-sm inline-flex items-center gap-2">
              <RefreshCw className="w-4 h-4" /> Retry
            </button>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto my-8 shadow-sm">
            <div className="w-16 h-16 bg-emerald-50 text-agri-green rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">No Orders Found</h2>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              {statusFilter === 'All' 
                ? "You haven't placed any orders yet. Discover fresh harvest from local farmers!" 
                : `No ${statusFilter.toLowerCase()} orders found.`}
            </p>
            <Link to="/customer/home" className="btn-primary py-2.5 px-6 text-xs font-bold inline-flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" /> Explore Marketplace
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => {
              const orderId = order._id || order.id;
              const currentStepIdx = getStepIndex(order.order_status);
              const isDelivered = order.order_status === 'Delivered';

              return (
                <div 
                  key={orderId}
                  className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Order Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-black text-slate-900">
                          #{orderId.slice(-6).toUpperCase()}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          isDelivered 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {order.order_status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        Placed on {new Date(order.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                      </p>
                    </div>

                    <div className="text-left sm:text-right">
                      <span className="text-xs text-slate-400 block">Total Amount</span>
                      <span className="text-xl font-black text-slate-900">₹{order.total_amount.toFixed(2)}</span>
                      <span className="text-[10px] text-emerald-700 font-bold block">
                        Payment: {order.payment_method || 'Cash on Delivery'} ({order.payment_status})
                      </span>
                    </div>
                  </div>

                  {/* 5-Step Order Status Progress Bar */}
                  <div className="py-6 px-2">
                    <div className="relative">
                      {/* Line connecting steps */}
                      <div className="absolute top-4 left-4 right-4 h-1 bg-slate-100 -z-0">
                        <div 
                          className="h-full bg-agri-green transition-all duration-500"
                          style={{ width: `${(currentStepIdx / (orderSteps.length - 1)) * 100}%` }}
                        ></div>
                      </div>

                      {/* Step Bubbles */}
                      <div className="flex justify-between items-start relative z-10">
                        {orderSteps.map((step, idx) => {
                          const isDone = idx <= currentStepIdx;
                          const isCurrent = idx === currentStepIdx;

                          return (
                            <div key={step} className="flex flex-col items-center text-center max-w-[70px]">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                                isDone 
                                  ? 'bg-agri-green text-white shadow-sm' 
                                  : 'bg-slate-100 text-slate-400 border border-slate-200'
                              } ${isCurrent ? 'ring-4 ring-emerald-100' : ''}`}>
                                {isDone ? '✓' : idx + 1}
                              </div>
                              <span className={`text-[10px] sm:text-xs mt-2 font-bold leading-tight ${
                                isDone ? 'text-slate-900' : 'text-slate-400'
                              }`}>
                                {step}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Items List inside Order */}
                  <div className="pt-4 border-t border-slate-100">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                      Ordered Produce ({order.items.length})
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {order.items.map((it, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                          <img
                            src={it.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=150&q=80'}
                            alt={it.product_name}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 truncate">{it.product_name}</p>
                            <p className="text-[11px] text-slate-500">
                              {it.quantity} {it.unit || 'kg'} × ₹{it.price}
                            </p>
                            {it.farmer_name && (
                              <p className="text-[10px] text-emerald-700 font-semibold truncate">
                                Farm: {it.farmer_name}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Delivery Address Details */}
                    <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100/80">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                        <span className="font-semibold text-slate-700">Delivering to:</span> {order.delivery_address}
                      </span>
                      <Link 
                        to={`/products`} 
                        className="text-agri-green font-bold hover:underline mt-2 sm:mt-0"
                      >
                        Order Again →
                      </Link>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
};

export default CustomerOrders;
