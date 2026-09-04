import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CustomerNavbar from '../components/CustomerNavbar';
import Footer from '../components/Footer';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  ShoppingBag, 
  ShieldCheck, 
  TrendingDown, 
  MapPin, 
  Sprout 
} from 'lucide-react';

const Cart = () => {
  const { items, totalAmount, totalSavings, totalMarketAmount, updateQuantity, removeFromCart, clearCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const deliveryFee = items.length > 0 ? 40 : 0;
  const finalTotal = totalAmount + deliveryFee;

  const handleCheckout = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate('/checkout');
  };

  return (
    <div className="bg-surface-50 min-h-screen flex flex-col selection:bg-agri-green selection:text-white">
      <CustomerNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900">Your Shopping Cart</h1>
            <p className="text-sm text-slate-500 mt-1">
              Fresh produce directly reserved from local farmers
            </p>
          </div>
          {items.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs font-bold text-red-600 hover:text-red-700 inline-flex items-center gap-1.5 self-start sm:self-auto p-2 rounded-lg hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-4 h-4" /> Clear All
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto shadow-sm my-8">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 text-agri-green">
              <ShoppingBag className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Your Cart is Empty</h2>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
              Explore our marketplace to find fresh vegetables, fruits, crops, and organic produce directly from farmers.
            </p>
            <Link to="/customer/home" className="btn-primary py-3 px-8 text-sm inline-flex items-center gap-2">
              Browse Fresh Produce <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left: Cart Items List */}
            <div className="lg:col-span-8 space-y-4">
              {items.map((item) => {
                const itemSavings = Math.max(0, ((item.market_price || item.price * 1.25) - item.price) * item.quantity);
                const displayImg = item.image && item.image.length > 2 
                  ? item.image 
                  : 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=300&q=80';

                return (
                  <div
                    key={item.product_id}
                    className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    {/* Product Info */}
                    <div className="flex items-center gap-4 min-w-0">
                      <img
                        src={displayImg}
                        alt={item.name}
                        className="w-20 h-20 rounded-xl object-cover border border-slate-100 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="font-bold text-slate-900 text-base truncate">{item.name}</h3>
                          {item.organic && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-agri-green flex items-center gap-0.5">
                              <Sprout className="w-3 h-3" /> Organic
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          Farmer: <strong className="text-slate-700">{item.farmer_name || 'Local Farmer'}</strong>
                        </p>
                        <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-red-400" /> {item.location || 'Local Farm'}
                        </p>
                        
                        {itemSavings > 0 && (
                          <span className="inline-block mt-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                            Save ₹{itemSavings.toFixed(0)} vs Market
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quantity and Price */}
                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      {/* Quantity Controls */}
                      <div className="flex items-center border border-slate-300 rounded-xl bg-slate-50 overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                          className="px-2.5 py-1.5 text-slate-700 hover:bg-slate-200 font-bold transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-3 py-1 text-xs font-bold text-slate-900 min-w-[32px] text-center bg-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                          className="px-2.5 py-1.5 text-slate-700 hover:bg-slate-200 font-bold transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Total Item Price */}
                      <div className="text-right min-w-[70px]">
                        <p className="text-base font-black text-slate-900">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </p>
                        <span className="text-[10px] text-slate-400">₹{item.price}/{item.unit}</span>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeFromCart(item.product_id)}
                        className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>

            {/* Right: Order Summary & Transparent Price Box */}
            <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm sticky top-24">
              <h2 className="text-lg font-bold text-slate-900 mb-4 pb-3 border-b border-slate-100">
                Order Summary
              </h2>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Produce Subtotal:</span>
                  <span className="font-bold text-slate-900">₹{totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Standard Direct Delivery:</span>
                  <span className="font-bold text-slate-900">₹{deliveryFee.toFixed(2)}</span>
                </div>
                {totalSavings > 0 && (
                  <div className="flex justify-between text-emerald-700 bg-emerald-50 p-2 rounded-xl font-bold">
                    <span>Direct Farmer Savings:</span>
                    <span>-₹{totalSavings.toFixed(2)}</span>
                  </div>
                )}
                
                <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline text-sm font-black text-slate-900">
                  <span>Total Amount:</span>
                  <span className="text-2xl text-agri-green">₹{finalTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Price Transparency Guarantee Callout */}
              <div className="my-5 p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 text-[11px] text-slate-600 space-y-1">
                <p className="font-bold text-slate-800 flex items-center gap-1 text-xs">
                  <ShieldCheck className="w-4 h-4 text-agri-green" /> 100% Transparent Billing
                </p>
                <p>₹{totalAmount.toFixed(2)} goes directly to local farmers without middleman cuts.</p>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full btn-primary py-3.5 px-6 text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
              >
                Proceed to Checkout <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-[11px] text-center text-slate-400 mt-3">
                Secure 256-bit Encrypted Checkout
              </p>
            </div>

          </div>
        )}

      </main>

      <Footer />
    </div>
  );
};

export default Cart;
