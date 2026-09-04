import React from 'react';
import { Search, Sparkles, ShieldCheck, Truck, TrendingDown, ArrowRight } from 'lucide-react';

const CustomerHero = ({ searchQuery, onSearchChange, onExploreClick }) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-emerald-50/70 via-white to-surface-50 py-10 sm:py-14 md:py-16 border-b border-slate-100">
      {/* Background Decorative Blur Elements */}
      <div className="absolute top-0 right-10 w-96 h-96 bg-emerald-200/30 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
      <div className="absolute bottom-0 left-10 w-80 h-80 bg-amber-100/40 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Hero Content */}
          <div className="lg:col-span-7 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-200 text-agri-green text-xs font-bold uppercase tracking-wider mb-5 sm:mb-6 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              100% Direct Farmer Marketplace
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
              Fresh From <span className="text-agri-green">Local Farms</span>
            </h1>

            <p className="mt-3 sm:mt-4 text-sm sm:text-base lg:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Discover fresh vegetables, fruits, crops and dairy products directly from farmers with full price transparency.
            </p>

            {/* Responsive Search Bar with No Clipping */}
            <div className="mt-6 sm:mt-8 max-w-xl mx-auto lg:mx-0">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center bg-white rounded-2xl sm:rounded-3xl shadow-xl shadow-emerald-950/5 border border-slate-200/80 p-1.5 sm:p-2 focus-within:border-agri-green focus-within:ring-4 focus-within:ring-emerald-500/10 transition-all gap-2">
                <div className="flex items-center flex-1 min-w-0 px-2">
                  <Search className="w-5 h-5 text-slate-400 ml-1 shrink-0" />
                  <input
                    type="text"
                    placeholder="Search fresh produce, farmer, location..."
                    value={searchQuery || ''}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full px-3 py-2.5 sm:py-3 text-slate-800 placeholder-slate-400 bg-transparent focus:outline-none text-sm sm:text-base font-medium min-w-0"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => onSearchChange('')}
                      className="text-xs text-slate-400 hover:text-slate-600 px-2 py-1 font-semibold shrink-0"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <button
                  onClick={onExploreClick}
                  className="btn-primary py-2.5 sm:py-3 px-5 sm:px-6 text-xs sm:text-sm font-bold whitespace-nowrap shadow-none rounded-xl shrink-0 flex items-center justify-center gap-1.5"
                >
                  <span>Explore Products</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Value Props Pills */}
            <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3.5 max-w-lg mx-auto lg:mx-0 pt-4 border-t border-slate-200/60">
              <div className="flex items-center gap-2.5 bg-slate-50/70 sm:bg-transparent p-2.5 sm:p-0 rounded-xl">
                <div className="p-2 rounded-xl bg-emerald-100 text-agri-green shrink-0 shadow-sm">
                  <TrendingDown className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-slate-900">Save 20-30%</p>
                  <p className="text-[11px] text-slate-500">Transparent Prices</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 bg-slate-50/70 sm:bg-transparent p-2.5 sm:p-0 rounded-xl">
                <div className="p-2 rounded-xl bg-amber-100 text-amber-700 shrink-0 shadow-sm">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-slate-900">Verified Farms</p>
                  <p className="text-[11px] text-slate-500">Pure & Chemical-Free</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 bg-slate-50/70 sm:bg-transparent p-2.5 sm:p-0 rounded-xl">
                <div className="p-2 rounded-xl bg-blue-100 text-blue-700 shrink-0 shadow-sm">
                  <Truck className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-slate-900">Direct Harvest</p>
                  <p className="text-[11px] text-slate-500">24-hr Fresh Delivery</p>
                </div>
              </div>
            </div>

          </div>

          {/* Right Hero Visual Picture with Interactive Hover Effect */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-md group cursor-pointer">
              {/* Outer Glowing Gradient Ring */}
              <div className="absolute -inset-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-amber-500 rounded-3xl blur-md opacity-30 group-hover:opacity-75 transition duration-500 group-hover:duration-200"></div>

              {/* Main Image Frame with Smooth Scale, Zoom & Tilt */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-emerald-900/20 border-4 border-white bg-slate-100 aspect-[4/3] sm:aspect-square transform group-hover:-translate-y-1.5 transition-all duration-500">
                <img
                  src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80"
                  alt="Fresh farm produce vegetables and fruits"
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
                />

                {/* Ambient Shimmer / Sheen Layer on Hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>
                
                {/* Floating Price Transparency Badge */}
                <div className="absolute bottom-3.5 left-3.5 right-3.5 bg-white/95 backdrop-blur-md rounded-2xl p-3 sm:p-3.5 shadow-xl border border-white/60 flex items-center justify-between transform group-hover:translate-y-[-2px] transition-transform duration-300">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-agri-green tracking-wider">USP Price Guarantee</span>
                    <p className="text-xs font-bold text-slate-900">Farmer Price = What You Pay + Delivery</p>
                  </div>
                  <div className="bg-emerald-100 text-agri-green px-2.5 py-1 rounded-xl text-xs font-black shadow-sm group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    Zero Brokerage
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CustomerHero;
