import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, MapPin, Eye, ShoppingCart, Zap, CheckCircle, Sprout } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { addToCart } = useContext(CartContext);
  const [adding, setAdding] = useState(false);
  const [buying, setBuying] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const productId = product._id || product.id;
  const farmerPrice = Number(product.price || 0);
  const marketPrice = Number(product.market_price || farmerPrice * 1.25);
  const savings = Math.max(0, marketPrice - farmerPrice);
  const isOrganic = Boolean(product.organic);
  const displayImage = Array.isArray(product.images) && product.images.length > 0 
    ? product.images[0] 
    : (product.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80');

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    setAdding(true);
    await addToCart(product, 1);
    setAdding(false);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  const handleBuyNow = async (e) => {
    e.stopPropagation();
    setBuying(true);

    if (!user) {
      // Prompt login and preserve target
      navigate(`/login?redirect=${encodeURIComponent(`/product/${productId}`)}`);
      return;
    }

    if (user.role !== 'CUSTOMER') {
      navigate('/customer/home');
      return;
    }

    await addToCart(product, 1);
    navigate('/checkout');
  };

  const handleViewDetails = () => {
    navigate(`/product/${productId}`);
  };

  return (
    <div 
      onClick={handleViewDetails}
      className="group bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-premium-hover hover:-translate-y-1.5 hover:border-emerald-300/80 transition-all duration-300 flex flex-col overflow-hidden cursor-pointer relative"
    >
      {/* Top Image Container */}
      <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
        <img
          src={displayImage}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80';
          }}
        />

        {/* Gradient Overlay for badges */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10"></div>

        {/* Category & Organic Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 z-10">
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/90 text-slate-800 backdrop-blur-md shadow-sm">
            {product.category}
          </span>
          {isOrganic && (
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-600 text-white flex items-center gap-1 shadow-sm">
              <Sprout className="w-3 h-3" />
              Organic
            </span>
          )}
        </div>

        {/* Savings Badge */}
        {savings > 0 && (
          <div className="absolute top-2.5 right-2.5 bg-amber-500 text-white text-xs font-black px-2.5 py-0.5 rounded-full shadow-md">
            Save ₹{savings.toFixed(0)}/{product.unit || 'kg'}
          </div>
        )}

        {/* Location & Farmer tag on image bottom */}
        <div className="absolute bottom-2 left-2.5 right-2.5 text-white text-xs flex items-center justify-between">
          <span className="font-semibold flex items-center gap-1 drop-shadow-md truncate max-w-[65%]">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 inline" />
            {product.farmer_name || 'Local Farmer'}
          </span>
          <span className="text-[11px] text-slate-200 flex items-center gap-0.5 drop-shadow-md">
            <MapPin className="w-3 h-3 text-red-400" />
            {product.location ? product.location.split(',')[0] : 'Farm'}
          </span>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Rating & Stock */}
          <div className="flex items-center justify-between text-xs mb-1.5">
            <div className="flex items-center gap-1 font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>{product.rating ? Number(product.rating).toFixed(1) : '4.8'}</span>
              <span className="text-slate-400 font-normal">({product.review_count || 12})</span>
            </div>
            <span className={`text-[11px] font-semibold ${product.quantity > 0 ? 'text-emerald-700 bg-emerald-50' : 'text-red-600 bg-red-50'} px-2 py-0.5 rounded-md`}>
              {product.quantity > 0 ? `${product.quantity} ${product.unit || 'kg'} left` : 'Out of stock'}
            </span>
          </div>

          {/* Product Name */}
          <h3 className="font-bold text-slate-900 text-base line-clamp-1 group-hover:text-agri-green transition-colors">
            {product.name}
          </h3>

          {/* Short description */}
          <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
            {product.description || `Fresh, farm-harvested ${product.name} delivered directly from farmer ${product.farmer_name}.`}
          </p>
        </div>

        {/* Pricing Box - AgriLink Price Transparency */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <div className="flex items-baseline justify-between">
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-agri-green">₹{farmerPrice}</span>
                <span className="text-xs font-semibold text-slate-500">/{product.unit || 'kg'}</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Market Ref: <span className="line-through">₹{marketPrice}</span>
              </p>
            </div>
            
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded">
                Direct Price
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2 mt-3.5">
            <button
              onClick={handleViewDetails}
              type="button"
              className="py-2 px-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold flex items-center justify-center gap-1 transition-colors"
            >
              <Eye className="w-3.5 h-3.5 text-slate-400" />
              View Details
            </button>

            <button
              onClick={handleBuyNow}
              disabled={buying || product.quantity <= 0}
              type="button"
              className="py-2 px-2 rounded-xl bg-gradient-to-r from-agri-green to-emerald-500 hover:from-agri-dark hover:to-agri-green text-white text-xs font-bold flex items-center justify-center gap-1 shadow-sm transition-all hover:shadow"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              {buying ? '...' : 'Buy Now'}
            </button>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={adding || product.quantity <= 0}
            type="button"
            className="w-full mt-2 py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-agri-green text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border border-emerald-100"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            {justAdded ? '✓ Added to Cart!' : (adding ? 'Adding...' : 'Add to Cart')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
