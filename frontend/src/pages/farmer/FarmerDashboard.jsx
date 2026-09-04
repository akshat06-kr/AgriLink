import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import FarmerSidebar from '../../components/farmer/FarmerSidebar';
import FinancialCard from '../../components/farmer/FinancialCard';
import RevenueChart from '../../components/farmer/RevenueChart';
import PriceComparisonHub from '../../components/farmer/PriceComparisonHub';
import ExpenseModal from '../../components/farmer/ExpenseModal';
import TransactionTable from '../../components/farmer/TransactionTable';
import ProductPerformance from '../../components/farmer/ProductPerformance';
import OrderPreview from '../../components/farmer/OrderPreview';
import QuickActions from '../../components/farmer/QuickActions';
import NotificationPreview from '../../components/farmer/NotificationPreview';
import { fetchDashboard, fetchFarmerOrders, fetchNotifications, formatCurrency } from '../../services/farmerService';
import {
  DollarSign, TrendingUp, TrendingDown, Calendar, Clock,
  Bell, Menu, AlertCircle, RefreshCw, ArrowUp, ArrowDown,
  BarChart3, ShoppingCart, Package, Scale, Sparkles, ShieldCheck,
  Zap, PlusCircle, FileText, CheckCircle2, ChevronRight, Activity
} from 'lucide-react';

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
};

