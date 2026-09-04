import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  PackagePlus, ShoppingCart, DollarSign, PlusCircle,
  Download, UserCircle, CheckCircle2, AlertCircle
} from 'lucide-react';
import { downloadPDF, downloadCSV } from '../../services/farmerService';

const QuickActions = ({ onAddExpense }) => {
  const [reportState, setReportState] = useState('idle'); // idle | loading | success | error

  const handleDownload = async (type) => {
    setReportState('loading');
    try {
      const res = type === 'pdf' ? await downloadPDF() : await downloadCSV();
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = type === 'pdf' ? 'agrilink_report.pdf' : 'agrilink_report.csv';
      link.click();
      window.URL.revokeObjectURL(url);
      setReportState('success');
      setTimeout(() => setReportState('idle'), 3000);
    } catch (err) {
      console.error('Download failed:', err);
      setReportState('error');
      setTimeout(() => setReportState('idle'), 3000);
    }
  };

  const actions = [
    { label: '+ Add Product', icon: PackagePlus, to: '/farmer/products/add', color: 'bg-emerald-500 hover:bg-emerald-600' },
    { label: 'View Orders', icon: ShoppingCart, to: '/farmer/orders', color: 'bg-indigo-500 hover:bg-indigo-600' },
    { label: 'View Earnings', icon: DollarSign, to: '/farmer/earnings', color: 'bg-blue-500 hover:bg-blue-600' },
    { label: 'Add Expense', icon: PlusCircle, onClick: onAddExpense, color: 'bg-amber-500 hover:bg-amber-600' },
    { label: 'Update Profile', icon: UserCircle, to: '/farmer/profile', color: 'bg-slate-500 hover:bg-slate-600' },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-premium p-6">
      <h3 className="text-base font-bold text-slate-900 mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {actions.map((action) => {
          const Icon = action.icon;
          const btn = (
            <button
              key={action.label}
              onClick={action.onClick}
              className={`flex flex-col items-center gap-2 p-3.5 rounded-xl text-white text-xs font-semibold transition-all duration-200 hover:-translate-y-0.5 shadow-sm w-full ${action.color}`}
            >
              <Icon className="w-5 h-5" />
              {action.label}
            </button>
          );

          if (action.to) {
            return (
              <Link key={action.label} to={action.to} className="block">
                <div className={`flex flex-col items-center gap-2 p-3.5 rounded-xl text-white text-xs font-semibold transition-all duration-200 hover:-translate-y-0.5 shadow-sm w-full ${action.color}`}>
                  <Icon className="w-5 h-5" />
                  {action.label}
                </div>
              </Link>
            );
          }
          return btn;
        })}

        {/* Download Report (special) */}
        <div className="flex flex-col gap-2 col-span-2 sm:col-span-1">
          <p className="text-xs font-semibold text-slate-600 text-center">Download Report</p>
          <div className="flex gap-2">
            <button
              onClick={() => handleDownload('pdf')}
              disabled={reportState === 'loading'}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold rounded-lg transition-all disabled:opacity-60 shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              PDF
            </button>
            <button
              onClick={() => handleDownload('csv')}
              disabled={reportState === 'loading'}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-teal-500 hover:bg-teal-600 text-white text-xs font-semibold rounded-lg transition-all disabled:opacity-60 shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              CSV
            </button>
          </div>
          {reportState === 'loading' && (
            <p className="text-xs text-slate-400 text-center animate-pulse">Generating report…</p>
          )}
          {reportState === 'success' && (
            <p className="text-xs text-emerald-600 text-center flex items-center justify-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Downloaded!
            </p>
          )}
          {reportState === 'error' && (
            <p className="text-xs text-red-500 text-center flex items-center justify-center gap-1">
              <AlertCircle className="w-3 h-3" /> Failed. Retry.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuickActions;
