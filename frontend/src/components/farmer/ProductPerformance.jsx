import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Package, TrendingUp, Award, Sparkles, Filter } from 'lucide-react';
import { formatCurrency } from '../../services/farmerService';

const ProductPerformance = ({ products = [], loading = false }) => {
  const [sortBy, setSortBy] = useState('revenue'); // 'revenue' | 'profit' | 'units'

  const sortedProducts = useMemo(() => {
    if (!products || products.length === 0) return [];
    const list = [...products];
    if (sortBy === 'profit') {
      list.sort((a, b) => (b.profit || 0) - (a.profit || 0));
    } else if (sortBy === 'units') {
      list.sort((a, b) => (b.units_sold || 0) - (a.units_sold || 0));
    } else {
      list.sort((a, b) => (b.revenue || 0) - (a.revenue || 0));
    }
    return list.slice(0, 5);
  }, [products, sortBy]);

  if (loading) {
    return (
      <div className="bg-white rounded-3xl border border-slate-100 shadow-premium p-6 sm:p-7 space-y-4 animate-pulse">
        <div className="flex justify-between items-center mb-6">
          <div className="w-48 h-6 bg-slate-100 rounded-lg" />
          <div className="w-20 h-4 bg-slate-100 rounded" />
        </div>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-12 h-12 bg-slate-100 rounded-2xl" />
            <div className="flex-1 space-y-2">
              <div className="w-36 h-4 bg-slate-100 rounded" />
              <div className="w-24 h-3 bg-slate-100 rounded" />
            </div>
            <div className="w-20 h-5 bg-slate-100 rounded" />
          </div>
        ))}
      </div>
    );
  }

  const maxVal = sortedProducts.length > 0 ? (sortedProducts[0][sortBy] || 1) : 1;

  return (
    <div className="bg-white rounded-3xl border border-slate-100/90 shadow-premium p-6 sm:p-7 transition-all duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              Crop Performance Leaderboard
            </h3>
            <span className="p-1 rounded-lg bg-amber-50 text-amber-600">
              <Award className="w-4 h-4" />
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">Top performing harvest items by sales & margins</p>
        </div>

        {/* Sort Pills */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start sm:self-auto text-xs">
          <button
            onClick={() => setSortBy('revenue')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
              sortBy === 'revenue' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Revenue
          </button>
          <button
            onClick={() => setSortBy('profit')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
              sortBy === 'profit' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Net Profit
          </button>
          <button
            onClick={() => setSortBy('units')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
              sortBy === 'units' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Units Sold
          </button>
        </div>
      </div>

      {sortedProducts.length === 0 ? (
        <div className="text-center py-10">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2">
            <Package className="w-6 h-6" />
          </div>
          <p className="text-slate-800 font-bold text-sm">No sales recorded yet</p>
          <p className="text-slate-400 text-xs mt-0.5 max-w-xs mx-auto">
            Once delivered orders are completed, your top crop revenue breakdown will appear here.
          </p>
          <Link
            to="/farmer/products/add"
            className="inline-flex items-center gap-1.5 mt-3 text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-3.5 py-1.5 rounded-xl transition-colors"
          >
            Add Crop to Catalog →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedProducts.map((p, idx) => {
            const marginPct = p.revenue > 0 ? Math.round((p.profit / p.revenue) * 100) : 0;
            const rankMedals = ['🥇', '🥈', '🥉'];

            return (
              <div
                key={p.product_id || idx}
                className="group p-3 hover:bg-slate-50 rounded-2xl border border-transparent hover:border-slate-200/60 transition-all"
              >
                <div className="flex items-center gap-3.5">
                  {/* Rank & Image */}
                  <div className="relative shrink-0">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 overflow-hidden border border-slate-200 flex items-center justify-center text-xl">
                      {p.image && p.image.startsWith('http') ? (
                        <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      ) : (
                        <span>{p.image || '🌾'}</span>
                      )}
                    </div>
                    {idx < 3 && (
                      <span className="absolute -top-1.5 -left-1.5 text-xs">
                        {rankMedals[idx]}
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-bold text-sm text-slate-900 truncate group-hover:text-emerald-700 transition-colors">
                        {p.name}
                      </h4>
                      <span className="font-black text-sm text-slate-900 shrink-0">
                        {formatCurrency(p.revenue)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2 mt-1 text-xs text-slate-500">
                      <span className="text-[11px] text-slate-400">
                        {p.units_sold} {p.unit} sold • ₹{p.price}/{p.unit}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-emerald-600 text-[11px]">
                          +{formatCurrency(p.profit)} profit
                        </span>
                        {marginPct > 0 && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                            {marginPct}%
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Performance progress meter */}
                    <div className="mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-700"
                        style={{
                          width: `${Math.min(100, Math.max(8, ((p[sortBy] || 0) / maxVal) * 100))}%`
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-400">Showing top {sortedProducts.length} crops</span>
            <Link
              to="/farmer/products"
              className="font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 hover:underline"
            >
              Manage All Products <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductPerformance;
