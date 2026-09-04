import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import FarmerSidebar from '../../components/farmer/FarmerSidebar';
import { fetchFarmerOrders, updateOrderStatus, formatCurrency } from '../../services/farmerService';
import {
  ShoppingCart, Search, Filter, Clock, CheckCircle2,
  Package, Truck, ArrowRight, AlertCircle, Menu,
  ChevronDown, ChevronUp, MapPin, Phone, User, RefreshCw
} from 'lucide-react';

const STATUS_TABS = ['All', 'Order Placed', 'Confirmed', 'Packed', 'Shipped', 'Delivered'];

const NEXT_STATUS = {
  'Order Placed': { next: 'Confirmed', label: 'Confirm Order', color: 'bg-blue-600 hover:bg-blue-700' },
  'Confirmed': { next: 'Packed', label: 'Mark Packed', color: 'bg-purple-600 hover:bg-purple-700' },
  'Packed': { next: 'Shipped', label: 'Mark Shipped', color: 'bg-amber-600 hover:bg-amber-700' },
  'Shipped': { next: 'Delivered', label: 'Mark Delivered', color: 'bg-emerald-600 hover:bg-emerald-700' },
};

const getStatusBadge = (status) => {
  switch (status) {
    case 'Delivered':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'Shipped':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'Packed':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'Confirmed':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};

const FarmerOrders = () => {
  const { user } = useContext(AuthContext);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [expandedOrders, setExpandedOrders] = useState({});

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetchFarmerOrders();
      setOrders(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to load farmer orders:', err);
      setError('Could not load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleStatusUpdate = async (orderId, nextStatus) => {
    try {
      setUpdatingId(orderId);
      await updateOrderStatus(orderId, nextStatus);
      // Update locally
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, order_status: nextStatus } : o))
      );
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update order status');
    } finally {
      setUpdatingId(null);
    }
  };

  const toggleExpand = (id) => {
    setExpandedOrders((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredOrders = orders.filter((o) => {
    const matchesTab = activeTab === 'All' || o.order_status === activeTab;
    const s = searchTerm.toLowerCase();
    const matchesSearch =
      (o._id && o._id.toLowerCase().includes(s)) ||
      (o.customer_name && o.customer_name.toLowerCase().includes(s)) ||
      (o.shipping_address?.city && o.shipping_address.city.toLowerCase().includes(s));
    return matchesTab && matchesSearch;
  });

  const countByStatus = (status) => {
    if (status === 'All') return orders.length;
    return orders.filter((o) => o.order_status === status).length;
  };

  return (
    <div className="flex min-h-screen bg-surface-50">
      <FarmerSidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-100 px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <Menu className="w-5 h-5 text-slate-600" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-slate-900 leading-tight">Order Fulfillment</h1>
              <p className="text-xs text-slate-400">Track and dispatch incoming customer orders</p>
            </div>
          </div>
          <button
            onClick={loadOrders}
            className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 transition-colors"
            title="Refresh orders"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-agri-green' : ''}`} />
          </button>
        </header>

        <main className="flex-1 p-4 sm:p-6 space-y-6 max-w-[1400px] w-full mx-auto">
          {/* Status Tabs & Search */}
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by Order ID, Customer..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-agri-green/20 focus:border-agri-green"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none w-full md:w-auto">
                {STATUS_TABS.map((tab) => {
                  const count = countByStatus(tab);
                  return (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                        activeTab === tab
                          ? 'bg-agri-green text-white shadow-sm'
                          : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <span>{tab}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                          activeTab === tab ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Orders List */}
          {loading ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-sm">
              <RefreshCw className="w-8 h-8 text-agri-green animate-spin mx-auto mb-3" />
              <p className="text-sm text-slate-500">Loading incoming orders...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
              <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
              <p className="text-sm font-semibold text-red-800">{error}</p>
              <button
                onClick={loadOrders}
                className="mt-3 px-4 py-1.5 bg-white border border-red-200 text-red-600 rounded-xl text-xs font-semibold"
              >
                Retry
              </button>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-sm">
              <ShoppingCart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">No orders found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                {searchTerm || activeTab !== 'All'
                  ? 'No orders match the selected filters.'
                  : 'You have no customer orders yet. Once a customer buys your fresh harvest, it will appear here.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => {
                const nextAction = NEXT_STATUS[order.order_status];
                const isUpdating = updatingId === order._id;
                const isExpanded = Boolean(expandedOrders[order._id]);
                const orderShortId = order._id ? order._id.slice(-6).toUpperCase() : '------';
                const createdDate = order.created_at ? new Date(order.created_at).toLocaleString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                }) : 'Recently';

                return (
                  <div
                    key={order._id}
                    className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden transition-all"
                  >
                    {/* Main Card Header */}
                    <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-50">
                      <div className="flex items-start sm:items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-agri-green flex items-center justify-center font-bold text-sm shrink-0">
                          <ShoppingCart className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-slate-900 text-sm">Order #{orderShortId}</span>
                            <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold border ${getStatusBadge(order.order_status)}`}>
                              {order.order_status}
                            </span>
                            <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${order.payment_status === 'Paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                              {order.payment_status || 'Pending'} ({order.payment_method || 'COD'})
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            {createdDate}
                          </p>
                        </div>
                      </div>

                      {/* Right Action & Amount */}
                      <div className="flex items-center justify-between md:justify-end gap-4 pt-2 md:pt-0 border-t md:border-t-0 border-slate-50">
                        <div className="text-left md:text-right">
                          <p className="text-xs text-slate-400 font-medium">Order Total</p>
                          <p className="text-base font-bold text-slate-900">{formatCurrency(order.total_amount)}</p>
                        </div>

                        {nextAction ? (
                          <button
                            onClick={() => handleStatusUpdate(order._id, nextAction.next)}
                            disabled={isUpdating}
                            className={`px-4 py-2 rounded-xl text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 ${nextAction.color} disabled:opacity-50`}
                          >
                            {isUpdating ? (
                              <>
                                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Updating...
                              </>
                            ) : (
                              <>
                                <span>{nextAction.label}</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </>
                            )}
                          </button>
                        ) : order.order_status === 'Delivered' ? (
                          <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 px-3 py-1.5 bg-emerald-50 rounded-xl">
                            <CheckCircle2 className="w-4 h-4" />
                            Delivered
                          </div>
                        ) : null}

                        <button
                          onClick={() => toggleExpand(order._id)}
                          className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Expandable Order Details */}
                    {isExpanded && (
                      <div className="p-4 sm:p-5 bg-slate-50/70 border-t border-slate-100 space-y-4">
                        {/* Customer & Shipping Details */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                          <div className="bg-white p-3.5 rounded-xl border border-slate-100 space-y-1.5">
                            <p className="font-bold text-slate-800 flex items-center gap-1.5">
                              <User className="w-3.5 h-3.5 text-slate-400" />
                              Customer Information
                            </p>
                            <p className="text-slate-700 font-medium">{order.customer_name || 'AgriLink Customer'}</p>
                            {order.shipping_address?.phone && (
                              <p className="text-slate-500 flex items-center gap-1">
                                <Phone className="w-3 h-3 text-slate-400" />
                                {order.shipping_address.phone}
                              </p>
                            )}
                          </div>

                          <div className="bg-white p-3.5 rounded-xl border border-slate-100 space-y-1.5">
                            <p className="font-bold text-slate-800 flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" />
                              Delivery Destination
                            </p>
                            <p className="text-slate-600">
                              {order.shipping_address?.street || 'Local Address'}, {order.shipping_address?.city || ''} {order.shipping_address?.state || ''} {order.shipping_address?.pincode ? `- ${order.shipping_address.pincode}` : ''}
                            </p>
                          </div>
                        </div>

                        {/* Order Items Table */}
                        <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
                          <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase">
                            Ordered Items
                          </div>
                          <div className="divide-y divide-slate-100">
                            {(order.items || []).map((item, idx) => (
                              <div key={idx} className="p-3 flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-agri-green flex items-center justify-center font-bold text-xs">
                                    {idx + 1}
                                  </div>
                                  <div>
                                    <p className="font-semibold text-slate-800">{item.name || item.product_name || 'Farm Produce'}</p>
                                    <p className="text-[11px] text-slate-400">
                                      {item.quantity} {item.unit || 'kg'} × {formatCurrency(item.price)}
                                    </p>
                                  </div>
                                </div>
                                <span className="font-bold text-slate-900">
                                  {formatCurrency((item.price || 0) * (item.quantity || 1))}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default FarmerOrders;
