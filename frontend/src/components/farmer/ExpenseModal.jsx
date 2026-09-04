import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { createExpense } from '../../services/farmerService';

const CATEGORIES = [
  'Seeds', 'Fertilizer', 'Pesticides', 'Labour',
  'Transportation', 'Packaging', 'Equipment', 'Platform Fees', 'Other'
];

const today = () => new Date().toISOString().split('T')[0];

const ExpenseModal = ({ open, onClose, onSaved }) => {
  const [form, setForm] = useState({ category: '', amount: '', date: today(), description: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.category) return setError('Please select a category.');
    if (!form.amount || Number(form.amount) <= 0) return setError('Please enter a valid amount.');
    if (!form.date) return setError('Please select a date.');

    try {
      setLoading(true);
      await createExpense({
        category: form.category,
        amount: parseFloat(form.amount),
        date: form.date,
        description: form.description.trim(),
      });
      setForm({ category: '', amount: '', date: today(), description: '' });
      onSaved?.();
      onClose();
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to save expense. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Add Expense</h2>
            <p className="text-xs text-slate-400 mt-0.5">Record a farm expense to track profitability</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center justify-center transition-colors">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Expense Category <span className="text-red-500">*</span>
            </label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              required
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-agri-light/50 focus:border-agri-light text-sm transition-all"
            >
              <option value="">Select category…</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Amount (₹) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-semibold text-sm">₹</span>
              <input
                type="number"
                name="amount"
                value={form.amount}
                onChange={handleChange}
                min="0"
                step="0.01"
                placeholder="0.00"
                required
                className="w-full border border-slate-200 rounded-xl pl-8 pr-4 py-2.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-agri-light/50 focus:border-agri-light text-sm transition-all"
              />
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              max={today()}
              required
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-agri-light/50 focus:border-agri-light text-sm transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Description <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={2}
              placeholder="e.g. Urea fertilizer for wheat crop…"
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-agri-light/50 focus:border-agri-light text-sm resize-none transition-all"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 rounded-xl px-3 py-2.5 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 bg-gradient-to-r from-agri-green to-agri-light text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60 shadow-sm"
            >
              {loading ? 'Saving…' : 'Save Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseModal;
