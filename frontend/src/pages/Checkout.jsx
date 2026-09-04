import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import CustomerNavbar from '../components/CustomerNavbar';
import Footer from '../components/Footer';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { 
  ShieldCheck, 
  Truck, 
  CreditCard, 
  Banknote, 
  CheckCircle2, 
  ArrowLeft, 
  MapPin, 
  Phone, 
  User, 
  Sparkles,
  AlertCircle
} from 'lucide-react';

const Checkout = () => {
  const { items, totalAmount, clearCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [deliveryAddress, setDeliveryAddress] = useState(user?.address || 'Flat 402, Green Meadows, Model Colony, Pune, Maharashtra 411016');
  const [phoneNumber, setPhoneNumber] = useState(user?.phone || '9876543210');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState(null);

  const deliveryFee = items.length > 0 ? 40 : 0;
  const finalTotal = totalAmount + deliveryFee;

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    if (items.length === 0) {
      setError('Your cart is empty. Please add products before placing an order.');
      return;
    }

    if (!deliveryAddress.trim()) {
      setError('Please provide a valid delivery address.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      const orderPayload = {
        items: items.map(it => ({
          product_id: it.product_id,
          product_name: it.name,
          quantity: it.quantity,
          price: it.price,
          unit: it.unit || 'kg',
          image: it.image,
          farmer_name: it.farmer_name
        })),
        total_amount: finalTotal,
        delivery_address: deliveryAddress.trim(),
        payment_method: paymentMethod
      };

      const res = await api.post('/orders', orderPayload);
      const newOrder = res.data;
      setPlacedOrderId(newOrder._id || newOrder.id);
      setOrderSuccess(true);
      await clearCart();
    } catch (err) {
      console.error('Order placement failed:', err);
      setError(err.response?.data?.detail || 'Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="bg-surface-50 min-h-screen flex flex-col">
        <CustomerNavbar />
        <main className="max-w-2xl mx-auto px-4 py-16 text-center flex-1">
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-lg">
            <div className="w-20 h-20 bg-emerald-100 text-agri-green rounded-full flex items-center justify-center mx-auto mb-5 animate-bounce">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">
              Order Placed Successfully! 🎉
            </h1>
            <p className="text-sm text-slate-600 mb-4">
              Thank you for supporting local farmers directly.
            </p>
            {placedOrderId && (
              <p className="text-xs font-mono bg-slate-100 py-2 px-4 rounded-xl inline-block text-slate-700 font-bold mb-6">
                Order ID: #{placedOrderId.slice(-6).toUpperCase()}
              </p>
            )}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/customer/orders" className="btn-primary py-3 px-6 text-sm font-bold">
                View My Orders
              </Link>
              <Link to="/customer/home" className="btn-secondary py-3 px-6 text-sm font-bold">
                Continue Shopping
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-surface-50 min-h-screen flex flex-col selection:bg-agri-green selection:text-white">
      <CustomerNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        <div className="mb-6 flex items-center gap-2 text-xs text-slate-500">
          <Link to="/customer/cart" className="flex items-center gap-1 hover:text-agri-green font-bold">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Cart
          </Link>
        </div>

        <h1 className="text-3xl font-black text-slate-900 mb-8">Checkout & Direct Dispatch</h1>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left: Form Details */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Delivery Address Box */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-agri-green" /> Delivery Address
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Delivery Address *</label>
                  <textarea
                    required
                    rows={3}
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="House/Flat No., Street, Area, Landmark, City, State, Pincode"
                    className="input-field text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Recipient Name</label>
                    <input
                      type="text"
                      defaultValue={user?.name || 'Customer'}
                      disabled
                      className="input-field text-xs bg-slate-100 text-slate-500 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number *</label>
                    <input
                      type="text"
                      required
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="10-digit mobile number"
                      className="input-field text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Delivery Instructions (Optional)</label>
                  <input
                    type="text"
                    value={deliveryNotes}
                    onChange={(e) => setDeliveryNotes(e.target.value)}
                    placeholder="E.g. Leave with security, call upon arrival"
                    className="input-field text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-agri-green" /> Payment Method
              </h2>

              <div className="space-y-3">
                <label 
                  onClick={() => setPaymentMethod('Cash on Delivery')}
                  className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    paymentMethod === 'Cash on Delivery' 
                      ? 'border-agri-green bg-emerald-50/50 text-slate-900 shadow-sm' 
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-emerald-100 text-agri-green">
                      <Banknote className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">Cash on Delivery (Pay on Receipt)</p>
                      <p className="text-xs text-slate-500">Pay cash or UPI directly when fresh produce is delivered</p>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'Cash on Delivery'}
                    onChange={() => setPaymentMethod('Cash on Delivery')}
                    className="text-agri-green focus:ring-agri-green h-4 w-4"
                  />
                </label>

                <label 
                  onClick={() => setPaymentMethod('UPI / Online')}
                  className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    paymentMethod === 'UPI / Online' 
                      ? 'border-agri-green bg-emerald-50/50 text-slate-900 shadow-sm' 
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-blue-100 text-blue-700">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">UPI / Instant Online Payment</p>
                      <p className="text-xs text-slate-500">Google Pay, PhonePe, Paytm, Net Banking</p>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'UPI / Online'}
                    onChange={() => setPaymentMethod('UPI / Online')}
                    className="text-agri-green focus:ring-agri-green h-4 w-4"
                  />
                </label>
              </div>
            </div>

          </div>

          {/* Right: Order Summary */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm sticky top-24">
            <h2 className="text-lg font-bold text-slate-900 mb-4 pb-3 border-b border-slate-100">
              Order Items ({items.length})
            </h2>

            {/* Items review */}
            <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 pr-1 mb-4">
              {items.map((it) => (
                <div key={it.product_id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <img 
                      src={it.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=100&q=80'} 
                      alt={it.name}
                      className="w-10 h-10 rounded-lg object-cover border border-slate-100 shrink-0"
                    />
                    <div className="truncate">
                      <p className="font-bold text-slate-800 truncate">{it.name}</p>
                      <p className="text-[10px] text-slate-500">{it.quantity} {it.unit} × ₹{it.price}</p>
                    </div>
                  </div>
                  <span className="font-bold text-slate-900 shrink-0">₹{(it.price * it.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            {/* Price breakdown */}
            <div className="space-y-2.5 text-xs pt-3 border-t border-slate-100">
              <div className="flex justify-between text-slate-600">
                <span>Produce Total (Direct Farmer Share):</span>
                <span className="font-bold text-slate-900">₹{totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Eco Direct Delivery:</span>
                <span className="font-bold text-slate-900">₹{deliveryFee.toFixed(2)}</span>
              </div>
              <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline text-slate-900">
                <span className="font-bold text-sm">Total Payable:</span>
                <span className="text-2xl font-black text-agri-green">₹{finalTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Transparency Note */}
            <div className="my-5 p-3.5 bg-emerald-50/70 rounded-2xl border border-emerald-100 text-[11px] text-emerald-900 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-agri-green shrink-0 mt-0.5" />
              <span>By ordering directly on AgriLink, you ensure fair pricing with zero middleman deductions.</span>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={submitting || items.length === 0}
              className="w-full btn-primary py-3.5 px-6 text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
            >
              <CheckCircle2 className="w-4 h-4" />
              {submitting ? 'Placing Order...' : `Place Order (₹${finalTotal.toFixed(2)})`}
            </button>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Checkout;
