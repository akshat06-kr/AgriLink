import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import FarmerSidebar from '../../components/farmer/FarmerSidebar';
import ExpenseModal from '../../components/farmer/ExpenseModal';
import {
  fetchDashboard, fetchExpenses, deleteExpense,
  downloadPDF, downloadCSV, formatCurrency
} from '../../services/farmerService';
import {
  TrendingUp, TrendingDown, Plus, Trash2, Download,
  DollarSign, PieChart, AlertCircle, RefreshCw, Menu,
  FileText, Calendar, Tag
} from 'lucide-react';

const CATEGORY_COLORS = {
  'Seeds': 'bg-emerald-500',
  'Fertilizer': 'bg-teal-500',
  'Labor': 'bg-blue-500',
  'Equipment': 'bg-indigo-500',
  'Transport': 'bg-amber-500',
  'Irrigation': 'bg-cyan-500',
  'Packaging': 'bg-purple-500',
  'Pesticides': 'bg-orange-500',
  'Other': 'bg-slate-500',
};

const FarmerProfitLoss = () => {
  const { user } = useContext(AuthContext);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dashData, setDashData] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [downloading, setDownloading] = useState({ pdf: false, csv: false });

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [dRes, eRes] = await Promise.all([
        fetchDashboard(),
        fetchExpenses(),
      ]);
      setDashData(dRes.data);
      setExpenses(Array.isArray(eRes.data) ? eRes.data : []);
    } catch (err) {
      console.error('Failed to load P&L data:', err);
      setError('Could not load Profit & Loss data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeleteExpense = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense record?')) return;
    try {
      setDeletingId(id);
      await deleteExpense(id);
      loadData();
    } catch (err) {
      alert('Failed to delete expense.');
    } finally {
      setDeletingId(null);
    }
  };

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
      link.setAttribute('download', `AgriLink_PL_Statement_${new Date().toISOString().split('T')[0]}.${type}`);
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
  const totalExpenses = expenses.reduce((acc, exp) => acc + (exp.amount || 0), 0);
  const netProfit = revenue - totalExpenses;
  const profitMargin = revenue > 0 ? ((netProfit / revenue) * 100).toFixed(1) : 0;
  const isProfit = netProfit >= 0;

  // Group expenses by category
  const expenseByCategory = expenses.reduce((acc, exp) => {
    const cat = exp.category || 'Other';
    acc[cat] = (acc[cat] || 0) + (exp.amount || 0);
    return acc;
  }, {});

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
              <h1 className="text-lg font-bold text-slate-900 leading-tight">Profit & Loss Statement</h1>
              <p className="text-xs text-slate-400">Complete farming financial economics</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setExpenseModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-agri-green hover:bg-agri-dark text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Log Expense</span>
            </button>
            <button
              onClick={() => handleDownload('pdf')}
              disabled={downloading.pdf}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all disabled:opacity-50"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{downloading.pdf ? '...' : 'PDF'}</span>
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 space-y-6 max-w-[1400px] w-full mx-auto">
          {/* Executive P&L Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
              <span className="text-xs font-semibold text-slate-400">Total Crop Revenue</span>
              <p className="text-2xl font-black text-emerald-600 mt-2">{formatCurrency(revenue)}</p>
              <p className="text-xs text-slate-400 mt-1">From fulfilled customer orders</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
              <span className="text-xs font-semibold text-slate-400">Operating Expenses</span>
              <p className="text-2xl font-black text-amber-600 mt-2">{formatCurrency(totalExpenses)}</p>
              <p className="text-xs text-slate-400 mt-1">{expenses.length} expense items recorded</p>
            </div>

            <div className={`p-5 rounded-2xl border shadow-sm ${isProfit ? 'bg-emerald-50/60 border-emerald-200' : 'bg-red-50/60 border-red-200'}`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700">Net Farm {isProfit ? 'Profit' : 'Loss'}</span>
                {isProfit ? <TrendingUp className="w-4 h-4 text-emerald-600" /> : <TrendingDown className="w-4 h-4 text-red-500" />}
              </div>
              <p className={`text-2xl font-black mt-2 ${isProfit ? 'text-emerald-700' : 'text-red-600'}`}>
                {isProfit ? `+${formatCurrency(netProfit)}` : formatCurrency(netProfit)}
              </p>
              <p className={`text-xs font-medium mt-1 ${isProfit ? 'text-emerald-600' : 'text-red-500'}`}>
                {profitMargin}% Profit Margin
              </p>
            </div>
          </div>

          {/* Expense Category Breakdown */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center justify-between">
              <span>Operating Expenses by Category</span>
              <span className="text-xs font-normal text-slate-400">Total: {formatCurrency(totalExpenses)}</span>
            </h3>

            {Object.keys(expenseByCategory).length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No categorized expenses recorded yet. Click "Log Expense" to track seed, fertilizer, or labor costs.
              </div>
            ) : (
              <div className="space-y-3">
                {Object.entries(expenseByCategory).map(([cat, amount]) => {
                  const pct = totalExpenses > 0 ? ((amount / totalExpenses) * 100).toFixed(1) : 0;
                  const colorClass = CATEGORY_COLORS[cat] || 'bg-slate-500';
                  return (
                    <div key={cat} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-medium">
                        <span className="text-slate-700">{cat}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400">{pct}%</span>
                          <span className="font-bold text-slate-900">{formatCurrency(amount)}</span>
                        </div>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${colorClass} rounded-full transition-all duration-500`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Detailed Expenses Table */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Recorded Farm Expenses</h3>
                <p className="text-xs text-slate-400">All input costs deducted from your agricultural earnings</p>
              </div>
            </div>

            {loading ? (
              <div className="p-12 text-center">
                <RefreshCw className="w-8 h-8 text-agri-green animate-spin mx-auto mb-2" />
                <p className="text-xs text-slate-500">Loading expenses...</p>
              </div>
            ) : expenses.length === 0 ? (
              <div className="p-12 text-center">
                <PieChart className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-800">No expenses recorded</p>
                <p className="text-xs text-slate-400 mt-1 mb-3">
                  Logging expenses allows AgriLink to calculate your true net profit.
                </p>
                <button
                  onClick={() => setExpenseModalOpen(true)}
                  className="px-4 py-2 bg-agri-green text-white text-xs font-semibold rounded-xl hover:bg-agri-dark transition-colors"
                >
                  Log Your First Expense
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Description / Notes</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {expenses.map((exp) => (
                      <tr key={exp._id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 text-xs text-slate-500 whitespace-nowrap">
                          {exp.date ? new Date(exp.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recent'}
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-lg font-medium bg-slate-100 text-slate-700">
                            <Tag className="w-3 h-3 text-slate-400" />
                            {exp.category}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-700 font-medium max-w-xs truncate">
                          {exp.description || 'General farm expense'}
                        </td>
                        <td className="py-3 px-4 font-bold text-amber-600 whitespace-nowrap">
                          -{formatCurrency(exp.amount)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleDeleteExpense(exp._id)}
                            disabled={deletingId === exp._id}
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Delete expense"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Expense Modal */}
      <ExpenseModal
        isOpen={expenseModalOpen}
        onClose={() => setExpenseModalOpen(false)}
        onExpenseAdded={() => {
          setExpenseModalOpen(false);
          loadData();
        }}
      />
    </div>
  );
};

export default FarmerProfitLoss;
