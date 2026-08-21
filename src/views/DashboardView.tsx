import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useFinance } from '../context/FinanceContext';
import { DashboardOverview } from '../components/DashboardOverview';
import { AnimatedList, AnimatedListItem } from '../components/AnimatedComponents';
import { formatCurrency, formatDate, MONTH_NAMES } from '../utils/formatters';
import { TrendingUp, TrendingDown, Calendar, CheckCircle2, Circle, ArrowRight } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import type { ExpenseCategory } from '../types/finance';

const CATEGORY_META: Record<string, { emoji: string; gradient: string; color: string }> = {
  Food:            { emoji: '🍽️', gradient: 'from-orange-500 to-amber-500',  color: 'text-orange-600 dark:text-orange-400' },
  Transportation:  { emoji: '🚗', gradient: 'from-sky-500 to-cyan-500',      color: 'text-sky-600 dark:text-sky-400' },
  Bills:           { emoji: '📋', gradient: 'from-slate-600 to-slate-500',    color: 'text-slate-600 dark:text-slate-400' },
  Shopping:        { emoji: '🛒', gradient: 'from-pink-500 to-rose-500',      color: 'text-pink-600 dark:text-pink-400' },
  Entertainment:   { emoji: '🎬', gradient: 'from-purple-500 to-violet-500',  color: 'text-purple-600 dark:text-purple-400' },
  Health:          { emoji: '🏥', gradient: 'from-emerald-500 to-teal-500',   color: 'text-emerald-600 dark:text-emerald-400' },
  Education:       { emoji: '📚', gradient: 'from-blue-600 to-indigo-600',    color: 'text-blue-600 dark:text-blue-400' },
  Travel:          { emoji: '✈️', gradient: 'from-teal-500 to-cyan-500',      color: 'text-teal-600 dark:text-teal-400' },
  Miscellaneous:   { emoji: '📦', gradient: 'from-amber-500 to-yellow-500',   color: 'text-amber-600 dark:text-amber-400' },
};

const ALL_CATEGORIES: ExpenseCategory[] = [
  'Food', 'Transportation', 'Bills', 'Shopping',
  'Entertainment', 'Health', 'Education', 'Travel', 'Miscellaneous',
];

