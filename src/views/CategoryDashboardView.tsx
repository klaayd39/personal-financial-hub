import React, { useMemo } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, MONTH_NAMES } from '../utils/formatters';
import {
  ArrowLeft, TrendingDown, Calendar, CreditCard, BarChart3, Clock,
  Wallet, DollarSign,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Cell, PieChart, Pie,
} from 'recharts';
import type { ExpenseCategory } from '../types/finance';

/* ─── Category metadata ──────────────────────────────────────────────── */
const CATEGORY_META: Record<string, { emoji: string; gradient: string; color: string; fill: string; accent: string }> = {
  Food:            { emoji: '🍽️', gradient: 'from-orange-500 to-amber-500',   color: 'text-orange-500',  fill: '#f97316', accent: 'bg-orange-50 dark:bg-orange-900/20' },
  Transportation:  { emoji: '🚗', gradient: 'from-sky-500 to-cyan-500',       color: 'text-sky-500',     fill: '#0ea5e9', accent: 'bg-sky-50 dark:bg-sky-900/20' },
  Bills:           { emoji: '📋', gradient: 'from-slate-600 to-slate-500',     color: 'text-slate-500',   fill: '#64748b', accent: 'bg-slate-50 dark:bg-slate-800/50' },
  Shopping:        { emoji: '🛒', gradient: 'from-pink-500 to-rose-500',       color: 'text-pink-500',    fill: '#ec4899', accent: 'bg-pink-50 dark:bg-pink-900/20' },
  Entertainment:   { emoji: '🎬', gradient: 'from-purple-500 to-violet-500',   color: 'text-purple-500',  fill: '#a855f7', accent: 'bg-purple-50 dark:bg-purple-900/20' },
  Health:          { emoji: '🏥', gradient: 'from-emerald-500 to-teal-500',    color: 'text-emerald-500', fill: '#10b981', accent: 'bg-emerald-50 dark:bg-emerald-900/20' },
  Education:       { emoji: '📚', gradient: 'from-blue-600 to-indigo-600',     color: 'text-blue-600',    fill: '#2563eb', accent: 'bg-blue-50 dark:bg-blue-900/20' },
  Travel:          { emoji: '✈️', gradient: 'from-teal-500 to-cyan-500',       color: 'text-teal-500',    fill: '#14b8a6', accent: 'bg-teal-50 dark:bg-teal-900/20' },
  Miscellaneous:   { emoji: '📦', gradient: 'from-amber-500 to-yellow-500',    color: 'text-amber-500',   fill: '#f59e0b', accent: 'bg-amber-50 dark:bg-amber-900/20' },
};

const VALID_CATEGORIES: ExpenseCategory[] = [
  'Food', 'Transportation', 'Bills', 'Shopping',
  'Entertainment', 'Health', 'Education', 'Travel', 'Miscellaneous',
];

const PAYMENT_COLORS: Record<string, string> = {
  'Cash':          '#22c55e',
  'Credit Card':   '#8b5cf6',
  'Debit Card':    '#3b82f6',
  'Bank Transfer': '#f59e0b',
  'E-Wallet':      '#ec4899',
};

/* ─── Helpers ────────────────────────────────────────────────────────── */
function getWeekOfMonth(dateStr: string): number {
  const d = new Date(dateStr + 'T00:00:00');
  const day = d.getDate();
  return Math.ceil(day / 7);
}

/* ─── Animation variants ─────────────────────────────────────────────── */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as const },
  },
};

