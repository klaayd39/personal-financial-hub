import React from 'react';
import { motion } from 'framer-motion';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, MONTH_NAMES } from '../utils/formatters';
import { TrendingDown, PiggyBank, Banknote, Wallet } from 'lucide-react';


const cardVariants = {
  hidden: { opacity: 0, y: 12, scale: 0.97 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { delay: i * 0.07, duration: 0.35, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

export const DashboardOverview: React.FC = () => {
  const { summary, filter, salaries } = useFinance();
  const period =
    filter.month === -1 ? `${filter.year}` : `${MONTH_NAMES[filter.month]} ${filter.year}`;

  // Total annual salary across all months in the selected year
  const totalYearlySalary = salaries
    .filter((s) => s.year === filter.year)
    .reduce((sum, s) => sum + s.amount, 0);

  // Salary for the selected month (or total annual if "All Months" is selected)
  const selectedMonthSalary =
    filter.month !== -1
      ? salaries.find((s) => s.month === filter.month && s.year === filter.year)?.amount ?? 0
      : totalYearlySalary;



  const remainingBalance = selectedMonthSalary - summary.totalExpenses;
  const hasSalary = totalYearlySalary > 0;

  const isAllMonths = filter.month === -1;

  const cards = [
    {
      label: `Total Salary (${filter.year})`,
      value: totalYearlySalary,
      icon: <Banknote className="w-4 h-4" />,
      color: 'text-indigo-600 dark:text-indigo-400',
      bg: 'bg-indigo-50 dark:bg-indigo-900/20',
      badge: hasSalary ? null : 'Not Set',
    },
    ...(!isAllMonths
      ? [
          {
            label: `${MONTH_NAMES[filter.month]} Salary`,
            value: selectedMonthSalary,
            icon: <Banknote className="w-4 h-4" />,
            color: 'text-blue-600 dark:text-blue-400',
            bg: 'bg-blue-50 dark:bg-blue-900/20',
            badge: selectedMonthSalary > 0 ? null : 'Not Set',
          },
        ]
      : []),

    {
      label: 'Total Expenses',
      value: summary.totalExpenses,
      icon: <TrendingDown className="w-4 h-4" />,
      color: 'text-rose-500 dark:text-rose-400',
      bg: 'bg-rose-50 dark:bg-rose-900/20',
      badge: null as string | null,
    },
    ...(!isAllMonths
      ? [
          {
            label: 'Salary Remaining Balance',
            value: remainingBalance,
            icon: <Wallet className="w-4 h-4" />,
            color: remainingBalance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400',
            bg: remainingBalance >= 0 ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-rose-50 dark:bg-rose-900/20',
            badge: null as string | null,
          },
        ]
      : []),
    {
      label: 'Total Savings',
      value: summary.totalSavings,
      icon: <PiggyBank className="w-4 h-4" />,
      color: 'text-violet-600 dark:text-violet-400',
      bg: 'bg-violet-50 dark:bg-violet-900/20',
      badge: null as string | null,
    },
  ];

  return (
    <div className="space-y-5 mb-6">
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">{period}</p>
      </div>



      {/* Metric Cards */}
      <div
        className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4`}
      >
        {cards.map((card, i) => (
          <motion.div
            key={card.label}
            custom={i}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="card hover-lift group cursor-default"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-xs text-slate-400 dark:text-slate-500 font-medium leading-tight truncate">
                  {card.label}
                </span>
                {card.badge && (
                  <span
                    className={`badge shrink-0 ${
                      card.badge === 'Over Limit' || card.badge === 'Not Set'
                        ? 'badge-amber'
                        : 'badge-slate'
                    }`}
                  >
                    {card.badge}
                  </span>
                )}
              </div>
              <span className={`${card.color} ${card.bg} p-1.5 rounded-lg shrink-0 ml-1 transition-transform group-hover:scale-110`}>
                {card.icon}
              </span>
            </div>
            <p className={`text-xl font-bold ${card.color} tracking-tight`}>
              {formatCurrency(card.value)}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