export const DashboardView: React.FC = () => {
  const { filteredIncomes, filteredExpenses, expenses, filter, bills, toggleBillPaid } = useFinance();

  const upcomingBills = React.useMemo(() => {
    return bills
      .filter((b) => !b.is_paid)
      .sort((a, b) => a.due_day - b.due_day)
      .slice(0, 5);
  }, [bills]);

  const recentTransactions = React.useMemo(() => {
    const combined = [
      ...filteredIncomes.map((inc) => ({
        id: inc.id, type: 'income' as const,
        title: inc.source, sub: inc.notes || '—',
        amount: inc.amount, date: inc.date,
      })),
      ...filteredExpenses.map((exp) => ({
        id: exp.id, type: 'expense' as const,
        title: exp.description, sub: exp.payment_method,
        amount: exp.amount, date: exp.date,
      })),
    ];
    return combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 7);
  }, [filteredIncomes, filteredExpenses]);

  // Build 12-month expense trend for the selected year
  const monthlyTrendData = React.useMemo(() => {
    const monthTotals = Array(12).fill(0);
    expenses.forEach((exp) => {
      const d = new Date(exp.date + 'T00:00:00');
      if (d.getFullYear() === filter.year) {
        monthTotals[d.getMonth()] += exp.amount;
      }
    });
    return MONTH_NAMES.map((name, i) => ({
      month: name.slice(0, 3),
      Expenses: Math.round(monthTotals[i]),
    }));
  }, [expenses, filter.year]);

  const billsPaidCount = bills.filter((b) => b.is_paid).length;
  const billsPaidPct = bills.length > 0 ? Math.round((billsPaidCount / bills.length) * 100) : 0;

  // Category spending breakdown for the current period
  const categoryStats = React.useMemo(() => {
    return ALL_CATEGORIES.map((cat) => {
      const catExpenses = filteredExpenses.filter((e) => e.category === cat);
      const total = catExpenses.reduce((s, e) => s + e.amount, 0);
      return { category: cat, total, count: catExpenses.length };
    });
  }, [filteredExpenses]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl shadow-lg px-3 py-2 text-xs transition-colors duration-200">
          <p className="font-semibold text-slate-700 dark:text-slate-300 mb-1">{label}</p>
          <p className="text-rose-600 dark:text-rose-400 font-bold">{formatCurrency(payload[0]?.value ?? 0)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Overview cards */}
      <DashboardOverview />

      {/* Charts + sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 12-Month Expense Trend */}
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4, ease: [0.16, 1, 0.3, 1] as const }}
        >
          <div className="card hover-lift h-full flex flex-col">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-sm font-bold text-slate-800 dark:text-white">Monthly Expense Trend</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{filter.year} — all months</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400 dark:bg-rose-500 inline-block" />
                <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">Expenses</span>
              </div>
            </div>
            <div className="flex-1 min-h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyTrendData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="month" stroke="#cbd5e1" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis
                    stroke="#cbd5e1"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `₱${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#e2e8f0', strokeWidth: 1 }} />
                  <Area
                    type="monotone"
                    dataKey="Expenses"
                    stroke="#f43f5e"
                    strokeWidth={2.5}
                    fill="url(#expenseGradient)"
                    dot={{ fill: '#f43f5e', r: 3, strokeWidth: 0 }}
                    activeDot={{ r: 5, fill: '#f43f5e', strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>

        {/* Right sidebar: Bills + Recent */}
        <div className="space-y-6 flex flex-col">
          {/* Upcoming Bills Widget */}
          <motion.div
            className="card hover-lift"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.35, ease: [0.16, 1, 0.3, 1] as const }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                  <Calendar className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                </div>
                <p className="text-sm font-bold text-slate-800 dark:text-white">Upcoming Bills</p>
              </div>
              <Link
                to="/bills"
                className="flex items-center gap-0.5 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold transition-colors"
              >
                Manage <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {/* Bills paid progress */}
            {bills.length > 0 && (
              <div className="mb-3 p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/50 transition-colors">
                <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                  <span>Bills Paid</span>
                  <span className="text-blue-600 dark:text-blue-400">{billsPaidCount} / {bills.length}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-blue-600 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${billsPaidPct}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' as const, delay: 0.4 }}
                  />
                </div>
              </div>
            )}

            {upcomingBills.length > 0 ? (
              <AnimatedList className="space-y-1.5">
                {upcomingBills.map((b) => (
                  <AnimatedListItem key={b.id} className="flex items-center justify-between py-1.5 border-b border-slate-50 dark:border-slate-800/50 last:border-0 text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <motion.button
                        onClick={() => toggleBillPaid(b.id)}
                        whileTap={{ scale: 0.85 }}
                        className="p-0.5 text-slate-300 dark:text-slate-600 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors shrink-0"
                        title="Mark Paid"
                      >
                        <Circle className="w-3.5 h-3.5" />
                      </motion.button>
                      <span className="font-medium text-slate-800 dark:text-slate-200 truncate">{b.name}</span>
                      <span className="badge badge-blue shrink-0">
                        {b.month !== undefined && b.month !== null
                          ? ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][b.month]
                          : 'Monthly'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">Due {b.due_day}th</span>
                      <span className="font-bold text-rose-600 dark:text-rose-400">{formatCurrency(b.amount)}</span>
                    </div>
                  </AnimatedListItem>
                ))}
              </AnimatedList>
            ) : (
              <div className="py-4 text-center">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 dark:text-emerald-500 mx-auto mb-1" />
                <p className="text-xs text-slate-400 dark:text-slate-500">All bills paid! 🎉</p>
              </div>
            )}
          </motion.div>

          {/* Recent Transactions */}
          <motion.div
            className="card hover-lift flex-1 flex flex-col"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.35, ease: [0.16, 1, 0.3, 1] as const }}
          >
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-bold text-slate-800 dark:text-white">Recent Transactions</p>
              <Link
                to="/expenses"
                className="flex items-center gap-0.5 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold transition-colors"
              >
                All <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {recentTransactions.length > 0 ? (
              <AnimatedList className="space-y-0.5 flex-1">
                {recentTransactions.map((tx) => (
                  <AnimatedListItem key={tx.id} className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-800/50 last:border-0">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`p-1.5 rounded-lg shrink-0 ${
                          tx.type === 'income' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' : 'bg-rose-50 dark:bg-rose-900/20 text-rose-500 dark:text-rose-400'
                        }`}
                      >
                        {tx.type === 'income' ? (
                          <TrendingUp className="w-3.5 h-3.5" />
                        ) : (
                          <TrendingDown className="w-3.5 h-3.5" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">{tx.title}</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500">{formatDate(tx.date)}</p>
                      </div>
                    </div>
                    <p
                      className={`text-xs font-bold shrink-0 ml-2 ${
                        tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                    </p>
                  </AnimatedListItem>
                ))}
              </AnimatedList>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center py-8 text-center">
                <TrendingDown className="w-8 h-8 text-slate-200 dark:text-slate-700 mb-2" />
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">No transactions yet</p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Add your first expense to get started</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Category Dashboards Grid */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4, ease: [0.16, 1, 0.3, 1] as const }}
      >
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-bold text-slate-800 dark:text-white">Category Dashboards</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Tap a category for detailed analytics</p>
            </div>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-2">
            {categoryStats.map((stat, i) => {
              const cm = CATEGORY_META[stat.category];
              return (
                <motion.div
                  key={stat.category}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.55 + i * 0.04, duration: 0.3, ease: [0.16, 1, 0.3, 1] as const }}
                >
                  <Link
                    to={`/category/${stat.category.toLowerCase()}`}
                    className="group flex flex-col items-center gap-1.5 p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 hover:bg-white dark:hover:bg-slate-800 hover:border-slate-200 dark:hover:border-slate-700 hover:shadow-md transition-all"
                  >
                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${cm.gradient} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
                      <span className="text-base">{cm.emoji}</span>
                    </div>
                    <span className="text-[10px] font-semibold text-slate-700 dark:text-slate-300 leading-tight text-center">
                      {stat.category}
                    </span>
                    <span className={`text-[10px] font-bold ${stat.total > 0 ? cm.color : 'text-slate-300 dark:text-slate-600'}`}>
                      {stat.total > 0 ? formatCurrency(stat.total) : '—'}
                    </span>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