/* ─── Custom Tooltip ─────────────────────────────────────────────────── */
const ChartTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl shadow-lg px-3 py-2 text-xs transition-colors duration-200">
        <p className="font-semibold text-slate-700 dark:text-slate-300 mb-1">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} className="font-bold" style={{ color: p.color || p.fill }}>
            {formatCurrency(p.value ?? 0)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

/* ═══════════════════════════════════════════════════════════════════════ */
/*  CategoryDashboardView                                                */
/* ═══════════════════════════════════════════════════════════════════════ */
export const CategoryDashboardView: React.FC = () => {
  const { categoryName } = useParams<{ categoryName: string }>();
  const { expenses, filter } = useFinance();

  // Validate category
  const category = VALID_CATEGORIES.find(
    (c) => c.toLowerCase() === (categoryName ?? '').toLowerCase(),
  );
  if (!category) return <Navigate to="/" replace />;

  const meta = CATEGORY_META[category];

  /* ─── All expenses for this category (all-time) ───────────────────── */
  const categoryExpenses = useMemo(
    () => expenses.filter((e) => e.category === category),
    [expenses, category],
  );

  /* ─── Year-filtered expenses ──────────────────────────────────────── */
  const yearExpenses = useMemo(
    () =>
      categoryExpenses.filter((e) => {
        const d = new Date(e.date + 'T00:00:00');
        return d.getFullYear() === filter.year;
      }),
    [categoryExpenses, filter.year],
  );

  /* ─── Month-filtered (if a specific month is selected) ────────────── */
  const monthExpenses = useMemo(() => {
    if (filter.month === -1) return yearExpenses;
    return yearExpenses.filter((e) => {
      const d = new Date(e.date + 'T00:00:00');
      return d.getMonth() === filter.month;
    });
  }, [yearExpenses, filter.month]);

  /* ─── KPI totals ──────────────────────────────────────────────────── */
  const totalAllTime = useMemo(
    () => categoryExpenses.reduce((s, e) => s + e.amount, 0),
    [categoryExpenses],
  );
  const totalYear = useMemo(
    () => yearExpenses.reduce((s, e) => s + e.amount, 0),
    [yearExpenses],
  );
  const totalFiltered = useMemo(
    () => monthExpenses.reduce((s, e) => s + e.amount, 0),
    [monthExpenses],
  );

  /* ─── Average per transaction ─────────────────────────────────────── */
  const avgTransaction = monthExpenses.length > 0 ? totalFiltered / monthExpenses.length : 0;

  /* ─── 12-month trend ──────────────────────────────────────────────── */
  const monthlyTrend = useMemo(() => {
    const totals = Array(12).fill(0);
    yearExpenses.forEach((e) => {
      const d = new Date(e.date + 'T00:00:00');
      totals[d.getMonth()] += e.amount;
    });
    return MONTH_NAMES.map((name, i) => ({
      month: name.slice(0, 3),
      Amount: Math.round(totals[i]),
    }));
  }, [yearExpenses]);

  /* ─── Weekly breakdown (for selected month or year summary) ───────── */
  const weeklyData = useMemo(() => {
    if (filter.month === -1) {
      // Show quarterly breakdown when "All Months"
      const quarters = [
        { label: 'Q1 (Jan–Mar)', months: [0, 1, 2], total: 0 },
        { label: 'Q2 (Apr–Jun)', months: [3, 4, 5], total: 0 },
        { label: 'Q3 (Jul–Sep)', months: [6, 7, 8], total: 0 },
        { label: 'Q4 (Oct–Dec)', months: [9, 10, 11], total: 0 },
      ];
      yearExpenses.forEach((e) => {
        const m = new Date(e.date + 'T00:00:00').getMonth();
        const qi = Math.floor(m / 3);
        quarters[qi].total += e.amount;
      });
      return quarters.map((q) => ({ week: q.label, Amount: Math.round(q.total) }));
    }

    // Week-by-week for the selected month
    const weeks: Record<number, number> = {};
    monthExpenses.forEach((e) => {
      const w = getWeekOfMonth(e.date);
      weeks[w] = (weeks[w] || 0) + e.amount;
    });
    const maxWeek = Math.max(4, ...Object.keys(weeks).map(Number));
    return Array.from({ length: maxWeek }, (_, i) => ({
      week: `Week ${i + 1}`,
      Amount: Math.round(weeks[i + 1] || 0),
    }));
  }, [monthExpenses, yearExpenses, filter.month]);

  /* ─── Payment method distribution ─────────────────────────────────── */
  const paymentDistribution = useMemo(() => {
    const map: Record<string, number> = {};
    monthExpenses.forEach((e) => {
      map[e.payment_method] = (map[e.payment_method] || 0) + e.amount;
    });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value: Math.round(value) }))
      .sort((a, b) => b.value - a.value);
  }, [monthExpenses]);

  /* ─── Top 5 biggest transactions ──────────────────────────────────── */
  const topTransactions = useMemo(
    () =>
      [...monthExpenses]
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5),
    [monthExpenses],
  );

  /* ─── Period label ────────────────────────────────────────────────── */
  const periodLabel =
    filter.month === -1 ? `${filter.year}` : `${MONTH_NAMES[filter.month]} ${filter.year}`;

  /* ─── Render ──────────────────────────────────────────────────────── */
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* ── Back + Header ─────────────────────────────────────────────── */}
      <motion.div variants={itemVariants} className="flex items-center gap-3">
        <Link
          to="/"
          className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-600 transition-all shadow-sm"
          aria-label="Back to dashboard"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${meta.gradient} flex items-center justify-center shadow-md`}>
            <span className="text-lg">{meta.emoji}</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              {category}
            </h1>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              Expense Dashboard · {periodLabel}
            </p>
          </div>
        </div>
      </motion.div>

      {/* ── KPI Cards ─────────────────────────────────────────────────── */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              label: 'Total Spent (All-Time)',
              value: totalAllTime,
              icon: <DollarSign className="w-4 h-4" />,
              iconColor: meta.color,
              iconBg: meta.accent,
            },
            {
              label: `Total (${filter.year})`,
              value: totalYear,
              icon: <Calendar className="w-4 h-4" />,
              iconColor: 'text-blue-500 dark:text-blue-400',
              iconBg: 'bg-blue-50 dark:bg-blue-900/20',
            },
            {
              label: filter.month === -1 ? 'Annual Total' : `${MONTH_NAMES[filter.month]} Total`,
              value: totalFiltered,
              icon: <TrendingDown className="w-4 h-4" />,
              iconColor: 'text-rose-500 dark:text-rose-400',
              iconBg: 'bg-rose-50 dark:bg-rose-900/20',
            },
            {
              label: 'Avg / Transaction',
              value: avgTransaction,
              icon: <BarChart3 className="w-4 h-4" />,
              iconColor: 'text-violet-500 dark:text-violet-400',
              iconBg: 'bg-violet-50 dark:bg-violet-900/20',
            },
          ].map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.1 + i * 0.06, duration: 0.35, ease: [0.16, 1, 0.3, 1] as const }}
              className="card hover-lift group cursor-default"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-slate-400 dark:text-slate-500 font-medium leading-tight">
                  {card.label}
                </span>
                <span className={`${card.iconColor} ${card.iconBg} p-1.5 rounded-lg shrink-0 transition-transform group-hover:scale-110`}>
                  {card.icon}
                </span>
              </div>
              <p className={`text-xl font-bold ${meta.color} tracking-tight`}>
                {formatCurrency(card.value)}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ── Charts Row ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Spending Trend */}
        <motion.div variants={itemVariants}>
          <div className="card hover-lift h-full flex flex-col">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-sm font-bold text-slate-800 dark:text-white">Monthly Spending</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                  {filter.year} — 12-month view
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: meta.fill }} />
                <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">{category}</span>
              </div>
            </div>
            <div className="flex-1 min-h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyTrend} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id={`catGrad-${category}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={meta.fill} stopOpacity={0.18} />
                      <stop offset="95%" stopColor={meta.fill} stopOpacity={0} />
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
                  <Tooltip content={<ChartTooltip />} cursor={{ stroke: '#e2e8f0', strokeWidth: 1 }} />
                  <Area
                    type="monotone"
                    dataKey="Amount"
                    stroke={meta.fill}
                    strokeWidth={2.5}
                    fill={`url(#catGrad-${category})`}
                    dot={{ fill: meta.fill, r: 3, strokeWidth: 0 }}
                    activeDot={{ r: 5, fill: meta.fill, strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>

        {/* Weekly / Quarterly Breakdown */}
        <motion.div variants={itemVariants}>
          <div className="card hover-lift h-full flex flex-col">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-sm font-bold text-slate-800 dark:text-white">
                  {filter.month === -1 ? 'Quarterly Breakdown' : 'Weekly Breakdown'}
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                  {periodLabel}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Clock className={`w-3.5 h-3.5 ${meta.color}`} />
                <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                  {filter.month === -1 ? 'Per quarter' : 'Per week'}
                </span>
              </div>
            </div>
            <div className="flex-1 min-h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="week" stroke="#cbd5e1" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis
                    stroke="#cbd5e1"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `₱${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
                  <Bar dataKey="Amount" radius={[6, 6, 0, 0]} maxBarSize={40}>
                    {weeklyData.map((_, idx) => (
                      <Cell key={idx} fill={meta.fill} fillOpacity={0.85} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Bottom Row: Payment Methods + Top Transactions ────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payment Method Distribution */}
        <motion.div variants={itemVariants}>
          <div className="card hover-lift h-full flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <div className={`p-1.5 ${meta.accent} rounded-lg`}>
                <CreditCard className={`w-3.5 h-3.5 ${meta.color}`} />
              </div>
              <p className="text-sm font-bold text-slate-800 dark:text-white">Payment Methods</p>
            </div>

            {paymentDistribution.length > 0 ? (
              <>
                <div className="flex-1 min-h-[180px] flex items-center justify-center">
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie
                        data={paymentDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={48}
                        outerRadius={72}
                        paddingAngle={3}
                        dataKey="value"
                        strokeWidth={0}
                      >
                        {paymentDistribution.map((entry, index) => (
                          <Cell key={index} fill={PAYMENT_COLORS[entry.name] || '#94a3b8'} />
                        ))}
                      </Pie>
                      <Tooltip content={<ChartTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-3 space-y-2">
                  {paymentDistribution.map((pm) => (
                    <div key={pm.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: PAYMENT_COLORS[pm.name] || '#94a3b8' }}
                        />
                        <span className="text-slate-600 dark:text-slate-400 font-medium">{pm.name}</span>
                      </div>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {formatCurrency(pm.value)}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center py-8">
                <div className="text-center">
                  <Wallet className="w-8 h-8 text-slate-200 dark:text-slate-700 mx-auto mb-2" />
                  <p className="text-xs text-slate-400 dark:text-slate-500">No data for this period</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Top Transactions */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <div className="card hover-lift h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 ${meta.accent} rounded-lg`}>
                  <BarChart3 className={`w-3.5 h-3.5 ${meta.color}`} />
                </div>
                <p className="text-sm font-bold text-slate-800 dark:text-white">Top Transactions</p>
              </div>
              <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                {monthExpenses.length} total
              </span>
            </div>

            {topTransactions.length > 0 ? (
              <div className="flex-1 space-y-1">
                {topTransactions.map((tx, i) => {
                  const pct = topTransactions[0].amount > 0 ? (tx.amount / topTransactions[0].amount) * 100 : 0;
                  return (
                    <motion.div
                      key={tx.id}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.06, duration: 0.3, ease: [0.16, 1, 0.3, 1] as const }}
                      className="group flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Rank */}
                      <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0 ${
                        i === 0
                          ? `bg-gradient-to-br ${meta.gradient} text-white shadow-sm`
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                      }`}>
                        {i + 1}
                      </span>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">
                          {tx.description}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-slate-400 dark:text-slate-500">
                            {new Date(tx.date + 'T00:00:00').toLocaleDateString('en-PH', {
                              month: 'short', day: 'numeric', year: 'numeric',
                            })}
                          </span>
                          <span className="text-[10px] text-slate-300 dark:text-slate-600">·</span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500">{tx.payment_method}</span>
                        </div>
                        {/* Mini progress bar */}
                        <div className="mt-1.5 w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full rounded-full"
                            style={{ backgroundColor: meta.fill }}
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ delay: 0.5 + i * 0.06, duration: 0.6, ease: 'easeOut' as const }}
                          />
                        </div>
                      </div>

                      {/* Amount */}
                      <span className={`text-xs font-bold shrink-0 ${meta.color}`}>
                        -{formatCurrency(tx.amount)}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center py-8">
                <div className="text-center">
                  <TrendingDown className="w-8 h-8 text-slate-200 dark:text-slate-700 mx-auto mb-2" />
                  <p className="text-xs text-slate-400 dark:text-slate-500">No transactions for this period</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* ── All Categories Quick Nav ──────────────────────────────────── */}
      <motion.div variants={itemVariants}>
        <div className="card">
          <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
            Browse Categories
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-2">
            {VALID_CATEGORIES.map((cat) => {
              const cm = CATEGORY_META[cat];
              const isActive = cat === category;
              return (
                <Link
                  key={cat}
                  to={`/category/${cat.toLowerCase()}`}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-all ${
                    isActive
                      ? `bg-gradient-to-br ${cm.gradient} text-white border-transparent shadow-md scale-105`
                      : 'bg-slate-50/50 dark:bg-slate-800/30 border-slate-100 dark:border-slate-800 hover:bg-slate-100/70 dark:hover:bg-slate-800/70 hover:border-slate-200 dark:hover:border-slate-700'
                  }`}
                >
                  <span className="text-lg">{cm.emoji}</span>
                  <span className={`text-[10px] font-semibold leading-tight ${
                    isActive ? 'text-white' : 'text-slate-600 dark:text-slate-400'
                  }`}>
                    {cat}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
