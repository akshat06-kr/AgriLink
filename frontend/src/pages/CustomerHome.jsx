import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import CustomerNavbar from '../components/CustomerNavbar';
import CustomerHero from '../components/CustomerHero';
import CategorySection from '../components/CategorySection';
import ProductFilters from '../components/ProductFilters';
import ProductCard from '../components/ProductCard';
import Footer from '../components/Footer';
import api from '../services/api';
import { 
  Sparkles, 
  TrendingDown, 
  ShieldCheck, 
  Award, 
  RefreshCw, 
  SearchX, 
  CheckCircle2, 
  ArrowRight,
  HeartHandshake
} from 'lucide-react';

const CustomerHome = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [organicOnly, setOrganicOnly] = useState(searchParams.get('organic') === 'true');
  const [priceRange, setPriceRange] = useState(500);
  const [sortBy, setSortBy] = useState('newest');

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {};
      if (selectedCategory && selectedCategory !== 'All') {
        params.category = selectedCategory;
      }
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }
      if (organicOnly) {
        params.organic = true;
      }
      if (priceRange < 500) {
        params.max_price = priceRange;
      }
      if (sortBy) {
        params.sort = sortBy;
      }

      const res = await api.get('/products', { params });
      if (Array.isArray(res.data)) {
        setProducts(res.data);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Unable to load products. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, searchQuery, organicOnly, priceRange, sortBy]);

  // Sync state whenever URL search params change
  useEffect(() => {
    const q = searchParams.get('q') || '';
    const cat = searchParams.get('category') || 'All';
    const org = searchParams.get('organic') === 'true';
    setSearchQuery(q);
    setSelectedCategory(cat);
    setOrganicOnly(org);
  }, [searchParams]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    const scrollToSection = () => {
      if (window.location.hash === '#products-section') {
        const el = document.getElementById('products-section');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };
    scrollToSection();
    const timer = setTimeout(scrollToSection, 250);
    return () => clearTimeout(timer);
  }, [searchParams]);

  const handleResetFilters = () => {
    setSelectedCategory('All');
    setSearchQuery('');
    setOrganicOnly(false);
    setPriceRange(500);
    setSortBy('newest');
  };

  const scrollToProducts = () => {
    const el = document.getElementById('products-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-surface-50 min-h-screen flex flex-col selection:bg-agri-green selection:text-white">
      {/* Customer Navbar */}
      <CustomerNavbar 
        searchQuery={searchQuery} 
        onSearchChange={(q) => {
          setSearchQuery(q);
          const el = document.getElementById('products-section');
          if (q.trim() && el) el.scrollIntoView({ behavior: 'smooth' });
        }} 
      />

      {/* Hero Section */}
      <CustomerHero
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onExploreClick={scrollToProducts}
      />

      {/* Category Section */}
      <CategorySection
        selectedCategory={selectedCategory}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          scrollToProducts();
        }}
      />

      {/* Main Marketplace Product Listing */}
      <main id="products-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-agri-green animate-ping"></span>
              <span className="text-xs font-bold uppercase tracking-wider text-agri-green">Live Farm Inventory</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              Fresh Products
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Buy directly from farmers with transparent pricing and no middleman markup.
            </p>
          </div>

          {searchQuery && (
            <div className="mt-3 md:mt-0 flex items-center gap-2 bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-xl text-xs font-semibold">
              <span>Filtering for: "{searchQuery}"</span>
              <button 
                onClick={() => setSearchQuery('')}
                className="text-slate-400 hover:text-slate-700 font-bold ml-1"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {/* Filter Controls Bar */}
        <ProductFilters
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          organicOnly={organicOnly}
          onOrganicChange={setOrganicOnly}
          priceRange={priceRange}
          onPriceRangeChange={setPriceRange}
          sortBy={sortBy}
          onSortChange={setSortBy}
          onResetFilters={handleResetFilters}
          totalResults={products.length}
        />

        {/* Content Display: Loading / Error / Empty / Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div key={n} className="bg-white rounded-2xl p-4 border border-slate-200 animate-pulse flex flex-col space-y-3">
                <div className="h-44 bg-slate-200 rounded-xl w-full"></div>
                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                <div className="h-3 bg-slate-100 rounded w-1/2"></div>
                <div className="h-8 bg-slate-100 rounded w-full mt-auto"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center max-w-lg mx-auto my-8">
            <p className="text-red-700 font-semibold mb-3">{error}</p>
            <button
              onClick={fetchProducts}
              className="btn-primary py-2 px-5 text-sm inline-flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-xl mx-auto my-8 shadow-sm">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-400">
              <SearchX className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No products available right now</h3>
            <p className="text-sm text-slate-500 mb-6">
              We couldn't find any products matching your current filters or search criteria.
            </p>
            <button
              onClick={handleResetFilters}
              className="btn-primary py-2.5 px-6 text-sm"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product._id || product.id} product={product} />
            ))}
          </div>
        )}

        {/* USP Transparency Banner inside Marketplace */}
        <section className="mt-16 bg-gradient-to-r from-emerald-900 to-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-4">
                <HeartHandshake className="w-4 h-4" />
                Fair Trade & Pure Food
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                Why AgriLink Price Transparency Matters
              </h3>
              <p className="text-slate-300 text-sm sm:text-base mt-3 max-w-2xl leading-relaxed">
                Traditional supply chains take up to 50% in middleman commissions. AgriLink displays the listed farmer price alongside market reference rates, ensuring 100% of the produce value goes to farmers while you enjoy fresh organic food at lower prices.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6">
                <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
                  <p className="text-2xl font-black text-emerald-400">100%</p>
                  <p className="text-xs text-slate-300">Direct Farmer Revenue</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
                  <p className="text-2xl font-black text-amber-400">&lt; 24h</p>
                  <p className="text-xs text-slate-300">Harvest to Doorstep</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 col-span-2 sm:col-span-1">
                  <p className="text-2xl font-black text-cyan-400">₹0</p>
                  <p className="text-xs text-slate-300">Hidden Middleman Fees</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 flex justify-center">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-5 border border-white/20 text-center max-w-xs w-full">
                <ShieldCheck className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                <h4 className="font-bold text-white text-base">Verified Quality Guarantee</h4>
                <p className="text-xs text-slate-300 mt-1">
                  Every farmer on AgriLink undergoes soil and harvest verification before listing.
                </p>
                <button
                  onClick={scrollToProducts}
                  className="mt-4 w-full py-2.5 rounded-xl bg-agri-green hover:bg-emerald-500 text-white text-xs font-bold transition-colors"
                >
                  Shop Fresh Now
                </button>
              </div>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
};

export default CustomerHome;
