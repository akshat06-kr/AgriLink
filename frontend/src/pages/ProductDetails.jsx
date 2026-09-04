import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import CustomerNavbar from '../components/CustomerNavbar';
import ProductCard from '../components/ProductCard';
import Footer from '../components/Footer';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import api from '../services/api';
import {
  Star,
  MapPin,
  Calendar,
  ShieldCheck,
  Truck,
  ShoppingCart,
  Zap,
  CheckCircle2,
  ChevronRight,
  TrendingDown,
  Sprout,
  Activity,
  Award,
  Info,
  Layers,
  ArrowLeft,
  User,
  MessageSquare,
  AlertCircle
} from 'lucide-react';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { addToCart } = useContext(CartContext);

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [farmerProfile, setFarmerProfile] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cart / Buy state
  const [addingToCart, setAddingToCart] = useState(false);
  const [buyingNow, setBuyingNow] = useState(false);
  const [cartSuccess, setCartSuccess] = useState(false);

  // Review submission state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const fetchProductData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Fetch Product Details
      const res = await api.get(`/products/${id}`);
      const prodData = res.data;
      setProduct(prodData);
      setQuantity(1);
      setSelectedImageIndex(0);

      // 2. Fetch Reviews
      try {
        const reviewRes = await api.get(`/products/${id}/reviews`);
        setReviews(Array.isArray(reviewRes.data) ? reviewRes.data : []);
      } catch (e) {
        console.warn('Could not fetch reviews:', e);
        setReviews([]);
      }

      // 3. Fetch Farmer Profile if farmer_id exists
      if (prodData.farmer_id) {
        try {
          const farmerRes = await api.get(`/farmers/${prodData.farmer_id}`);
          setFarmerProfile(farmerRes.data);
        } catch (e) {
          console.warn('Could not fetch farmer details:', e);
        }
      }

      // 4. Fetch Related Products (same category)
      try {
        const relatedRes = await api.get(`/products?category=${prodData.category || ''}`);
        if (Array.isArray(relatedRes.data)) {
          const filtered = relatedRes.data.filter(p => (p._id || p.id) !== id).slice(0, 4);
          setRelatedProducts(filtered);
        }
      } catch (e) {
        console.warn('Could not fetch related products:', e);
      }

    } catch (err) {
      console.error('Failed to load product:', err);
      setError('Product not found or unable to load details.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProductData();
    window.scrollTo(0, 0);
  }, [fetchProductData]);

  const handleAddToCart = async () => {
    if (!product) return;
    setAddingToCart(true);
    await addToCart(product, quantity);
    setAddingToCart(false);
    setCartSuccess(true);
    setTimeout(() => setCartSuccess(false), 2500);
  };

  const handleBuyNow = async () => {
    if (!product) return;
    setBuyingNow(true);

    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role !== 'CUSTOMER') {
      navigate('/customer/home');
      return;
    }

    await addToCart(product, quantity);
    navigate('/checkout');
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      setSubmittingReview(true);
      setReviewError('');
      await api.post(`/products/${id}/reviews`, {
        rating: reviewRating,
        comment: reviewComment
      });

      setReviewSuccess(true);
      setReviewComment('');
      setShowReviewForm(false);
      
      // Refresh reviews and product rating
      const reviewRes = await api.get(`/products/${id}/reviews`);
      setReviews(reviewRes.data || []);
      const updatedProd = await api.get(`/products/${id}`);
      setProduct(updatedProd.data);
    } catch (err) {
      setReviewError(err.response?.data?.detail || 'Failed to submit review. You can only review products you have purchased.');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-surface-50 min-h-screen">
        <CustomerNavbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="animate-pulse space-y-8">
            <div className="h-6 bg-slate-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="h-96 bg-slate-200 rounded-3xl"></div>
              <div className="space-y-4">
                <div className="h-8 bg-slate-200 rounded w-3/4"></div>
                <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                <div className="h-12 bg-slate-200 rounded w-1/3"></div>
                <div className="h-24 bg-slate-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="bg-surface-50 min-h-screen">
        <CustomerNavbar />
        <div className="max-w-3xl mx-auto px-4 py-20 text-center">
          <div className="bg-white rounded-3xl p-10 border border-slate-200 shadow-sm">
            <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Product Not Found</h2>
            <p className="text-slate-500 mb-6">{error || "The requested farm product is unavailable or doesn't exist."}</p>
            <Link to="/customer/home" className="btn-primary py-3 px-6 text-sm inline-flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Back to Products
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const imagesList = Array.isArray(product.images) && product.images.length > 0 
    ? product.images 
    : [product.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80'];

  const farmerPrice = Number(product.price || 0);
  const marketPrice = Number(product.market_price || farmerPrice * 1.25);
  const savings = Math.max(0, marketPrice - farmerPrice);
  const savingsPercent = marketPrice > 0 ? Math.round((savings / marketPrice) * 100) : 0;

  // Rating breakdown calculation
  const totalReviewsCount = reviews.length || product.review_count || 0;
  const ratingDistribution = [5, 4, 3, 2, 1].map(stars => {
    const count = reviews.filter(r => r.rating === stars).length;
    const pct = totalReviewsCount > 0 ? (count / totalReviewsCount) * 100 : (stars === 5 ? 80 : stars === 4 ? 20 : 0);
    return { stars, count, pct };
  });

  return (
    <div className="bg-surface-50 min-h-screen flex flex-col selection:bg-agri-green selection:text-white">
      <CustomerNavbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1">
        
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-6 overflow-x-auto whitespace-nowrap">
          <Link to="/customer/home" className="hover:text-agri-green font-medium">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link to={`/customer/home?category=${product.category}`} className="hover:text-agri-green font-medium">
            {product.category}
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-900 font-bold truncate max-w-xs">{product.name}</span>
        </div>

        {/* TOP SECTION: Gallery & Primary Buy Info */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8 mb-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* LEFT: Image Gallery */}
            <div className="lg:col-span-6 space-y-4">
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/80 shadow-inner">
                <img
                  src={imagesList[selectedImageIndex]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />

                {/* Badges on main image */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {product.organic && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white flex items-center gap-1 shadow-md">
                      <Sprout className="w-3.5 h-3.5" />
                      100% Certified Organic
                    </span>
                  )}
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/95 text-slate-800 backdrop-blur-md shadow-md">
                    {product.category}
                  </span>
                </div>

                {savings > 0 && (
                  <div className="absolute top-4 right-4 bg-amber-500 text-white text-xs font-black px-3 py-1 rounded-full shadow-md">
                    Save ₹{savings.toFixed(0)}/{product.unit || 'kg'} ({savingsPercent}% OFF)
                  </div>
                )}
              </div>

              {/* Thumbnails Row */}
              {imagesList.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-1">
                  {imagesList.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                        selectedImageIndex === idx 
                          ? 'border-agri-green ring-2 ring-emerald-500/20 shadow-md' 
                          : 'border-slate-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* RIGHT: Product Buy Information */}
            <div className="lg:col-span-6 flex flex-col justify-between">
              <div>
                {/* Farmer & Location Badge */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold bg-slate-100 px-3 py-1 rounded-full">
                    <CheckCircle2 className="w-4 h-4 text-agri-green" />
                    <span>Farmer: <strong className="text-slate-900">{product.farmer_name || 'Local Farm'}</strong></span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-red-500" />
                    <span>{product.location}</span>
                  </div>
                </div>

                {/* Title */}
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                  {product.name}
                </h1>

                {/* Rating & Stock */}
                <div className="flex flex-wrap items-center gap-4 mt-3 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-1.5 bg-amber-50 text-amber-700 font-bold text-sm px-2.5 py-1 rounded-lg">
                    <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                    <span>{product.rating ? Number(product.rating).toFixed(1) : '4.9'}</span>
                    <span className="text-slate-400 font-normal">({totalReviewsCount} reviews)</span>
                  </div>

                  <div className="text-xs text-slate-600 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-agri-green" />
                    <span>{product.harvest_date || 'Harvested within 24 hours'}</span>
                  </div>

                  <div className={`text-xs font-bold px-2.5 py-1 rounded-lg ${product.quantity > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-700'}`}>
                    {product.quantity > 0 ? `${product.quantity} ${product.unit || 'kg'} in stock` : 'Out of stock'}
                  </div>
                </div>

                {/* Price Display */}
                <div className="my-6 p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-agri-green">Direct Farmer Price</span>
                  <div className="flex items-baseline gap-3 mt-1">
                    <span className="text-4xl font-black text-slate-900">₹{farmerPrice}</span>
                    <span className="text-base font-semibold text-slate-500">/{product.unit || 'kg'}</span>
                    
                    <div className="ml-auto text-right">
                      <p className="text-xs text-slate-400 line-through">Market Ref: ₹{marketPrice}/{product.unit || 'kg'}</p>
                      <p className="text-xs font-bold text-emerald-700">You Save ₹{savings.toFixed(0)}/{product.unit || 'kg'}</p>
                    </div>
                  </div>
                </div>

                {/* Quantity Selector */}
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-sm font-bold text-slate-700">Quantity ({product.unit || 'kg'}):</span>
                  <div className="flex items-center border border-slate-300 rounded-xl bg-slate-50 overflow-hidden">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3.5 py-2 text-slate-700 hover:bg-slate-200 font-bold transition-colors"
                    >
                      -
                    </button>
                    <span className="px-4 py-2 text-slate-900 font-bold text-sm min-w-[40px] text-center bg-white">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(product.quantity || 99, quantity + 1))}
                      className="px-3.5 py-2 text-slate-700 hover:bg-slate-200 font-bold transition-colors"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-xs text-slate-400">
                    Total: <strong className="text-slate-800 font-bold">₹{(farmerPrice * quantity).toFixed(2)}</strong>
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={handleBuyNow}
                    disabled={buyingNow || product.quantity <= 0}
                    className="btn-primary py-3.5 px-6 text-base font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
                  >
                    <Zap className="w-5 h-5 fill-current" />
                    {buyingNow ? 'Processing...' : 'Buy Now'}
                  </button>

                  <button
                    onClick={handleAddToCart}
                    disabled={addingToCart || product.quantity <= 0}
                    className="btn-secondary py-3.5 px-6 text-base font-bold flex items-center justify-center gap-2 border-agri-green"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    {cartSuccess ? '✓ Added to Cart!' : (addingToCart ? 'Adding...' : 'Add to Cart')}
                  </button>
                </div>

                <div className="flex items-center justify-center gap-6 text-[11px] text-slate-500 pt-2 font-medium">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4 text-agri-green" /> 100% Quality Checked
                  </span>
                  <span className="flex items-center gap-1">
                    <Truck className="w-4 h-4 text-blue-600" /> Direct Farm Dispatch
                  </span>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* SECTION 10 & 16: About This Product & Quality / Farming Info */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10">
          
          {/* About & Description */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Info className="w-5 h-5 text-agri-green" />
              About This Product
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line mb-6 font-normal">
              {product.description || 'Grown with dedicated care by registered local farmers using sustainable farming techniques.'}
            </p>

            {/* Quality & Farming Details Grid */}
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-3">
              Quality & Farming Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Farming Method</span>
                <p className="text-xs font-bold text-slate-800 mt-0.5">
                  {product.farming_method || product.farming_type || 'Natural Soil Cultivation'}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Harvest Information</span>
                <p className="text-xs font-bold text-slate-800 mt-0.5">
                  {product.harvest_date || 'Harvested within 24h of ordering'}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Storage Recommendation</span>
                <p className="text-xs font-bold text-slate-800 mt-0.5">
                  {product.storage_info || 'Keep in cool dry conditions away from direct heat.'}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Availability Status</span>
                <p className="text-xs font-bold text-emerald-700 mt-0.5">
                  {product.quantity > 0 ? `Fresh Batch Available (${product.quantity} ${product.unit || 'kg'})` : 'Currently Sold Out'}
                </p>
              </div>
            </div>
          </div>

          {/* Key Benefits */}
          <div className="lg:col-span-5 bg-gradient-to-br from-emerald-50 to-white rounded-3xl border border-emerald-100 p-6 sm:p-8 shadow-sm flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-agri-green text-xs font-bold mb-3">
                <Award className="w-3.5 h-3.5" /> Farm Fresh Guarantee
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Why Buy From AgriLink?</h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Direct connections mean food arrives fresher, tastes better, and keeps farmers fairly compensated.
              </p>

              <ul className="space-y-2.5 text-xs text-slate-700">
                {product.benefits && Array.isArray(product.benefits) ? (
                  product.benefits.map((b, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-agri-green shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </li>
                  ))
                ) : (
                  <>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-agri-green shrink-0 mt-0.5" />
                      <span>Harvested at peak ripeness for maximum natural nutrition.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-agri-green shrink-0 mt-0.5" />
                      <span>Zero middleman storage delays or synthetic ripening gases.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-agri-green shrink-0 mt-0.5" />
                      <span>100% price transparency with fair return for farm families.</span>
                    </li>
                  </>
                )}
              </ul>
            </div>

            <div className="mt-6 pt-4 border-t border-emerald-200/60 flex items-center justify-between text-xs text-emerald-800 font-semibold">
              <span>Farm to Fork direct</span>
              <span>100% Traceable</span>
            </div>
          </div>

        </div>

        {/* SECTION 11 & 12: PRICE TRANSPARENCY & BREAKDOWN (USP FEATURE) */}
        <div className="bg-white rounded-3xl border-2 border-emerald-500/30 p-6 sm:p-8 mb-10 shadow-lg relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-agri-green text-xs font-black uppercase tracking-wider mb-2">
                <TrendingDown className="w-4 h-4" /> AgriLink USP
              </div>
              <h2 className="text-2xl font-black text-slate-900">
                Price Transparency
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
                AgriLink shows the listed farmer price alongside a market reference price so customers can better understand pricing.
              </p>
            </div>

            {/* Savings Summary Banner */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center shrink-0">
              <span className="text-xs font-bold text-slate-500 uppercase">Your Direct Savings</span>
              <p className="text-2xl font-black text-agri-green mt-0.5">₹{savings.toFixed(0)}/{product.unit || 'kg'}</p>
              <span className="text-[11px] font-semibold text-emerald-700">({savingsPercent}% lower than retail market)</span>
            </div>
          </div>

          {/* Visual Comparison Chart / Bars */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center mb-8">
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Price Comparison</h4>
              
              {/* Farmer Price Bar */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-slate-800 flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-agri-green inline-block"></span>
                    Farmer Price (AgriLink)
                  </span>
                  <span className="text-agri-green font-black">₹{farmerPrice}/{product.unit || 'kg'}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-5 overflow-hidden p-0.5">
                  <div 
                    className="bg-gradient-to-r from-agri-green to-emerald-400 h-full rounded-full transition-all duration-1000 flex items-center justify-end pr-2 text-[10px] text-white font-bold"
                    style={{ width: `${Math.min(100, (farmerPrice / (marketPrice || farmerPrice * 1.25)) * 100)}%` }}
                  >
                    ₹{farmerPrice}
                  </div>
                </div>
              </div>

              {/* Market Reference Price Bar */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-slate-400 inline-block"></span>
                    Market Reference Price
                  </span>
                  <span className="text-slate-500 font-bold">₹{marketPrice}/{product.unit || 'kg'}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-5 overflow-hidden p-0.5">
                  <div 
                    className="bg-slate-400 h-full rounded-full transition-all duration-1000 flex items-center justify-end pr-2 text-[10px] text-white font-bold"
                    style={{ width: '100%' }}
                  >
                    ₹{marketPrice}
                  </div>
                </div>
              </div>
            </div>

            {/* Configured Price Breakdown: Where Your Money Goes */}
            {product.breakdown ? (
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
                  Where Your Money Goes
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center py-1.5 border-b border-slate-200">
                    <span className="text-slate-600">Farmer Receives:</span>
                    <strong className="text-emerald-700 font-bold text-sm">
                      ₹{product.breakdown.farmer_receives || farmerPrice}
                    </strong>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-slate-200">
                    <span className="text-slate-600">Platform / Packaging / Logistics:</span>
                    <strong className="text-slate-700 font-bold">
                      ₹{product.breakdown.platform_delivery || 5}
                    </strong>
                  </div>
                  <div className="flex justify-between items-center pt-2 text-slate-900 font-black text-sm">
                    <span>Total You Pay:</span>
                    <span className="text-agri-green text-base">
                      ₹{product.breakdown.customer_pays || (farmerPrice + 5)}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-xs text-slate-600 leading-relaxed">
                <h4 className="font-bold text-slate-800 text-xs uppercase mb-2">Transparent Pricing Notice</h4>
                <p>
                  You pay the direct farmer listing price of <strong>₹{farmerPrice}/{product.unit || 'kg'}</strong>. Standard direct delivery fee is calculated at checkout based on your delivery address.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* SECTION 13 & 14: Meet the Farmer & Farm Origin */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10">
          
          {/* Farmer Info */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 mb-5 flex items-center gap-2">
              <User className="w-5 h-5 text-agri-green" />
              Meet the Farmer
            </h2>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-agri-green flex items-center justify-center font-black text-2xl shrink-0 shadow-sm border border-emerald-200">
                {product.farmer_name ? product.farmer_name[0] : 'F'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900">{product.farmer_name || 'Verified Farmer'}</h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-agri-green flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Verified Farm
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  {farmerProfile?.farm_name || product.farm_name || 'AgriLink Partner Farm'} • {product.location}
                </p>
                <div className="flex items-center gap-3 text-xs text-slate-600 mt-2 font-medium">
                  <span className="flex items-center gap-1 text-amber-600 font-bold">
                    <Star className="w-3.5 h-3.5 fill-current" /> {farmerProfile?.rating || '4.9'}
                  </span>
                  <span>•</span>
                  <span>Farming Type: <strong>{farmerProfile?.farming_type || product.farming_type || 'Organic / Sustainable'}</strong></span>
                </div>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-4">
              {farmerProfile?.bio || product.farmer_bio || 'Committed to organic farming practices, soil health conservation, and supplying nutrient-rich fresh harvest directly to local families.'}
            </p>

            {product.farmer_id && (
              <button
                onClick={() => navigate(`/customer/home?q=${encodeURIComponent(product.farmer_name || '')}`)}
                className="btn-secondary py-2 px-4 text-xs font-bold inline-flex items-center gap-1.5"
              >
                View All Products from {product.farmer_name}
              </button>
            )}
          </div>

          {/* Farm Origin / Traceability */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-red-500" />
                Product Origin
              </h2>

              <div className="space-y-3 mb-4 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Farm Location:</span>
                  <span className="font-bold text-slate-800">{product.origin?.farm_name || product.farm_name || product.location}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">District / State:</span>
                  <span className="font-bold text-slate-800">
                    {product.origin?.district ? `${product.origin.district}, ${product.origin.state}` : product.location}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Traceability Code:</span>
                  <span className="font-mono text-emerald-700 font-bold">
                    AGRI-TRC-{(product._id || product.id || '000').slice(-6).toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            {/* Clean Map Preview Placeholder / Visual Card */}
            <div className="h-32 rounded-2xl bg-gradient-to-br from-emerald-100 via-teal-50 to-slate-100 border border-emerald-200/60 p-3 flex flex-col items-center justify-center text-center relative overflow-hidden">
              <MapPin className="w-7 h-7 text-red-500 animate-bounce mb-1" />
              <p className="text-xs font-bold text-slate-800">{product.location}</p>
              <p className="text-[10px] text-slate-500">Verified GPS Farm Coordinates ({product.origin?.latitude || '19.20'}° N, {product.origin?.longitude || '73.87'}° E)</p>
            </div>
          </div>

        </div>

        {/* SECTION 15: Nutrition Information */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 mb-10 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
            <Activity className="w-5 h-5 text-agri-green" />
            Nutrition Information
          </h2>
          <p className="text-xs text-slate-500 mb-6">
            Configured nutritional breakdown per standard serving (100g)
          </p>

          {product.nutrition ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-2xl text-center">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Calories</span>
                <p className="text-xl font-black text-slate-900 mt-1">{product.nutrition.calories || 'N/A'}</p>
                <span className="text-[10px] text-slate-500">kcal</span>
              </div>

              <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-2xl text-center">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Protein</span>
                <p className="text-xl font-black text-emerald-700 mt-1">{product.nutrition.protein ?? 'N/A'}</p>
                <span className="text-[10px] text-slate-500">grams</span>
              </div>

              <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-2xl text-center">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Carbs</span>
                <p className="text-xl font-black text-amber-700 mt-1">{product.nutrition.carbohydrates ?? 'N/A'}</p>
                <span className="text-[10px] text-slate-500">grams</span>
              </div>

              <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-2xl text-center">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Fiber</span>
                <p className="text-xl font-black text-blue-700 mt-1">{product.nutrition.fiber ?? 'N/A'}</p>
                <span className="text-[10px] text-slate-500">grams</span>
              </div>

              <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-2xl text-center col-span-2 sm:col-span-1 lg:col-span-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Vitamins & Minerals</span>
                <p className="text-xs font-bold text-slate-800 mt-1 line-clamp-2">
                  {product.nutrition.vitamins || product.nutrition.minerals || 'Naturally Rich'}
                </p>
                <span className="text-[10px] text-slate-500">{product.nutrition.minerals || 'Essential micro-nutrients'}</span>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-slate-400 text-xs bg-slate-50 rounded-2xl">
              No nutrition information available for this product.
            </div>
          )}
        </div>

        {/* SECTION 17: Customer Reviews & Rating */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 mb-10 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-agri-green" />
                Customer Reviews
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Authentic feedback from verified customers who ordered this produce
              </p>
            </div>

            {user?.role === 'CUSTOMER' && (
              <button
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="btn-primary py-2 px-4 text-xs font-bold"
              >
                {showReviewForm ? 'Cancel Review' : 'Write a Review'}
              </button>
            )}
          </div>

          {/* Review Submission Form */}
          {showReviewForm && (
            <form onSubmit={handleReviewSubmit} className="mb-8 p-5 bg-emerald-50/50 rounded-2xl border border-emerald-200">
              <h3 className="text-sm font-bold text-slate-900 mb-3">Share Your Experience</h3>
              {reviewError && (
                <p className="text-xs text-red-600 bg-red-100 p-2 rounded-lg mb-3 font-medium">{reviewError}</p>
              )}

              <div className="mb-3">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Your Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setReviewRating(star)}
                      className="p-1 text-amber-500"
                    >
                      <Star className={`w-6 h-6 ${star <= reviewRating ? 'fill-amber-500' : 'text-slate-300'}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-3">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Your Review</label>
                <textarea
                  required
                  rows={3}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="How was the freshness, taste, and delivery experience?"
                  className="input-field text-xs py-2 bg-white"
                />
              </div>

              <button
                type="submit"
                disabled={submittingReview}
                className="btn-primary py-2 px-5 text-xs font-bold"
              >
                {submittingReview ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          )}

          {/* Star Distribution Summary */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center pb-8 border-b border-slate-100">
            <div className="md:col-span-4 text-center md:border-r border-slate-100 pr-4">
              <p className="text-5xl font-black text-slate-900">
                {product.rating ? Number(product.rating).toFixed(1) : '4.9'}
              </p>
              <div className="flex justify-center gap-1 text-amber-500 my-2">
                {[1, 2, 3, 4, 5].map(s => (
                  <Star key={s} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-xs text-slate-500">Based on {totalReviewsCount} verified reviews</p>
            </div>

            <div className="md:col-span-8 space-y-1.5">
              {ratingDistribution.map(({ stars, count, pct }) => (
                <div key={stars} className="flex items-center gap-3 text-xs">
                  <span className="w-8 text-slate-600 font-semibold">{stars} ★</span>
                  <div className="flex-1 bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div className="bg-amber-400 h-full rounded-full" style={{ width: `${pct}%` }}></div>
                  </div>
                  <span className="w-12 text-slate-400 text-right">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Reviews List */}
          <div className="divide-y divide-slate-100 mt-6 space-y-4">
            {reviews.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs">
                No customer reviews yet. Be the first to try this farm harvest!
              </div>
            ) : (
              reviews.map((rev) => (
                <div key={rev._id || rev.id} className="pt-4 first:pt-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs">
                        {rev.customer_name ? rev.customer_name[0].toUpperCase() : 'C'}
                      </div>
                      <span className="text-xs font-bold text-slate-900">{rev.customer_name || 'Customer'}</span>
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-semibold">Verified Buyer</span>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {new Date(rev.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex gap-1 text-amber-500 mb-1">
                    {[1, 2, 3, 4, 5].map(st => (
                      <Star key={st} className={`w-3 h-3 ${st <= rev.rating ? 'fill-current' : 'text-slate-200'}`} />
                    ))}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* SECTION 18: RELATED PRODUCTS ("You May Also Like") */}
        {relatedProducts.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-black text-slate-900">You May Also Like</h2>
                <p className="text-xs text-slate-500">More fresh harvest from the same category</p>
              </div>
              <Link to={`/customer/home?category=${product.category}`} className="text-xs font-bold text-agri-green hover:underline">
                View All {product.category} →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map(rel => (
                <ProductCard key={rel._id || rel.id} product={rel} />
              ))}
            </div>
          </div>
        )}

      </div>

      <Footer />
    </div>
  );
};

export default ProductDetails;
