import React from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, MONTH_NAMES } from '../utils/formatters';
import { TrendingDown, PiggyBank, Banknote, Wallet } from 'lucide-react';

export const DashboardOverview: React.FC = () => {
  const { summary, filter, salaries } = useFinance();
  const period =
    filter.month === -1 ? `${filter.year}` : `${MONTH_NAMES[filter.month]} ${filter.year}`;

  // Total annual salary across all months in the selected year
  const totalYearlySalary = salaries
    .filter((s) => s.year === filter.year)
    .reduce((sum, s) => sum + s.amount, 0);

  // Salary for the selected month (or total annual if "All Months" is selected)
  const selectedMonthSalary = filter.month !== -1
    ? salaries.find((s) => s.month === filter.month && s.year === filter.year)?.amount ?? 0
    : totalYearlySalary;

  const remainingBalance = selectedMonthSalary - summary.totalExpenses;
  const hasSalary = totalYearlySalary > 0;

  const cards = [
    {
      label: `Total Salary (${filter.year})`,
      value: totalYearlySalary,
      icon: <Banknote className="w-4 h-4" />,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      badge: hasSalary ? null : 'Not Set',
    },
    {
      label: filter.month === -1 ? 'Monthly Salary' : `${MONTH_NAMES[filter.month]} Salary`,
      value: selectedMonthSalary,
      icon: <Banknote className="w-4 h-4" />,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      badge: selectedMonthSalary > 0 ? null : 'Not Set',
    },
    {
      label: 'Total Expenses',
      value: summary.totalExpenses,
      icon: <TrendingDown className="w-4 h-4" />,
      color: 'text-rose-500',
      bg: 'bg-rose-50',
      badge: null as string | null,
    },
    {
      label: 'Remaining Balance',
      value: remainingBalance,
      icon: <Wallet className="w-4 h-4" />,
      color: remainingBalance >= 0 ? 'text-emerald-600' : 'text-rose-600',
      bg: remainingBalance >= 0 ? 'bg-emerald-50' : 'bg-rose-50',
      badge: null as string | null,
    },
    {
      label: 'Total Savings',
      value: summary.totalSavings,
      icon: <PiggyBank className="w-4 h-4" />,
      color: 'text-violet-600',
      bg: 'bg-violet-50',
      badge: null as string | null,
    },
  ];

  return (
    <div className="space-y-1 mb-6">
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-400 font-medium">{period}</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
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
          </div>
        ))}
      </div>
    </div>
  );
};
