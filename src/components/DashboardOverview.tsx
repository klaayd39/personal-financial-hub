import React from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, MONTH_NAMES } from '../utils/formatters';
import { TrendingDown, PiggyBank, Banknote, Wallet, Calendar } from 'lucide-react';

export const DashboardOverview: React.FC = () => {
  const { summary, filter, salaries, getBudgetForPeriod } = useFinance();
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

  const activeBudget = filter.month !== -1 ? getBudgetForPeriod(filter.month, filter.year) : undefined;
  const budgetLimit = activeBudget?.amount ?? 0;
  const budgetUsedPct = budgetLimit > 0 ? Math.min((summary.totalExpenses / budgetLimit) * 100, 100) : 0;
  const isOverBudget = budgetLimit > 0 && summary.totalExpenses > budgetLimit;

  const remainingBalance = selectedMonthSalary - summary.totalExpenses;
  const hasSalary = totalYearlySalary > 0;

  const isAllMonths = filter.month === -1;

  const cards = [
    {
      label: `Total Salary (${filter.year})`,
      value: totalYearlySalary,
      icon: <Banknote className="w-4 h-4" />,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      badge: hasSalary ? null : 'Not Set',
    },
    ...(!isAllMonths
      ? [
          {
            label: `${MONTH_NAMES[filter.month]} Salary`,
            value: selectedMonthSalary,
            icon: <Banknote className="w-4 h-4" />,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
            badge: selectedMonthSalary > 0 ? null : 'Not Set',
          },
        ]
      : []),
    ...(!isAllMonths && budgetLimit > 0
      ? [
          {
            label: `Budget Limit`,
            value: budgetLimit,
            icon: <Calendar className="w-4 h-4" />,
            color: isOverBudget ? 'text-rose-600' : 'text-amber-600',
            bg: isOverBudget ? 'bg-rose-50' : 'bg-amber-50',
            badge: isOverBudget ? 'Over Limit' : `${budgetUsedPct.toFixed(0)}% Used`,
          },
        ]
      : []),
    {
      label: 'Total Expenses',
      value: summary.totalExpenses,
      icon: <TrendingDown className="w-4 h-4" />,
      color: isOverBudget ? 'text-rose-600 font-bold' : 'text-rose-500',
      bg: 'bg-rose-50',
      badge: null as string | null,
    },
    ...(!isAllMonths
      ? [
          {
            label: 'Remaining Balance',
            value: remainingBalance,
            icon: <Wallet className="w-4 h-4" />,
            color: remainingBalance >= 0 ? 'text-emerald-600' : 'text-rose-600',
            bg: remainingBalance >= 0 ? 'bg-emerald-50' : 'bg-rose-50',
            badge: null as string | null,
          },
        ]
      : []),
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
    <div className="space-y-3 mb-6">
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-400 font-medium">{period}</p>
      </div>

      {/* Budget Progress Notification Banner on Dashboard if active */}
      {!isAllMonths && budgetLimit > 0 && (
        <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          isOverBudget ? 'bg-rose-500/10 border-rose-200 text-rose-900' : 'bg-amber-500/10 border-amber-200 text-amber-900'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl shrink-0 ${isOverBudget ? 'bg-rose-500 text-white' : 'bg-amber-500 text-white'}`}>
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold">
                {MONTH_NAMES[filter.month]} Budget: {formatCurrency(summary.totalExpenses)} / {formatCurrency(budgetLimit)}
              </p>
              <p className="text-[11px] opacity-80">
                {isOverBudget
                  ? `You have exceeded your monthly budget by ${formatCurrency(summary.totalExpenses - budgetLimit)}!`
                  : `${formatCurrency(budgetLimit - summary.totalExpenses)} remaining before reaching limit.`}
              </p>
            </div>
          </div>

          <div className="w-full sm:w-48 space-y-1">
            <div className="w-full h-2 bg-white/60 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${isOverBudget ? 'bg-rose-600' : 'bg-amber-500'}`}
                style={{ width: `${budgetUsedPct}%` }}
              />
            </div>
            <p className="text-[10px] text-right font-bold">{budgetUsedPct.toFixed(0)}% Used</p>
          </div>
        </div>
      )}

      <div className={`grid grid-cols-1 sm:grid-cols-2 ${isAllMonths ? 'lg:grid-cols-3' : 'lg:grid-cols-4 xl:grid-cols-6'} gap-3`}>
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
