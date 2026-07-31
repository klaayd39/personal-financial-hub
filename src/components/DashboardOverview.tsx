import React from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, MONTH_NAMES } from '../utils/formatters';
import { TrendingUp, TrendingDown, Wallet, PiggyBank, Banknote } from 'lucide-react';

export const DashboardOverview: React.FC = () => {
  const { summary, filter, salaries, savingsRecords } = useFinance();
  const period =
    filter.month === -1 ? `${filter.year}` : `${MONTH_NAMES[filter.month]} ${filter.year}`;

  // Calculate salary for current filter

  // Annual salary total for selected year
  const annualSalary = salaries
    .filter((s) => s.year === filter.year)
    .reduce((sum, s) => sum + s.amount, 0);

  const displaySalary = annualSalary;
  const hasSalary = displaySalary > 0;
  const hasManualSavings = savingsRecords.length > 0;

  const cards = [
    {
      label: 'Total Salary',
      value: displaySalary,
      icon: <Banknote className="w-4 h-4" />,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      extra: null as string | null,
      badge: hasSalary ? null : 'Not Set',
    },
    {
      label: 'Total Expenses',
      value: summary.totalExpenses,
      icon: <TrendingDown className="w-4 h-4" />,
      color: 'text-rose-500',
      bg: 'bg-rose-50',
      extra: null as string | null,
      badge: null as string | null,
    },
    {
      label: 'Total Savings',
      value: summary.totalSavings,
      icon: <PiggyBank className="w-4 h-4" />,
      color: 'text-violet-600',
      bg: 'bg-violet-50',
      extra: 'savings',
      badge: hasManualSavings ? 'Manual' : 'Auto',
    },
  ];

  return (
    <div className="space-y-1 mb-6">
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-400 font-medium">{period}</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm/50 hover-lift">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-xs text-slate-400 font-medium leading-tight truncate">
                  {card.label}
                </span>
                {card.badge && (
                  <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full shrink-0 ${
                    card.badge === 'Manual'
                      ? 'bg-violet-100 text-violet-600'
                      : card.badge === 'Not Set'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-slate-100 text-slate-400'
                  }`}>
                    {card.badge}
                  </span>
                )}
              </div>
              <span className={`${card.color} ${card.bg} p-1.5 rounded-lg shrink-0 ml-1`}>
                {card.icon}
              </span>
            </div>
            <p className={`text-xl font-bold ${card.color} tracking-tight`}>
              {formatCurrency(card.value)}
            </p>
            {card.extra === 'savings' && (
              <div className="mt-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-slate-400">
                    {hasManualSavings ? 'Overall savings' : 'Savings rate'}
                  </span>
                  {!hasManualSavings && (
                    <span className="text-[10px] font-semibold text-slate-600">
                      {summary.savingsRate.toFixed(1)}%
                    </span>
                  )}
                </div>
                {!hasManualSavings && (
                  <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-violet-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(0, summary.savingsRate))}%` }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
