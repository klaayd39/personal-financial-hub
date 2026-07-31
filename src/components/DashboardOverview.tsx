import React from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, MONTH_NAMES } from '../utils/formatters';
import { TrendingUp, TrendingDown, Wallet, PiggyBank, Banknote } from 'lucide-react';

export const DashboardOverview: React.FC = () => {
  const { summary, filter, savingsRecords } = useFinance();
  const period =
    filter.month === -1 ? `${filter.year}` : `${MONTH_NAMES[filter.month]} ${filter.year}`;

  const hasSalary  = summary.monthlySalary > 0 && filter.month !== -1;
  const hasManualSavings = savingsRecords.length > 0;

  const cards = [
    // Salary card — only when a salary is set for the selected month
    ...(hasSalary
      ? [
          {
            label: 'Monthly Salary',
            value: summary.monthlySalary,
            icon: <Banknote className="w-4 h-4" />,
            color: 'text-indigo-600',
            bg: 'bg-indigo-50',
            extra: null as string | null,
            badge: null as string | null,
          },
        ]
      : []),
    {
      label: 'Total Income',
      value: summary.totalIncome,
      icon: <TrendingUp className="w-4 h-4" />,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      extra: null as string | null,
      badge: null as string | null,
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
      label: hasSalary ? 'Remaining (Salary − Expenses)' : 'Remaining Balance',
      value: summary.remainingBalance,
      icon: <Wallet className="w-4 h-4" />,
      color: summary.remainingBalance >= 0 ? 'text-slate-900' : 'text-rose-500',
      bg: 'bg-slate-100',
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

  const colClass = hasSalary ? 'grid-cols-2 lg:grid-cols-5' : 'grid-cols-2 lg:grid-cols-4';

  return (
    <div className="space-y-1 mb-6">
      <p className="text-xs text-slate-400 font-medium">{period}</p>
      <div className={`grid ${colClass} gap-3`}>
        {cards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl p-4 border border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-xs text-slate-400 font-medium leading-tight truncate">
                  {card.label}
                </span>
                {card.badge && (
                  <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full shrink-0 ${
                    card.badge === 'Manual'
                      ? 'bg-violet-100 text-violet-600'
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