const ProfitLossCard = ({ data, loading, onAddExpense }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-3xl border border-slate-100 shadow-premium p-6 sm:p-7 h-72 animate-pulse" />
    );
  }
  if (!data) return null;
  const { gross_sales = 0, total_expenses = 0, net_profit = 0, expense_by_category = {}, is_profit = true } = data;
  const marginPct = gross_sales > 0 ? Math.round((net_profit / gross_sales) * 100) : 0;

  return (
    <div className="bg-white rounded-3xl border border-slate-100/90 shadow-premium p-6 sm:p-7 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">Farm Profit & Loss</h3>
              <p className="text-xs text-slate-400">All-time realized revenue vs operational costs</p>
            </div>
          </div>

          <button
            onClick={onAddExpense}
            className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" /> + Log Expense
          </button>
        </div>

        {/* Revenue Line */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-600">Delivered Crop Sales (Gross)</span>
            <span className="text-sm font-black text-emerald-600">{formatCurrency(gross_sales)}</span>
          </div>

          {/* Expense categories */}
          <div className="space-y-1.5 pl-2">
            {Object.entries(expense_by_category || {}).slice(0, 4).map(([cat, amt]) => (
              <div key={cat} className="flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" /> {cat}
                </span>
                <span className="font-semibold text-amber-600">−{formatCurrency(amt)}</span>
              </div>
            ))}
            {Object.keys(expense_by_category || {}).length === 0 && (
              <p className="text-xs text-slate-400 italic">No farm expenses recorded yet</p>
            )}
            <div className="flex items-center justify-between py-1.5 border-t border-dashed border-slate-200 mt-1">
              <span className="text-xs font-bold text-slate-700">Total Farm Expenses</span>
              <span className="text-xs font-black text-amber-600">−{formatCurrency(total_expenses)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Net profit card */}
      <div className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
        is_profit ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200' : 'bg-red-50 border-red-200'
      }`}>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-600 font-bold">Net Farm Take-Home</span>
            <span className={`text-[10px] font-black px-2 py-0.2 rounded-full ${
              is_profit ? 'bg-emerald-200 text-emerald-900' : 'bg-red-200 text-red-900'
            }`}>
              {marginPct}% Margin
            </span>
          </div>
          <p className={`text-xl font-black mt-0.5 ${is_profit ? 'text-emerald-700' : 'text-red-600'}`}>
            {is_profit ? '' : '−'}{formatCurrency(Math.abs(net_profit))}
          </p>
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${is_profit ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
          {is_profit ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
        </div>
      </div>
    </div>
  );
};

const FarmerDashboard = () => {
  const { user } = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);

  const loadDashboard = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError('');

      const [dashRes, ordersRes, notifRes] = await Promise.all([
        fetchDashboard(),
        fetchFarmerOrders(),
        fetchNotifications(),
      ]);

      setData(dashRes.data);
      setOrders(Array.isArray(ordersRes.data) ? ordersRes.data : []);
      setNotifications(Array.isArray(notifRes.data) ? notifRes.data : []);
    } catch (err) {
      console.error('Dashboard load error:', err);
      setError('Unable to load latest dashboard metrics. Please check connection and retry.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const farmName = user?.farm_details?.farm_name || user?.name ? `${user?.name}'s Farm` : 'Certified Family Farm';
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="flex min-h-screen bg-surface-50 selection:bg-emerald-500 selection:text-white">
      <FarmerSidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* ── Top Navigation / Executive Bar ── */}
        <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-xl border-b border-slate-100/90 px-4 sm:px-8 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3.5">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-slate-100 rounded-2xl transition-colors"
              aria-label="Open navigation sidebar"
            >
              <Menu className="w-5 h-5 text-slate-700" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black text-slate-900 leading-tight tracking-tight">
                  {getGreeting()}, {user?.name?.split(' ')[0] || 'Farmer'}
                </h1>
                <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" /> Verified Producer
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                {farmName} • Direct Direct-to-Consumer Portal
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Live Data Refresher */}
            <button
              onClick={() => loadDashboard(true)}
              disabled={refreshing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all disabled:opacity-50"
              title="Refresh live metrics"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-600 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{refreshing ? 'Syncing...' : 'Sync Data'}</span>
            </button>

            {/* Notifications Bell */}
            <Link
              to="/farmer/notifications"
              className="relative p-2.5 hover:bg-slate-100 rounded-2xl transition-colors"
              title="Notifications"
            >
              <Bell className="w-5 h-5 text-slate-600" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>

            {/* Farmer Profile Pill */}
            <Link
              to="/farmer/profile"
              className="flex items-center gap-2.5 bg-slate-50 hover:bg-emerald-50/60 border border-slate-200/80 rounded-2xl px-3 py-1.5 transition-all"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-sm">
                {(user?.name || 'F').charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-slate-900 leading-none">{user?.name || 'Farmer'}</p>
                <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">Online</p>
              </div>
            </Link>
          </div>
        </header>

        {/* ── Main Dashboard Body ── */}
        <main className="flex-1 p-4 sm:p-7 space-y-7 max-w-[1440px] w-full mx-auto">
          {/* Error Banner */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center justify-between text-xs text-red-700">
              <div className="flex items-center gap-2.5">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                <p className="font-medium">{error}</p>
              </div>
              <button
                onClick={() => loadDashboard(false)}
                className="font-bold underline hover:text-red-900 ml-4 shrink-0"
              >
                Retry
              </button>
            </div>
          )}

          {/* ── 1. Top KPI Financial Matrix ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            <FinancialCard
              title="Total Sales Realized"
              amount={data?.total_revenue || 0}
              subtitle="All-time delivered orders"
              changeLabel="Gross Revenue"
              icon={DollarSign}
              iconBg="bg-emerald-500/15"
              iconColor="text-emerald-600"
              accentColor="from-emerald-500/25 to-teal-500/0"
              loading={loading}
            />

            <FinancialCard
              title="Net Farm Profit"
              amount={data?.net_profit || 0}
              subtitle={`${data?.profit_margin || 0}% average profit margin`}
              badgeText={data?.net_profit >= 0 ? 'Profitable' : 'Loss'}
              badgeColor={data?.net_profit >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}
              icon={data?.net_profit >= 0 ? TrendingUp : TrendingDown}
              iconBg={data?.net_profit >= 0 ? 'bg-blue-500/15' : 'bg-red-500/15'}
              iconColor={data?.net_profit >= 0 ? 'text-blue-600' : 'text-red-600'}
              accentColor={data?.net_profit >= 0 ? 'from-blue-500/25 to-indigo-500/0' : 'from-red-500/25 to-amber-500/0'}
              loading={loading}
            />

            <FinancialCard
              title="This Month's Harvest"
              amount={data?.this_month_earnings || 0}
              subtitle="Compared to last month"
              changePct={data?.month_change_pct}
              icon={Calendar}
              iconBg="bg-purple-500/15"
              iconColor="text-purple-600"
              accentColor="from-purple-500/25 to-pink-500/0"
              loading={loading}
            />

            <FinancialCard
              title="Pending Settlements"
              amount={data?.pending_payments || 0}
              subtitle="In transit & delivery escrow"
              badgeText="Awaiting Payout"
              badgeColor="bg-amber-100 text-amber-900"
              icon={Clock}
              iconBg="bg-amber-500/15"
              iconColor="text-amber-600"
              accentColor="from-amber-500/25 to-orange-500/0"
              isPending
              loading={loading}
            />
          </div>

          {/* ── 2. Market Intelligence & Low/High Price Comparison Hub (Featured) ── */}
          <section>
            <PriceComparisonHub
              items={data?.price_comparisons || data?.price_transparency || []}
              marketIntelligence={data?.market_intelligence}
              loading={loading}
            />
          </section>

          {/* ── 3. Revenue & Performance Multi-View Analytics Engine ── */}
          <section>
            <RevenueChart chartData={data?.chart_data} loading={loading} />
          </section>

          {/* ── 4. Profit & Loss + Earnings Breakdown Matrix ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2">
              <ProfitLossCard
                data={data?.profit_loss}
                loading={loading}
                onAddExpense={() => setExpenseModalOpen(true)}
              />
            </div>

            {/* Direct Payout Summary */}
            <div className="bg-white rounded-3xl border border-slate-100/90 shadow-premium p-6 sm:p-7 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">Direct Payouts</h3>
                    <p className="text-xs text-slate-400">Zero middleman deductions</p>
                  </div>
                </div>

                {loading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => <div key={i} className="h-8 bg-slate-100 rounded-xl animate-pulse" />)}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2 border-b border-slate-100 text-xs">
                      <span className="text-slate-500 font-medium">Delivered Gross Volume</span>
                      <span className="font-bold text-slate-900">{formatCurrency(data?.earnings?.gross_sales || 0)}</span>
                    </div>
                    <div className="flex items-center justify-between py-1 text-xs">
                      <span className="text-slate-400">Platform Support (2%)</span>
                      <span className="font-bold text-slate-500">−{formatCurrency(data?.earnings?.platform_fees || 0)}</span>
                    </div>
                    <div className="flex items-center justify-between py-2.5 border-t border-slate-200 text-xs">
                      <span className="text-slate-900 font-bold">Farmer Net Payout (98%)</span>
                      <span className="text-base font-black text-emerald-600">{formatCurrency(data?.earnings?.net_earnings || 0)}</span>
                    </div>

                    <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100 text-[11px] text-emerald-800 flex items-center gap-2 mt-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Direct bank transfer on delivery confirmation.</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex gap-2">
                <Link
                  to="/farmer/earnings"
                  className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl text-center transition-colors"
                >
                  View Statements
                </Link>
                <button
                  onClick={() => setExpenseModalOpen(true)}
                  className="px-4 py-2.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold rounded-xl transition-colors"
                >
                  + Expense
                </button>
              </div>
            </div>
          </div>

          {/* ── 5. Product Leaderboard & Recent Live Orders ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <ProductPerformance products={data?.product_performance} loading={loading} />
            <OrderPreview orders={orders} loading={loading} onStatusUpdate={loadDashboard} />
          </div>

          {/* ── 6. Unified Ledger / Transactions ── */}
          <div className="bg-white rounded-3xl border border-slate-100/90 shadow-premium p-6 sm:p-7">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">Recent Financial Activity</h3>
                <p className="text-xs text-slate-400 mt-0.5">Real-time synchronized order payouts & farming expenditures</p>
              </div>
              <Link
                to="/farmer/earnings"
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 hover:underline self-start sm:self-auto"
              >
                Full Ledger Statement →
              </Link>
            </div>
            <TransactionTable transactions={data?.recent_transactions} loading={loading} limit={8} />
          </div>

          {/* ── 7. Inventory Stock Health & Notifications ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2">
              <NotificationPreview
                notifications={notifications}
                loading={loading}
                onRead={loadDashboard}
              />
            </div>

            {/* Inventory Alerts Box */}
            <div className="bg-white rounded-3xl border border-slate-100/90 shadow-premium p-6 sm:p-7 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-slate-700" />
                    <h3 className="text-base font-bold text-slate-900">Inventory Status</h3>
                  </div>
                  <Link to="/farmer/products" className="text-xs font-bold text-emerald-600 hover:underline">
                    Manage
                  </Link>
                </div>

                {loading ? (
                  <div className="space-y-2">
                    {[...Array(3)].map((_, i) => <div key={i} className="h-10 bg-slate-100 rounded-xl animate-pulse" />)}
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {(data?.products || []).filter(p => p.quantity <= 25).length === 0 ? (
                      <div className="text-center py-6 text-slate-400 text-xs">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <p className="font-bold text-slate-700 text-sm">All crops well stocked</p>
                        <p className="mt-0.5">Inventory levels are healthy across all listings.</p>
                      </div>
                    ) : (
                      (data?.products || [])
                        .filter(p => p.quantity <= 25)
                        .slice(0, 4)
                        .map((p, i) => (
                          <div
                            key={i}
                            className={`flex items-center justify-between p-3 rounded-2xl border text-xs ${
                              p.quantity === 0
                                ? 'bg-red-50/80 border-red-200/80 text-red-900'
                                : 'bg-amber-50/80 border-amber-200/80 text-amber-900'
                            }`}
                          >
                            <span className="font-bold truncate max-w-[140px]">{p.name}</span>
                            <span className="font-black">
                              {p.quantity === 0 ? 'Out of Stock' : `${p.quantity} ${p.unit} left`}
                            </span>
                          </div>
                        ))
                    )}
                  </div>
                )}
              </div>

              <Link
                to="/farmer/products/add"
                className="mt-4 w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl text-center transition-colors block"
              >
                + Restock / Add Crop
              </Link>
            </div>
          </div>

          {/* ── 8. Quick Navigation Shortcuts ── */}
          <QuickActions onAddExpense={() => setExpenseModalOpen(true)} />
        </main>
      </div>

      {/* Expense Modal */}
      <ExpenseModal
        open={expenseModalOpen}
        onClose={() => setExpenseModalOpen(false)}
        onSaved={loadDashboard}
      />
    </div>
  );
};

export default FarmerDashboard;
