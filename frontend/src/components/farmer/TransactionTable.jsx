import React from 'react';

const statusColors = {
  Completed: 'bg-emerald-50 text-emerald-700',
  Paid: 'bg-emerald-50 text-emerald-700',
  Pending: 'bg-amber-50 text-amber-700',
  Cancelled: 'bg-red-50 text-red-600',
};

const typeColors = {
  Sale: 'text-emerald-600 font-semibold',
  Expense: 'text-red-500 font-semibold',
  Payment: 'text-blue-600 font-semibold',
};

const TransactionRow = ({ tx }) => (
  <tr className="hover:bg-slate-50/60 transition-colors">
    <td className="px-4 py-3.5 text-xs text-slate-500 whitespace-nowrap">{tx.date}</td>
    <td className="px-4 py-3.5">
      <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{tx.transaction_id}</span>
    </td>
    <td className={`px-4 py-3.5 text-xs ${typeColors[tx.type] || 'text-slate-700'}`}>{tx.type}</td>
    <td className="px-4 py-3.5 text-xs text-slate-700 max-w-[160px] truncate">{tx.description}</td>
    <td className={`px-4 py-3.5 text-sm font-bold whitespace-nowrap ${
      tx.sign === '+' ? 'text-emerald-600' : 'text-red-500'
    }`}>
      {tx.sign === '+' ? '+' : '-'}₹{Number(tx.amount).toLocaleString('en-IN')}
    </td>
    <td className="px-4 py-3.5">
      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[tx.status] || 'bg-slate-100 text-slate-600'}`}>
        {tx.status}
      </span>
    </td>
  </tr>
);

const TransactionCard = ({ tx }) => (
  <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
    <div className="flex items-start justify-between mb-2">
      <div>
        <span className={`text-xs font-semibold ${typeColors[tx.type] || 'text-slate-700'}`}>{tx.type}</span>
        <p className="text-sm font-medium text-slate-800 mt-0.5 truncate max-w-[200px]">{tx.description}</p>
      </div>
      <span className={`text-base font-black ${tx.sign === '+' ? 'text-emerald-600' : 'text-red-500'}`}>
        {tx.sign === '+' ? '+' : '-'}₹{Number(tx.amount).toLocaleString('en-IN')}
      </span>
    </div>
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-xs font-mono text-slate-400">{tx.transaction_id}</span>
        <span className="text-xs text-slate-400">· {tx.date}</span>
      </div>
      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[tx.status] || 'bg-slate-100 text-slate-600'}`}>
        {tx.status}
      </span>
    </div>
  </div>
);

const TransactionTable = ({ transactions = [], loading = false, limit = 10 }) => {
  const data = transactions.slice(0, limit);

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-12 bg-slate-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-2">📋</div>
        <p className="text-slate-500 font-medium">No transactions yet</p>
        <p className="text-slate-400 text-sm mt-1">Sales and expenses will appear here</p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden sm:block overflow-x-auto rounded-xl border border-slate-100">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              {['Date', 'Transaction ID', 'Type', 'Description', 'Amount', 'Status'].map((h) => (
                <th key={h} className="px-4 py-3 text-xs font-semibold text-slate-500 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {data.map((tx, i) => <TransactionRow key={i} tx={tx} />)}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="sm:hidden space-y-3">
        {data.map((tx, i) => <TransactionCard key={i} tx={tx} />)}
      </div>
    </>
  );
};

export default TransactionTable;
