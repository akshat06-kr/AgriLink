import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingCart } from 'lucide-react';
import { updateOrderStatus } from '../../services/farmerService';

const STATUS_STYLES = {
  'Order Placed': 'bg-blue-50 text-blue-600',
  'Confirmed': 'bg-indigo-50 text-indigo-600',
  'Packed': 'bg-purple-50 text-purple-600',
  'Shipped': 'bg-amber-50 text-amber-600',
  'Delivered': 'bg-emerald-50 text-emerald-700',
  'Cancelled': 'bg-red-50 text-red-600',
};

const NEXT_STATUS = {
  'Order Placed': 'Confirmed',
  'Confirmed': 'Packed',
  'Packed': 'Shipped',
  'Shipped': 'Delivered',
};

const OrderPreview = ({ orders = [], loading = false, onStatusUpdate }) => {
  const recent = orders.slice(0, 5);

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      onStatusUpdate?.();
    } catch (err) {
      console.error('Failed to update order status:', err);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-premium p-6">
        <div className="w-36 h-5 bg-slate-100 rounded animate-pulse mb-5" />
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-premium p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-bold text-slate-900">Recent Orders</h3>
          <p className="text-xs text-slate-400 mt-0.5">Latest incoming orders</p>
        </div>
        <Link
          to="/farmer/orders"
          className="flex items-center gap-1 text-xs font-semibold text-agri-green hover:underline"
        >
          View All <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {recent.length === 0 ? (
        <div className="text-center py-10">
          <ShoppingCart className="w-10 h-10 text-slate-200 mx-auto mb-2" />
          <p className="text-slate-500 text-sm font-medium">No orders yet</p>
          <p className="text-slate-400 text-xs mt-1">Orders from customers will appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {recent.map((order) => {
            const id = order._id || order.id;
            const shortId = id?.slice(-6).toUpperCase();
            const items = order.items || [];
            const productDesc = items.length > 0
              ? `${items[0].product_name}${items.length > 1 ? ` +${items.length - 1}` : ''}`
              : 'Order';
            const nextStatus = NEXT_STATUS[order.order_status];
            const dt = order.created_at
              ? new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
              : '';

            return (
              <div key={id} className="flex items-start justify-between gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50/60 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-mono text-slate-400">#{shortId}</span>
                    <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${STATUS_STYLES[order.order_status] || 'bg-slate-100 text-slate-500'}`}>
                      {order.order_status}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-slate-800 truncate">{productDesc}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-slate-400">{order.customer_name || 'Customer'}</span>
                    <span className="text-slate-200">·</span>
                    <span className="text-xs text-slate-400">{dt}</span>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-bold text-slate-900">₹{Number(order.total_amount).toLocaleString('en-IN')}</p>
                  {nextStatus && (
                    <button
                      onClick={() => handleStatusUpdate(id, nextStatus)}
                      className="mt-1 text-xs font-medium text-agri-green hover:underline"
                    >
                      → {nextStatus}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OrderPreview;
