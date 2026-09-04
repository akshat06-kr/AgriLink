import React, { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, ReferenceLine, Cell
} from 'recharts';
import {
  TrendingUp, TrendingDown, ArrowUpRight, Scale, ShieldCheck,
  HelpCircle, Sliders, Sparkles, Filter, Search, ArrowRight,
  Info, CheckCircle2, AlertTriangle, Zap, Tag
} from 'lucide-react';
import { formatCurrency } from '../../services/farmerService';

const PriceComparisonHub = ({ items = [], marketIntelligence = null, loading = false }) => {
  const [viewMode, setViewMode] = useState('chart'); // 'chart' | 'range' | 'simulator'
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProductForSim, setSelectedProductForSim] = useState(null);
  const [simulatedPrice, setSimulatedPrice] = useState(0);

  // Extract categories
  const categories = useMemo(() => {
    const set = new Set(items.map(i => i.category).filter(Boolean));
    return ['all', ...Array.from(set)];
  }, [items]);

  // Filtered items
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchCat = selectedCategory === 'all' || item.category?.toLowerCase() === selectedCategory.toLowerCase();
      const matchSearch = !searchQuery || item.name?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [items, selectedCategory, searchQuery]);

  // Handle simulator item selection
  const currentSimItem = useMemo(() => {
    if (selectedProductForSim) {
      const found = items.find(i => i.product_id === selectedProductForSim);
      if (found) return found;
    }
    return filteredItems[0] || items[0] || null;
  }, [selectedProductForSim, items, filteredItems]);

  // Sync simulator price on item change
  React.useEffect(() => {
    if (currentSimItem) {
      setSimulatedPrice(currentSimItem.your_price || 40);
    }
  }, [currentSimItem]);

  // Chart formatting data
  const chartData = useMemo(() => {
    return filteredItems.slice(0, 8).map(item => ({
      name: item.name.length > 12 ? item.name.substring(0, 10) + '..' : item.name,
      fullName: item.name,
      unit: item.unit || 'kg',
      mandiLow: item.mandi_low || (item.market_price * 0.78),
      yourPrice: item.your_price,
      marketPrice: item.market_price,
      retailHigh: item.retail_high || (item.market_price * 1.45),
      farmerBoostPct: item.farmer_boost_pct,
      consumerSavingsPct: item.consumer_savings_pct,
      productionCost: item.production_cost || (item.your_price * 0.55),
    }));
  }, [filteredItems]);

  if (loading) {
    return (
      <div className="bg-white rounded-3xl border border-slate-100/80 shadow-premium p-6 sm:p-8 animate-pulse space-y-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="space-y-2">
            <div className="w-56 h-6 bg-slate-100 rounded-lg" />
            <div className="w-80 h-4 bg-slate-100 rounded" />
          </div>
          <div className="w-48 h-10 bg-slate-100 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-slate-100 rounded-2xl" />)}
        </div>
        <div className="h-72 bg-slate-50 rounded-2xl" />
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-slate-100/80 shadow-premium p-8 text-center">
        <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-3 text-agri-green">
          <Scale className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">Price Transparency & Market Benchmark</h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">
          Add crops to your inventory to access live Mandi wholesale low prices vs direct-to-consumer retail high price comparisons.
        </p>
      </div>
    );
  }

  // Summary figures
  const avgBoost = marketIntelligence?.avg_farmer_boost_pct || 
    (items.reduce((acc, cur) => acc + (cur.farmer_boost_pct || 0), 0) / (items.length || 1)).toFixed(1);
  const avgSavings = marketIntelligence?.avg_consumer_savings_pct || 
    (items.reduce((acc, cur) => acc + (cur.consumer_savings_pct || 0), 0) / (items.length || 1)).toFixed(1);

  // Custom Chart Tooltip
  const CustomPriceTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    const data = payload[0]?.payload;
    if (!data) return null;

    return (
      <div className="bg-slate-900/95 backdrop-blur-md text-white border border-slate-700/60 rounded-2xl shadow-2xl p-4 min-w-[240px] text-xs">
        <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-800">
          <span className="font-bold text-sm text-white">{data.fullName}</span>
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold text-[10px]">
            per {data.unit}
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
              Mandi Floor (Wholesale Low):
            </span>
            <span className="font-bold text-amber-300">₹{data.mandiLow}</span>
          </div>

          <div className="flex items-center justify-between bg-emerald-950/60 -mx-1.5 px-1.5 py-1 rounded-lg border border-emerald-500/30">
            <span className="flex items-center gap-1.5 text-emerald-300 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block ring-2 ring-emerald-400/40" />
              Your Direct Price:
            </span>
            <span className="font-extrabold text-emerald-300 text-sm">₹{data.yourPrice}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400 inline-block" />
              Avg Market Reference:
            </span>
            <span className="font-bold text-blue-300">₹{data.marketPrice}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400 inline-block" />
              Supermarket High:
            </span>
            <span className="font-bold text-purple-300">₹{data.retailHigh}</span>
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between gap-2 text-[11px]">
          <span className="text-emerald-400 font-medium">
            🌾 Farmer: +{data.farmerBoostPct}% over Mandi
          </span>
          <span className="text-sky-300 font-medium">
            🏷️ Buyer: -{data.consumerSavingsPct}% vs Supermarket
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100/90 shadow-premium p-5 sm:p-7 transition-all duration-300">
      {/* ── Section Header ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  Market Price Intelligence & Spread Analysis
                </h2>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  <Sparkles className="w-3 h-3 text-emerald-600" /> Live Benchmark
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Benchmark your selling rates against wholesale Mandi floor (Low) vs Supermarket ceiling (High)
              </p>
            </div>
          </div>
        </div>

        {/* View mode switcher */}
        <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-2xl border border-slate-200/60 self-start lg:self-auto">
          <button
            onClick={() => setViewMode('chart')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'chart'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart className="w-3.5 h-3.5 text-emerald-600" />
            Comparison Chart
          </button>
          <button
            onClick={() => setViewMode('range')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'range'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-amber-600" />
            Low-High Spread
          </button>
          <button
            onClick={() => setViewMode('simulator')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'simulator'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-purple-600" />
            Price Simulator
          </button>
        </div>
      </div>

      {/* ── KPI Metric Highlights ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-6">
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50/40 rounded-2xl p-4 border border-emerald-100/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-800">Farmer Realization Boost</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-200/80 text-emerald-900 font-bold">
              +{avgBoost}% avg
            </span>
          </div>
          <p className="text-2xl font-black text-emerald-700 mt-1">Direct Premium</p>
          <p className="text-[11px] text-emerald-600/90 mt-0.5">
            You earn substantially higher revenue per kg compared to local middleman/mandi floor rates.
          </p>
        </div>

        <div className="bg-gradient-to-br from-sky-50 to-blue-50/40 rounded-2xl p-4 border border-sky-100/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-sky-800">Consumer Value Savings</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-sky-200/80 text-sky-900 font-bold">
              -{avgSavings}% avg
            </span>
          </div>
          <p className="text-2xl font-black text-sky-700 mt-1">Fair & Direct</p>
          <p className="text-[11px] text-sky-600/90 mt-0.5">
            Buyers save money compared to high supermarket markups, giving your listings top demand.
          </p>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-orange-50/40 rounded-2xl p-4 border border-amber-100/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-800">Market Sweet Spot</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-900 font-bold">
              {filteredItems.length} Crops Active
            </span>
          </div>
          <p className="text-2xl font-black text-amber-700 mt-1">100% Transparent</p>
          <p className="text-[11px] text-amber-600/90 mt-0.5">
            Real-time price visibility builds lasting customer trust and drives repeat farm orders.
          </p>
        </div>
      </div>

      {/* ── Filters and Search ── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-4 mb-5 border-b border-slate-100">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-60">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search crop benchmark..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800 placeholder-slate-400"
          />
        </div>
      </div>

      {/* ── VIEW 1: COMPARISON CHART ── */}
      {viewMode === 'chart' && (
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3 px-1 text-xs text-slate-500">
            <span className="font-semibold text-slate-700">Price Comparison by Crop (₹ per Unit)</span>
            <div className="flex items-center gap-4 text-[11px]">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-amber-400 inline-block" /> Mandi Low (Wholesale)
              </span>
              <span className="flex items-center gap-1.5 font-bold text-emerald-700">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-600 inline-block" /> Your Selling Price
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-purple-500 inline-block" /> Supermarket High
              </span>
            </div>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 12, right: 10, left: -10, bottom: 20 }}
                barGap={3}
                barCategoryGap="20%"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickLine={false}
                  interval={0}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `₹${val}`}
                />
                <Tooltip content={<CustomPriceTooltip />} />
                
                {/* Mandi Wholesale Floor Price */}
                <Bar
                  dataKey="mandiLow"
                  name="Mandi Wholesale Low"
                  fill="#fbbf24"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={22}
                />

                {/* Farmer Direct Listing Price */}
                <Bar
                  dataKey="yourPrice"
                  name="Your Direct Price"
                  fill="#059669"
                  radius={[5, 5, 0, 0]}
                  maxBarSize={24}
                />

                {/* Supermarket Retail High Price */}
                <Bar
                  dataKey="retailHigh"
                  name="Supermarket High"
                  fill="#8b5cf6"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={22}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-4 p-3 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>Strategic Advantage:</strong> By setting your price between <strong>Mandi Low</strong> and <strong>Supermarket High</strong>, you maximize farm profit while guaranteeing buyer value.
              </span>
            </div>
            <button
              onClick={() => setViewMode('simulator')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 whitespace-nowrap"
            >
              Test Price Simulator <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ── VIEW 2: LOW-HIGH RANGE SPREAD METERS ── */}
      {viewMode === 'range' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredItems.map((item, idx) => {
              const mandiLow = item.mandi_low || Math.round(item.market_price * 0.78);
              const retailHigh = item.retail_high || Math.round(item.market_price * 1.45);
              const totalSpread = Math.max(1, retailHigh - mandiLow);
              const currentOffsetPct = Math.min(100, Math.max(0, ((item.your_price - mandiLow) / totalSpread) * 100));
              const prodCost = item.production_cost || Math.round(item.your_price * 0.55);
              const profitPerUnit = item.your_price - prodCost;

              return (
                <div
                  key={item.product_id || idx}
                  className="bg-slate-50/70 hover:bg-slate-50 rounded-2xl p-4 border border-slate-200/70 hover:border-emerald-300 transition-all shadow-sm"
                >
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-base shrink-0 overflow-hidden">
                        {item.image && item.image.startsWith('http') ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <span>{item.image || '🌾'}</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-sm text-slate-900 truncate">{item.name}</h4>
                        <span className="text-[11px] text-slate-400 capitalize">{item.category} • per {item.unit}</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-base font-black text-emerald-600">₹{item.your_price}</span>
                      <span className="block text-[10px] font-semibold text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-full">
                        +₹{profitPerUnit} profit/{item.unit}
                      </span>
                    </div>
                  </div>

                  {/* ── High - Low Spectrum Visualizer ── */}
                  <div className="mt-3 mb-2">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-1.5">
                      <span className="text-amber-700">Mandi Low: ₹{mandiLow}</span>
                      <span className="text-slate-400 text-[10px]">Market Avg: ₹{item.market_price}</span>
                      <span className="text-purple-700">Retail High: ₹{retailHigh}</span>
                    </div>

                    {/* Multi-tier spectrum bar */}
                    <div className="relative h-3 bg-gradient-to-r from-amber-200 via-emerald-200 to-purple-300 rounded-full overflow-visible">
                      {/* Farmer position needle */}
                      <div
                        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center z-10 transition-all duration-300"
                        style={{ left: `${currentOffsetPct}%` }}
                      >
                        <div className="w-4 h-4 bg-emerald-600 border-2 border-white rounded-full shadow-md ring-2 ring-emerald-400/40" />
                      </div>
                    </div>
                  </div>

                  {/* Badges footer */}
                  <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-xs">
                    <span className="text-emerald-700 font-bold flex items-center gap-1 text-[11px]">
                      <TrendingUp className="w-3.5 h-3.5" />
                      +{item.farmer_boost_pct || Math.round(((item.your_price - mandiLow) / mandiLow) * 100)}% vs Mandi Floor
                    </span>
                    <span className="text-sky-700 font-semibold text-[11px]">
                      -{item.consumer_savings_pct || Math.round(((retailHigh - item.your_price) / retailHigh) * 100)}% vs Supermarket
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── VIEW 3: INTERACTIVE PRICE & PROFIT SIMULATOR ── */}
      {viewMode === 'simulator' && currentSimItem && (
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-slate-700/60">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-700/60">
            <div>
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Dynamic Pricing & Revenue Simulator</h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Simulate adjusting your selling price within the live market floor and ceiling to evaluate margin & buyer demand.
              </p>
            </div>

            {/* Crop selector */}
            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-300">Select Crop:</label>
              <select
                value={currentSimItem.product_id}
                onChange={(e) => {
                  setSelectedProductForSim(e.target.value);
                  const found = items.find(i => i.product_id === e.target.value);
                  if (found) setSimulatedPrice(found.your_price);
                }}
                className="bg-slate-800 border border-slate-600 text-white text-xs font-semibold rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {items.map(i => (
                  <option key={i.product_id} value={i.product_id}>
                    {i.name} (Current: ₹{i.your_price}/{i.unit})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {(() => {
            const mandiLow = currentSimItem.mandi_low || Math.round(currentSimItem.market_price * 0.78);
            const retailHigh = currentSimItem.retail_high || Math.round(currentSimItem.market_price * 1.45);
            const prodCost = currentSimItem.production_cost || Math.round(currentSimItem.your_price * 0.55);
            const simProfit = Math.round(simulatedPrice - prodCost);
            const simMarginPct = simulatedPrice > 0 ? Math.round((simProfit / simulatedPrice) * 100) : 0;
            const simFarmerBoost = Math.round(((simulatedPrice - mandiLow) / mandiLow) * 100);
            const simConsumerSavings = Math.round(((retailHigh - simulatedPrice) / retailHigh) * 100);

            return (
              <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
                {/* Simulator Controls */}
                <div className="lg:col-span-2 space-y-5">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-slate-300">Test Selling Price:</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black text-emerald-400">₹{simulatedPrice}</span>
                        <span className="text-xs text-slate-400">/ {currentSimItem.unit}</span>
                      </div>
                    </div>

                    <input
                      type="range"
                      min={Math.max(10, Math.floor(mandiLow * 0.85))}
                      max={Math.ceil(retailHigh * 1.15)}
                      value={simulatedPrice}
                      onChange={(e) => setSimulatedPrice(Number(e.target.value))}
                      className="w-full h-2.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />

                    <div className="flex items-center justify-between text-xs text-slate-400 mt-2">
                      <span>Wholesale Min: ₹{mandiLow}</span>
                      <span className="text-emerald-400 font-semibold">Active: ₹{currentSimItem.your_price}</span>
                      <span>Supermarket Max: ₹{retailHigh}</span>
                    </div>
                  </div>

                  {/* Comparison metrics */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700 text-center">
                      <span className="text-[11px] text-slate-400">Net Profit</span>
                      <p className={`text-lg font-black mt-0.5 ${simProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        ₹{simProfit} <span className="text-xs font-normal">/{currentSimItem.unit}</span>
                      </p>
                      <span className="text-[10px] text-slate-400">Margin: {simMarginPct}%</span>
                    </div>

                    <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700 text-center">
                      <span className="text-[11px] text-slate-400">Mandi Boost</span>
                      <p className="text-lg font-black text-amber-400 mt-0.5">
                        {simFarmerBoost >= 0 ? `+${simFarmerBoost}%` : `${simFarmerBoost}%`}
                      </p>
                      <span className="text-[10px] text-slate-400">over wholesale floor</span>
                    </div>

                    <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700 text-center">
                      <span className="text-[11px] text-slate-400">Buyer Savings</span>
                      <p className="text-lg font-black text-sky-400 mt-0.5">
                        {simConsumerSavings >= 0 ? `-${simConsumerSavings}%` : `+${Math.abs(simConsumerSavings)}%`}
                      </p>
                      <span className="text-[10px] text-slate-400">vs supermarket rate</span>
                    </div>
                  </div>
                </div>

                {/* Score / Verdict Card */}
                <div className="bg-emerald-950/60 rounded-2xl p-5 border border-emerald-500/30 text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-sm text-emerald-300">
                    {simulatedPrice > retailHigh
                      ? '⚠️ Premium High Pricing'
                      : simulatedPrice < mandiLow
                      ? '⚠️ Below Wholesale Floor'
                      : '✨ Optimal Sweet Spot'}
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {simulatedPrice > retailHigh
                      ? 'Price is higher than retail supermarkets. May lower customer purchase conversion.'
                      : simulatedPrice < mandiLow
                      ? 'Price is lower than local wholesale mandis. You are leaving potential profit on the table.'
                      : 'Perfect direct pricing! You gain maximum farm profits while consumers enjoy attractive direct savings.'}
                  </p>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default PriceComparisonHub;
