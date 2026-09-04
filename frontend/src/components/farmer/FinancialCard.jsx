import React from 'react';
import { TrendingUp, TrendingDown, ArrowUpRight, Sparkles } from 'lucide-react';
import { formatCurrency } from '../../services/farmerService';

const FinancialCard = ({
  title,
  amount,
  subtitle,
  icon: Icon,
  iconBg = 'bg-emerald-500/10',
  iconColor = 'text-emerald-600',
  changePct,
  changeLabel,
  isPending = false,
  badgeText,
  badgeColor = 'bg-slate-100 text-slate-700',
  loading = false,
  accentColor = 'from-emerald-500/20 to-teal-500/0',
}) => {
  const isPositive = (changePct ?? 0) >= 0;

  if (loading) {
    return (
      <div className="bg-white rounded-3xl border border-slate-100 shadow-premium p-5 sm:p-6 animate-pulse">
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 bg-slate-100 rounded-2xl" />
          <div className="w-16 h-5 bg-slate-100 rounded-full" />
        </div>
        <div className="w-36 h-8 bg-slate-100 rounded-lg mb-2" />
        <div className="w-28 h-3.5 bg-slate-100 rounded" />
      </div>
    );
  }

  return (
    <div className="relative group bg-white hover:bg-slate-50/50 rounded-3xl border border-slate-100/90 hover:border-emerald-200/80 shadow-premium hover:shadow-premium-hover p-5 sm:p-6 transition-all duration-300 overflow-hidden flex flex-col justify-between">
      {/* Ambient background glow accent */}
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${accentColor} rounded-bl-full pointer-events-none opacity-40 group-hover:opacity-80 transition-opacity`} />

      <div>
        {/* Top bar */}
        <div className="flex items-start justify-between mb-4">
          <div className={`w-12 h-12 ${iconBg} rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 duration-300 shadow-sm`}>
            {Icon && <Icon className={`w-6 h-6 ${iconColor}`} />}
          </div>

          {changePct !== undefined ? (
            <span className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${
              isPositive
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                : 'bg-red-50 text-red-600 border border-red-200/60'
            }`}>
              {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              {Math.abs(changePct).toFixed(1)}%
            </span>
          ) : badgeText ? (
            <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${badgeColor}`}>
              {badgeText}
            </span>
          ) : null}
        </div>

        {/* Amount & Label */}
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{title}</p>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-none">
            {isPending ? (
              <span className="text-amber-600">{formatCurrency(amount)}</span>
            ) : (
              formatCurrency(amount)
            )}
          </p>
        </div>
      </div>

      {/* Subtitle / context */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span className="truncate">{subtitle}</span>
        {changeLabel && (
          <span className="font-semibold text-slate-700 shrink-0 ml-2">{changeLabel}</span>
        )}
      </div>
    </div>
  );
};

export default FinancialCard;
