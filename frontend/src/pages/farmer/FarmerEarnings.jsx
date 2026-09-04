import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import FarmerSidebar from '../../components/farmer/FarmerSidebar';
import { fetchDashboard, downloadPDF, downloadCSV, formatCurrency } from '../../services/farmerService';
import {
  DollarSign, TrendingUp, Download, ArrowUpRight,
  ShieldCheck, AlertCircle, RefreshCw, Menu, CheckCircle2,
  Calendar, FileText, PieChart
} from 'lucide-react';

const FarmerEarnings = () => {
  const { user } = useContext(AuthContext);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dashData, setDashData] = useState(null);
  const [downloading, setDownloading] = useState({ pdf: false, csv: false });

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetchDashboard();
      setDashData(res.data);
    } catch (err) {
      console.error('Failed to load earnings data:', err);
      setError('Could not retrieve earnings records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDownload = async (type) => {
    try {
      setDownloading((prev) => ({ ...prev, [type]: true }));
      const res = type === 'pdf' ? await downloadPDF() : await downloadCSV();
      const blob = new Blob([res.data], {
        type: type === 'pdf' ? 'application/pdf' : 'text/csv;charset=utf-8;',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `AgriLink_Earnings_Statement_${new Date().toISOString().split('T')[0]}.${type}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      alert(`Failed to download ${type.toUpperCase()} report.`);
    } finally {
      setDownloading((prev) => ({ ...prev, [type]: false }));
    }
  };

  const revenue = dashData?.total_revenue || 0;
  const platformFee = revenue * 0.02;
  const netEarnings = revenue - platformFee;
  const pendingPayments = dashData?.pending_payments || 0;
  const transactions = dashData?.recent_transactions || [];
  const earningsBreakdown = dashData?.earnings_breakdown || {};

  return (
    <div className="flex min-h-screen bg-surface-50">
      <FarmerSidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-100 px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <Menu className="w-5 h-5 text-slate-600" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-slate-900 leading-tight">Earnings & Payouts</h1>
              <p className="text-xs text-slate-400">Direct farm payouts and payment settlements</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleDownload('pdf')}
              disabled={downloading.pdf}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all disabled:opacity-50"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{downloading.pdf ? 'Generating...' : 'PDF Statement'}</span>
            </button>
            <button
              onClick={() => handleDownload('csv')}
              disabled={downloading.csv}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{downloading.csv ? 'Exporting...' : 'CSV'}</span>
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 space-y-6 max-w-[1400px] w-full mx-auto">
          {/* Main Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Gross Sales</span>
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-agri-green flex items-center justify-center">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900 mt-3">{formatCurrency(revenue)}</p>
              <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                From delivered customer orders
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Platform Commission (2%)</span>
                <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
                  <PieChart className="w-5 h-5" />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-700 mt-3">{formatCurrency(platformFee)}</p>
              <p className="text-xs text-slate-400 mt-1">Platform operational maintenance</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Net Take-Home</span>
                <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
              <p className="text-2xl font-black text-emerald-600 mt-3">{formatCurrency(netEarnings)}</p>
              <p className="text-xs text-slate-500 mt-1">Directly credited to farmer bank/UPI</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Pending Orders In-Transit</span>
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Calendar className="w-5 h-5" />
                </div>
              </div>
              <p className="text-2xl font-black text-amber-600 mt-3">{formatCurrency(pendingPayments)}</p>
              <p className="text-xs text-slate-400 mt-1">Settles upon successful delivery</p>
            </div>
          </div>

          {/* Breakdown & Settlement Explainer */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900">Earnings & Revenue Breakdown</h3>
              <div className="divide-y divide-slate-100">
                <div className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Total Completed Crop Sales</p>
                    <p className="text-xs text-slate-400">Direct sales to end consumers without middlemen</p>
                  </div>
                  <span className="font-bold text-slate-900">{formatCurrency(revenue)}</span>
                </div>
                <div className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Direct Farmer Payout Share</p>
                    <p className="text-xs text-slate-400">98% of gross sales value</p>
                  </div>
                  <span className="font-bold text-emerald-600">{formatCurrency(netEarnings)}</span>
                </div>
                <div className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">AgriLink Service Charge</p>
                    <p className="text-xs text-slate-400">2% flat fee covering hosting & quality grading</p>
                  </div>
                  <span className="font-semibold text-slate-600">-{formatCurrency(platformFee)}</span>
                </div>
                <div className="py-3 flex items-center justify-between bg-emerald-50/50 -mx-6 px-6 rounded-xl">
                  <div>
                    <p className="text-sm font-bold text-emerald-900">Final Settled Farmer Income</p>
                    <p className="text-xs text-emerald-700">100% transparent zero hidden deduction policy</p>
                  </div>
                  <span className="text-lg font-black text-emerald-700">{formatCurrency(netEarnings)}</span>
                </div>
              </div>
            </div>

            {/* Payout Security Card */}
            <div className="bg-gradient-to-br from-emerald-800 to-agri-dark text-white rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-3">
                  <ShieldCheck className="w-6 h-6 text-emerald-300" />
                </div>
                <h3 className="text-base font-bold">Guaranteed Direct Settlements</h3>
                <p className="text-xs text-emerald-100 mt-2 leading-relaxed">
                  Unlike traditional mandis where commission agents delay payments by 30-90 days, AgriLink ensures automatic UPI/NEFT settlement immediately upon delivery confirmation.
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-xs space-y-1">
                <p className="font-semibold text-emerald-200">Payment Frequency:</p>
                <p className="text-white">Daily automated payouts direct to your registered bank account.</p>
              </div>
            </div>
          </div>

          {/* Transactions / Settlements History */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Recent Revenue Transactions</h3>
                <p className="text-xs text-slate-400">Chronological history of settled and pending sales</p>
              </div>
            </div>

            {loading ? (
              <div className="p-12 text-center">
                <RefreshCw className="w-8 h-8 text-agri-green animate-spin mx-auto mb-2" />
                <p className="text-xs text-slate-500">Loading payout records...</p>
              </div>
            ) : transactions.length === 0 ? (
              <div className="p-12 text-center">
                <DollarSign className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-800">No transactions recorded yet</p>
                <p className="text-xs text-slate-400 mt-1">Earnings will appear automatically when orders are delivered.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {transactions.map((tx, idx) => {
                  const isSale = tx.type === 'sale';
                  return (
                    <div key={idx} className="p-4 flex items-center justify-between hover:bg-slate-50/70 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${isSale ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                          {isSale ? '+' : '-'}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{tx.description || 'Order Payment'}</p>
                          <p className="text-xs text-slate-400">
                            {tx.date ? new Date(tx.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recent'}
                            {tx.status && <span className="ml-2 font-medium text-slate-500">• {tx.status}</span>}
                          </p>
                        </div>
                      </div>
                      <span className={`text-sm font-bold ${isSale ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {isSale ? `+${formatCurrency(tx.amount)}` : `-${formatCurrency(tx.amount)}`}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default FarmerEarnings;
