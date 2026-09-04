import React from 'react';
import { Filter, RotateCcw, ArrowUpDown, Star, Sprout } from 'lucide-react';

const ProductFilters = ({
  selectedCategory,
  onCategoryChange,
  organicOnly,
  onOrganicChange,
  priceRange,
  onPriceRangeChange,
  sortBy,
  onSortChange,
  onResetFilters,
  totalResults
}) => {
  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-6">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        
        {/* Left: Quick Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider bg-slate-100 px-3 py-2 rounded-xl">
            <Filter className="w-3.5 h-3.5 text-agri-green" />
            Filters
          </div>

          {/* Organic Only Toggle Button */}
          <button
            onClick={() => onOrganicChange(!organicOnly)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-colors ${
              organicOnly 
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Sprout className="w-3.5 h-3.5 text-agri-green" />
            Organic Only
          </button>

          {/* Max Price selector */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs">
            <span className="text-slate-500 font-medium">Max Price:</span>
            <span className="font-bold text-slate-900">₹{priceRange}</span>
            <input
              type="range"
              min="20"
              max="500"
              step="10"
              value={priceRange}
              onChange={(e) => onPriceRangeChange(Number(e.target.value))}
              className="w-24 accent-agri-green cursor-pointer"
            />
          </div>

          {/* Reset Filters */}
          <button
            onClick={onResetFilters}
            className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors"
            title="Reset all filters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>

        {/* Right: Results Count & Sort Dropdown */}
        <div className="flex items-center justify-between lg:justify-end gap-3 border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100">
          <span className="text-xs text-slate-500 font-medium">
            Showing <strong className="text-slate-900">{totalResults}</strong> items
          </span>

          <div className="flex items-center gap-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-agri-light/30 cursor-pointer"
            >
              <option value="newest">Newest Harvest</option>
              <option value="price_asc">Price: Low → High</option>
              <option value="price_desc">Price: High → Low</option>
              <option value="rating">Highest Rating</option>
            </select>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProductFilters;
