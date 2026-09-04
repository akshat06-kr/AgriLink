import React, { useState, useMemo } from 'react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, ComposedChart
} from 'recharts';
import {
  TrendingUp, TrendingDown, DollarSign, BarChart2,
  PieChart as PieIcon, Activity, Calendar, ArrowUpRight
} from 'lucide-react';
import { formatCurrency } from '../../services/farmerService';

const TIMEFRAMES = [
  { label: 'This Month', key: '1month' },
  { label: 'Last 3 Months', key: '3months' },
  { label: 'Last 6 Months', key: '6months' },
  { label: 'Full Year', key: 'year' },
];

const CHART_MODES = [
  { id: 'financials', label: 'Financial Performance', icon: DollarSign },
  { id: 'volume', label: 'Sales & Units Volume', icon: BarChart2 },
  { id: 'margins', label: 'Profit Margin (%)', icon: Activity },
];

const CustomFinancialTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  const rev = payload.find(p => p.dataKey === 'revenue')?.value || 0;
  const exp = payload.find(p => p.dataKey === 'expenses')?.value || 0;
  const prof = payload.find(p => p.dataKey === 'profit')?.value || (rev - exp);
  const margin = rev > 0 ? Math.round((prof / rev) * 100) : 0;

  return (
    <div className="bg-slate-900/95 backdrop-blur-md text-white border border-slate-700/60 rounded-2xl shadow-2xl p-4 min-w-[200px] text-xs">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
        <span className="font-bold text-slate-200 text-sm">{label} Overview</span>
        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${margin >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
          {margin}% Margin
        </span>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
            Revenue:
          </span>
          <span className="font-bold text-emerald-400">₹{Number(rev).toLocaleString('en-IN')}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
            Expenses:
          </span>
          <span className="font-bold text-amber-400">₹{Number(exp).toLocaleString('en-IN')}</span>
        </div>

        <div className="flex items-center justify-between pt-1.5 mt-1 border-t border-slate-800">
          <span className="flex items-center gap-1.5 text-slate-200 font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
            Net Profit:
          </span>
          <span className={`font-black text-sm ${prof >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
            {prof < 0 ? '−' : ''}₹{Math.abs(Number(prof)).toLocaleString('en-IN')}
          </span>
        </div>
      </div>
    </div>
  );
};

const CustomVolumeTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const units = payload.find(p => p.dataKey === 'units_sold')?.value || 0;
  const orders = payload.find(p => p.dataKey === 'orders')?.value || 0;

  return (
    <div className="bg-slate-900/95 backdrop-blur-md text-white border border-slate-700/60 rounded-2xl shadow-2xl p-4 min-w-[180px] text-xs">
      <p className="font-bold text-slate-200 text-sm mb-2 pb-1.5 border-b border-slate-800">{label} Volume</p>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-emerald-300 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Units Sold:
          </span>
          <span className="font-bold text-white">{units} units</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sky-300 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400" /> Orders Delivered:
          </span>
          <span className="font-bold text-white">{orders} orders</span>
        </div>
      </div>
    </div>
  );
};

const RevenueChart = ({ chartData = [], loading = false }) => {
  const [activeTimeframe, setActiveTimeframe] = useState('6months');
  const [activeMode, setActiveMode] = useState('financials');

  // Filter chart data by timeframe
  const filteredData = useMemo(() => {
    if (!chartData || chartData.length === 0) return [];

    switch (activeTimeframe) {
      case '1month':
        return chartData.slice(-1);
      case '3months':
        return chartData.slice(-3);
      case '6months':
        return chartData.slice(-6);
      case 'year':
      default:
        return chartData;
    }
  }, [chartData, activeTimeframe]);

  // Aggregate stats
  const totals = useMemo(() => {
    const rev = filteredData.reduce((sum, d) => sum + (Number(d.revenue) || 0), 0);
    const exp = filteredData.reduce((sum, d) => sum + (Number(d.expenses) || 0), 0);
    const prof = rev - exp;
    const margin = rev > 0 ? Math.round((prof / rev) * 100) : 0;
    const units = filteredData.reduce((sum, d) => sum + (Number(d.units_sold) || 0), 0);

    return { rev, exp, prof, margin, units };
  }, [filteredData]);

  if (loading) {
    return (
      <div className="bg-white rounded-3xl border border-slate-100/90 shadow-premium p-6 sm:p-8 animate-pulse space-y-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="space-y-2">
            <div className="w-48 h-6 bg-slate-100 rounded-lg" />
            <div className="w-64 h-4 bg-slate-100 rounded" />
          </div>
          <div className="w-60 h-9 bg-slate-100 rounded-xl" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-slate-100 rounded-2xl" />)}
        </div>
        <div className="h-72 bg-slate-50 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-100/90 shadow-premium p-5 sm:p-7 transition-all duration-300">
      {/* ── Top Header Controls ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              Farm Financial Trends & Analytics
            </h3>
            <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
              Delivered Orders
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Interactive real-time curves for revenue realization, farming expenses, and net profit margins
          </p>
        </div>

        {/* Timeframe selector pills */}
        <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-2xl border border-slate-200/60 self-start lg:self-auto overflow-x-auto max-w-full">
          {TIMEFRAMES.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTimeframe(t.key)}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
                activeTimeframe === t.key
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Chart Mode Tabs & Summary Counters ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-slate-50 hover:bg-emerald-50/40 rounded-2xl p-3.5 border border-slate-100 transition-colors">
          <span className="text-[11px] font-semibold text-slate-500">Period Revenue</span>
          <p className="text-lg font-black text-emerald-600 mt-0.5">
            {formatCurrency(totals.rev)}
          </p>
          <span className="text-[10px] text-emerald-700 font-medium">Realized sales</span>
        </div>

        <div className="bg-slate-50 hover:bg-amber-50/40 rounded-2xl p-3.5 border border-slate-100 transition-colors">
          <span className="text-[11px] font-semibold text-slate-500">Period Expenses</span>
          <p className="text-lg font-black text-amber-600 mt-0.5">
            {formatCurrency(totals.exp)}
          </p>
          <span className="text-[10px] text-amber-700 font-medium">Inputs & operations</span>
        </div>

        <div className="bg-slate-50 hover:bg-blue-50/40 rounded-2xl p-3.5 border border-slate-100 transition-colors">
          <span className="text-[11px] font-semibold text-slate-500">Net Farm Profit</span>
          <p className={`text-lg font-black mt-0.5 ${totals.prof >= 0 ? 'text-blue-600' : 'text-red-500'}`}>
            {formatCurrency(totals.prof)}
          </p>
          <span className="text-[10px] text-blue-700 font-medium">Take-home income</span>
        </div>

        <div className="bg-slate-50 hover:bg-purple-50/40 rounded-2xl p-3.5 border border-slate-100 transition-colors">
          <span className="text-[11px] font-semibold text-slate-500">Avg Profit Margin</span>
          <p className="text-lg font-black text-purple-600 mt-0.5">
            {totals.margin}%
          </p>
          <span className="text-[10px] text-purple-700 font-medium">{totals.units} units sold</span>
        </div>
      </div>

      {/* Chart View Switcher */}
      <div className="flex items-center gap-2 mb-4">
        {CHART_MODES.map((mode) => {
          const Icon = mode.icon;
          const isActive = activeMode === mode.id;
          return (
            <button
              key={mode.id}
              onClick={() => setActiveMode(mode.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {mode.label}
            </button>
          );
        })}
      </div>

      {/* ── Main Chart Area ── */}
      {filteredData.length === 0 ? (
        <div className="h-72 flex flex-col items-center justify-center gap-2 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
          <div className="text-3xl">📊</div>
          <p className="text-slate-700 text-sm font-bold">No data recorded for this timeframe</p>
          <p className="text-slate-400 text-xs">New delivered orders and expenses will appear here automatically.</p>
        </div>
      ) : (
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {activeMode === 'financials' && (
              <AreaChart data={filteredData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="profGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `₹${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`}
                />
                <Tooltip content={<CustomFinancialTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: '12px', paddingTop: '16px' }}
                  formatter={(val) => <span className="text-slate-700 font-bold text-xs">{val}</span>}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="Gross Revenue"
                  stroke="#059669"
                  strokeWidth={3}
                  fill="url(#revGrad)"
                  dot={{ r: 4, fill: '#059669', strokeWidth: 2, stroke: '#ffffff' }}
                  activeDot={{ r: 6 }}
                />
                <Area
                  type="monotone"
                  dataKey="expenses"
                  name="Expenses"
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                  fill="url(#expGrad)"
                  dot={{ r: 3, fill: '#f59e0b', strokeWidth: 2, stroke: '#ffffff' }}
                  activeDot={{ r: 5 }}
                />
                <Area
                  type="monotone"
                  dataKey="profit"
                  name="Net Profit"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  fill="url(#profGrad)"
                  dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#ffffff' }}
                  activeDot={{ r: 6 }}
                />
              </AreaChart>
            )}

            {activeMode === 'volume' && (
              <BarChart data={filteredData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomVolumeTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: '12px', paddingTop: '16px' }}
                  formatter={(val) => <span className="text-slate-700 font-bold text-xs">{val}</span>}
                />
                <Bar
                  dataKey="units_sold"
                  name="Total Units Sold"
                  fill="#059669"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={32}
                />
                <Bar
                  dataKey="orders"
                  name="Delivered Orders"
                  fill="#0284c7"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={32}
                />
              </BarChart>
            )}

            {activeMode === 'margins' && (
              <ComposedChart data={filteredData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${v}%`}
                />
                <Tooltip
                  formatter={(value) => [`${value}%`, 'Profit Margin']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '16px',
                    color: '#fff',
                    border: '1px solid #334155'
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '12px', paddingTop: '16px' }}
                  formatter={(val) => <span className="text-slate-700 font-bold text-xs">{val}</span>}
                />
                <Line
                  type="monotone"
                  dataKey="margin_pct"
                  name="Net Margin %"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  dot={{ r: 5, fill: '#8b5cf6', strokeWidth: 2, stroke: '#ffffff' }}
                  activeDot={{ r: 7 }}
                />
              </ComposedChart>
            )}
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default RevenueChart;
