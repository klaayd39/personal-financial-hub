import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { useFinance } from '../context/FinanceContext';
import type { BillRecord, ExpenseRecord } from '../types/finance';
import { formatCurrency, formatDate } from '../utils/formatters';
import { ConfirmModal } from '../components/ConfirmModal';
import { AnimatedModal } from '../components/AnimatedModal';
import { AnimatedList, AnimatedListItem } from '../components/AnimatedComponents';
import {
  Plus, Edit2, Trash2, X, CheckCircle2, Circle,
  Calendar, AlertTriangle, Receipt, Zap, Download, Search, AlertCircle, Clock
} from 'lucide-react';

interface BillModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: BillRecord | null;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

type BillCategory = 'Utilities' | 'Subscriptions' | 'Rent' | 'Loans' | 'Insurance' | 'Other';

const BILL_CATEGORIES: { label: BillCategory; emoji: string }[] = [
  { label: 'Utilities', emoji: '⚡' },
  { label: 'Subscriptions', emoji: '💳' },
  { label: 'Rent', emoji: '🏠' },
  { label: 'Loans', emoji: '🏦' },
  { label: 'Insurance', emoji: '🛡️' },
  { label: 'Other', emoji: '📦' },
];

const CATEGORY_EMOJI: Record<string, string> = {
  Utilities: '⚡',
  Subscriptions: '💳',
  Rent: '🏠',
  Loans: '🏦',
  Insurance: '🛡️',
  Other: '📦',
};

const fieldVariants: Variants = {
  hidden: { opacity: 0, y: 6 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.2, ease: 'easeOut' as const },
  }),
};

const BillModal: React.FC<BillModalProps> = ({ isOpen, onClose, initialData }) => {
  const { addBill, updateBill } = useFinance();
  const [name, setName] = useState(initialData?.name ?? '');
  const [amount, setAmount] = useState(initialData?.amount.toString() ?? '');
  const [dueDay, setDueDay] = useState(initialData?.due_day.toString() ?? '1');
  const [category, setCategory] = useState<BillCategory>(
    (initialData?.category as BillCategory) ?? 'Utilities'
  );
  const [monthOption, setMonthOption] = useState<string>(
    initialData?.month !== undefined && initialData?.month !== null
      ? initialData.month.toString()
      : 'all'
  );
  const [yearOption, setYearOption] = useState<number>(
    initialData?.year ?? new Date().getFullYear()
  );
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly' | 'weekly'>(
    initialData?.billing_cycle ?? 'monthly'
  );
  const [notes, setNotes] = useState(initialData?.notes ?? '');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setName(initialData?.name ?? '');
      setAmount(initialData?.amount.toString() ?? '');
      setDueDay(initialData?.due_day.toString() ?? '1');
      setCategory((initialData?.category as BillCategory) ?? 'Utilities');
      setMonthOption(
        initialData?.month !== undefined && initialData?.month !== null
          ? initialData.month.toString()
          : 'all'
      );
      setYearOption(initialData?.year ?? new Date().getFullYear());
      setBillingCycle(initialData?.billing_cycle ?? 'monthly');
      setNotes(initialData?.notes ?? '');
      setError('');
      setIsSubmitting(false);
    }
  }, [isOpen, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    const parsedDay = parseInt(dueDay, 10);
    const targetMonth = monthOption === 'all' ? undefined : parseInt(monthOption, 10);
    const targetYear = monthOption === 'all' ? undefined : yearOption;

    if (!name.trim()) {
      setError('Please enter a bill name.');
      return;
    }
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid bill amount greater than ₱0.');
      return;
    }
    if (isNaN(parsedDay) || parsedDay < 1 || parsedDay > 31) {
      setError('Please enter a valid due day of the month (1 - 31).');
      return;
    }

    setIsSubmitting(true);
    try {
      if (initialData) {
        await updateBill(initialData.id, {
          name: name.trim(),
          amount: parsedAmount,
          due_day: parsedDay,
          category,
          month: targetMonth,
          year: targetYear,
          billing_cycle: billingCycle,
          notes: notes.trim() || undefined,
        });
      } else {
        await addBill({
          name: name.trim(),
          amount: parsedAmount,
          due_day: parsedDay,
          category,
          month: targetMonth,
          year: targetYear,
          billing_cycle: billingCycle,
          is_paid: false,
          notes: notes.trim() || undefined,
        });
      }
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatedModal isOpen={isOpen} onClose={onClose} maxWidth="max-w-md">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden transition-colors duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-blue-50 to-white dark:from-blue-900/20 dark:to-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
              <Receipt className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {initialData ? 'Edit Bill' : 'Add New Bill'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Error Banner */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-3 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/50 text-rose-700 dark:text-rose-400 text-xs rounded-xl flex items-center gap-2"
                role="alert"
              >
                <AlertTriangle className="w-4 h-4 shrink-0" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bill Name */}
          <motion.div custom={0} variants={fieldVariants} initial="hidden" animate="visible">
            <label htmlFor="bill-name" className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
              Bill / Subscription Name *
            </label>
            <input
              id="bill-name"
              type="text"
              required
              placeholder="e.g. Electricity, Internet, Spotify"
              value={name}
              onChange={(e) => { setName(e.target.value); setError(''); }}
              className="input-base text-sm"
            />
          </motion.div>

          {/* Category selection */}
          <motion.div custom={1} variants={fieldVariants} initial="hidden" animate="visible">
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Category
            </label>
            <div className="grid grid-cols-3 gap-2">
              {BILL_CATEGORIES.map((cat) => (
                <button
                  key={cat.label}
                  type="button"
                  onClick={() => setCategory(cat.label)}
                  className={`py-1.5 px-2 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-all ${
                    category === cat.label
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-800/50 text-blue-700 dark:text-blue-400 ring-2 ring-blue-500/20 font-semibold'
                      : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <span>{cat.emoji}</span>
                  <span className="truncate">{cat.label}</span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Amount & Due Day */}
          <motion.div custom={2} variants={fieldVariants} initial="hidden" animate="visible" className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="bill-amount" className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                Amount (₱) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 font-bold text-xs pointer-events-none select-none">₱</span>
                <input
                  id="bill-amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => { setAmount(e.target.value); setError(''); }}
                  className="input-base !pl-9 text-sm font-bold"
                />
              </div>
            </div>

            <div>
              <label htmlFor="bill-due" className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                Due Day (1–31) *
              </label>
              <input
                id="bill-due"
                type="number"
                min="1"
                max="31"
                required
                placeholder="e.g. 15"
                value={dueDay}
                onChange={(e) => { setDueDay(e.target.value); setError(''); }}
                className="input-base text-sm"
              />
            </div>
          </motion.div>

          {/* Month & Year */}
          <motion.div custom={3} variants={fieldVariants} initial="hidden" animate="visible" className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="bill-month" className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                Bill Month
              </label>
              <select
                id="bill-month"
                value={monthOption}
                onChange={(e) => setMonthOption(e.target.value)}
                className="input-base text-xs font-medium"
              >
                <option value="all">Every Month (Recurring)</option>
                {MONTH_NAMES.map((m, idx) => (
                  <option key={m} value={idx}>{m}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="bill-year" className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                Bill Year
              </label>
              <select
                id="bill-year"
                disabled={monthOption === 'all'}
                value={yearOption}
                onChange={(e) => setYearOption(Number(e.target.value))}
                className="input-base text-xs font-medium disabled:opacity-50"
              >
                {[2024, 2025, 2026, 2027, 2028].map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </motion.div>

          {/* Billing Cycle */}
          <motion.div custom={4} variants={fieldVariants} initial="hidden" animate="visible">
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
              Billing Cycle
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['monthly', 'yearly', 'weekly'] as const).map((cycle) => (
                <button
                  key={cycle}
                  type="button"
                  onClick={() => setBillingCycle(cycle)}
                  className={`py-2 rounded-xl border text-xs font-semibold capitalize transition-all active:scale-95 ${
                    billingCycle === cycle
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-800/50 text-blue-700 dark:text-blue-400 ring-2 ring-blue-500/20'
                      : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                  aria-pressed={billingCycle === cycle}
                >
                  {cycle}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Notes */}
          <motion.div custom={5} variants={fieldVariants} initial="hidden" animate="visible">
            <label htmlFor="bill-notes" className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
              Notes <span className="font-normal text-slate-400 dark:text-slate-500">(Optional)</span>
            </label>
            <input
              id="bill-notes"
              type="text"
              placeholder="e.g. Auto-debit from Credit Card"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="input-base text-xs"
            />
          </motion.div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button type="button" onClick={onClose} className="btn-secondary py-2 text-xs">
              Cancel
            </button>
            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileTap={{ scale: 0.97 }}
              className="btn-primary py-2 text-xs disabled:opacity-50"
            >
              {isSubmitting ? 'Saving…' : initialData ? 'Update Bill' : 'Add Bill'}
            </motion.button>
          </div>
        </form>
      </div>
    </AnimatedModal>
  );
};

// ─── BillsView ──────────────────────────────────────────────────────────────

export const BillsView: React.FC = () => {
  const { bills, expenses, deleteBill, toggleBillPaid } = useFinance();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBill, setEditingBill] = useState<BillRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'paid' | 'overdue'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLinkedExpense, setSelectedLinkedExpense] = useState<{
    bill: BillRecord;
    expense?: ExpenseRecord;
  } | null>(null);

  const todayDay = new Date().getDate();

  const totalMonthlyBills = bills.reduce((sum, b) => sum + b.amount, 0);
  const paidTotal = bills.filter((b) => b.is_paid).reduce((sum, b) => sum + b.amount, 0);
  const unpaidTotal = totalMonthlyBills - paidTotal;
  const overdueCount = bills.filter((b) => !b.is_paid && b.due_day < todayDay).length;

  const handleOpenAdd = () => {
    setEditingBill(null);
    setIsModalOpen(true);
  };

  const handleEdit = (bill: BillRecord) => {
    setEditingBill(bill);
    setIsModalOpen(true);
  };

  const handleTogglePaid = async (id: string) => {
    setTogglingId(id);
    try {
      await toggleBillPaid(id);
    } finally {
      setTogglingId(null);
    }
  };

  const handleExportCSV = () => {
    if (bills.length === 0) return;
    const headers = ['Bill Name', 'Category', 'Due Day', 'Amount (PHP)', 'Status', 'Billing Cycle', 'Notes'];
    const rows = bills.map((b) => [
      `"${b.name.replace(/"/g, '""')}"`,
      `"${b.category || 'Uncategorized'}"`,
      b.due_day,
      b.amount.toFixed(2),
      b.is_paid ? 'Paid' : (b.due_day < todayDay ? 'Overdue' : 'Pending'),
      b.billing_cycle,
      `"${(b.notes || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Recurring_Bills_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered Bills
  const filteredBills = useMemo(() => {
    return bills.filter((b) => {
      const isPastDue = !b.is_paid && b.due_day < todayDay;
      const matchesFilter =
        activeFilter === 'all' ||
        (activeFilter === 'paid' && b.is_paid) ||
        (activeFilter === 'pending' && !b.is_paid) ||
        (activeFilter === 'overdue' && isPastDue);

      const matchesSearch =
        !searchQuery ||
        b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.category && b.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (b.notes && b.notes.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesFilter && matchesSearch;
    });
  }, [bills, activeFilter, searchQuery, todayDay]);

  const summaryCards = [
    {
      label: 'Total Monthly Bills',
      value: totalMonthlyBills,
      color: 'text-slate-900 dark:text-white',
      sub: `${bills.length} recurring item${bills.length !== 1 ? 's' : ''}`,
      icon: <Receipt className="w-4 h-4" />,
      bg: 'bg-slate-50 dark:bg-slate-800/50',
      iconColor: 'text-slate-500 dark:text-slate-400',
    },
    {
      label: 'Total Paid',
      value: paidTotal,
      color: 'text-emerald-600 dark:text-emerald-400',
      progress: bills.length > 0 ? (paidTotal / totalMonthlyBills) * 100 : 0,
      sub: `${bills.filter((b) => b.is_paid).length} paid`,
      icon: <CheckCircle2 className="w-4 h-4" />,
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
      iconColor: 'text-emerald-500 dark:text-emerald-400',
    },
    {
      label: 'Unpaid Remaining',
      value: unpaidTotal,
      color: overdueCount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400',
      sub: overdueCount > 0 ? `${overdueCount} overdue · ${bills.filter((b) => !b.is_paid).length} pending` : `${bills.filter((b) => !b.is_paid).length} pending`,
      icon: <Zap className="w-4 h-4" />,
      bg: overdueCount > 0 ? 'bg-rose-50 dark:bg-rose-900/20' : 'bg-amber-50 dark:bg-amber-900/20',
      iconColor: overdueCount > 0 ? 'text-rose-500 dark:text-rose-400' : 'text-amber-500 dark:text-amber-400',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Fixed &amp; Recurring Bills</h1>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
            Track monthly subscriptions, utilities, and scheduled payments.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={handleExportCSV}
            disabled={bills.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl transition-colors disabled:opacity-40"
            title="Export Bills CSV"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleOpenAdd}
            className="btn-primary gap-1.5 text-xs py-2"
          >
            <Plus className="w-4 h-4" />
            Add Bill
          </motion.button>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {summaryCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.3 }}
            className="card hover-lift"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">{card.label}</span>
              <span className={`${card.iconColor} ${card.bg} p-1.5 rounded-lg`}>{card.icon}</span>
            </div>
            <p className={`text-2xl font-extrabold ${card.color} tracking-tight mt-1`}>
              {formatCurrency(card.value)}
            </p>
            {'progress' in card && card.progress !== undefined && (
              <div className="mt-3">
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-emerald-500 dark:bg-emerald-400 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${card.progress}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' as const, delay: 0.3 }}
                  />
                </div>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium mt-1 block">
                  {card.progress.toFixed(0)}% paid
                </span>
              </div>
            )}
            <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block">{card.sub}</span>
          </motion.div>
        ))}
      </div>

      {/* Filter Tabs & Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-2.5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm transition-colors duration-200">
        {/* Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All Bills', count: bills.length },
            { id: 'pending', label: 'Pending', count: bills.filter((b) => !b.is_paid).length },
            { id: 'overdue', label: 'Overdue', count: overdueCount, alert: overdueCount > 0 },
            { id: 'paid', label: 'Paid', count: bills.filter((b) => b.is_paid).length },
          ].map((tab) => (
            <motion.button
              key={tab.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeFilter === tab.id
                  ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  tab.alert
                    ? 'bg-rose-500 text-white animate-pulse'
                    : activeFilter === tab.id
                    ? 'bg-slate-700 text-white'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                {tab.count}
              </span>
            </motion.button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[200px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Search bills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>
      </div>

      {/* Bills List */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.3 }}
        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden transition-colors duration-200"
      >
        {filteredBills.length > 0 ? (
          <AnimatedList className="divide-y divide-slate-100 dark:divide-slate-800/50">
            {filteredBills.map((bill) => {
              const daysDiff = bill.due_day - todayDay;
              const isDueToday = !bill.is_paid && bill.due_day === todayDay;
              const isDueSoon = !bill.is_paid && daysDiff > 0 && daysDiff <= 5;
              const isPastDue = !bill.is_paid && bill.due_day < todayDay;
              const daysOverdue = Math.abs(daysDiff);
              const isToggling = togglingId === bill.id;

              return (
                <AnimatedListItem
                  key={bill.id}
                  className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors border-l-4 ${
                    bill.is_paid
                      ? 'bg-emerald-50/20 dark:bg-emerald-900/10 border-l-emerald-400 dark:border-l-emerald-500'
                      : isPastDue
                      ? 'bg-rose-50/40 dark:bg-rose-900/20 border-l-rose-500'
                      : isDueToday
                      ? 'bg-amber-50/50 dark:bg-amber-900/20 border-l-amber-500'
                      : isDueSoon
                      ? 'bg-amber-50/30 dark:bg-amber-900/10 border-l-amber-400 dark:border-l-amber-500'
                      : 'hover:bg-slate-50/70 dark:hover:bg-slate-800/30 border-l-blue-300 dark:border-l-blue-500'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <motion.button
                      onClick={() => handleTogglePaid(bill.id)}
                      disabled={isToggling}
                      whileTap={{ scale: 0.8 }}
                      animate={isToggling ? { rotate: 360 } : {}}
                      transition={isToggling ? { duration: 0.5, repeat: Infinity, ease: 'linear' } : {}}
                      className={`p-1.5 rounded-full transition-colors shrink-0 ${
                        bill.is_paid
                          ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 hover:bg-emerald-200 dark:hover:bg-emerald-900/50'
                          : isPastDue
                          ? 'text-rose-500 dark:text-rose-400 bg-rose-100 dark:bg-rose-900/30 hover:bg-rose-200 dark:hover:bg-rose-900/50'
                          : 'text-slate-300 dark:text-slate-600 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                      } disabled:cursor-not-allowed`}
                      title={bill.is_paid ? 'Mark as Unpaid' : 'Mark as Paid'}
                      aria-label={bill.is_paid ? `Mark ${bill.name} as unpaid` : `Mark ${bill.name} as paid`}
                    >
                      {bill.is_paid ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </motion.button>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Category Emoji */}
                        <span className="text-base leading-none">
                          {CATEGORY_EMOJI[bill.category || 'Other'] || '📦'}
                        </span>

                        <h4
                          className={`text-sm font-semibold truncate ${
                            bill.is_paid ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-slate-200'
                          }`}
                        >
                          {bill.name}
                        </h4>
                        
                        {/* Category Chip */}
                        {bill.category && (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                            {bill.category}
                          </span>
                        )}

                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-800/50">
                          {bill.month !== undefined && bill.month !== null
                            ? `${MONTH_NAMES[bill.month]} ${bill.year || ''}`
                            : 'Every Month'}
                        </span>

                        {/* Relative Due Date Badges */}
                        {bill.is_paid ? (
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                            Paid
                          </span>
                        ) : isPastDue ? (
                          <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50 inline-flex items-center gap-1 animate-pulse">
                            <AlertCircle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                            Overdue by {daysOverdue} day{daysOverdue !== 1 ? 's' : ''}
                          </span>
                        ) : isDueToday ? (
                          <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-500 text-white inline-flex items-center gap-1 shadow-sm animate-bounce">
                            <Clock className="w-3 h-3 text-white" />
                            Due Today!
                          </span>
                        ) : isDueSoon ? (
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50 inline-flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                            Due in {daysDiff} day{daysDiff !== 1 ? 's' : ''}
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                            Due Day {bill.due_day}
                          </span>
                        )}

                        {/* Linked Expense Badge */}
                        {bill.is_paid && bill.bill_expense_id && (
                          <button
                            type="button"
                            onClick={() => {
                              const linkedExp = expenses.find((e) => e.id === bill.bill_expense_id);
                              setSelectedLinkedExpense({ bill, expense: linkedExp });
                            }}
                            className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors flex items-center gap-1 cursor-pointer"
                            title="View Linked Expense Record"
                          >
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                            View Linked Expense
                          </button>
                        )}
                      </div>
                      {bill.notes && <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{bill.notes}</p>}
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 dark:border-slate-800">
                    <p className={`text-sm font-bold ${bill.is_paid ? 'text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-white'}`}>
                      {formatCurrency(bill.amount)}
                    </p>
                    <div className="flex items-center gap-1">
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleEdit(bill)}
                        className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        title="Edit Bill"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setDeleteTarget(bill.id)}
                        className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                        title="Delete Bill"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </motion.button>
                    </div>
                  </div>
                </AnimatedListItem>
              );
            })}
          </AnimatedList>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-16 text-center"
          >
            <Calendar className="w-10 h-10 text-slate-200 dark:text-slate-700 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">No bills found</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 mb-5">
              {searchQuery
                ? `No results matching "${searchQuery}"`
                : activeFilter !== 'all'
                ? `No bills matching "${activeFilter}" filter.`
                : 'Keep track of your monthly subscriptions, utilities, and scheduled payments.'}
            </p>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleOpenAdd}
              className="btn-primary text-xs py-2 mx-auto"
            >
              <Plus className="w-3.5 h-3.5" /> Add First Bill
            </motion.button>
          </motion.div>
        )}
      </motion.div>

      {/* Bill Modal */}
      <BillModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} initialData={editingBill} />

      {/* Linked Expense Details Modal */}
      <AnimatedModal
        isOpen={Boolean(selectedLinkedExpense)}
        onClose={() => setSelectedLinkedExpense(null)}
        maxWidth="max-w-md"
      >
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden transition-colors duration-200">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-emerald-50 to-white dark:from-emerald-900/20 dark:to-slate-900">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Linked Expense Record</h3>
                <p className="text-[10px] text-slate-400 dark:text-slate-500">Created automatically when bill was marked paid</p>
              </div>
            </div>
            <button
              onClick={() => setSelectedLinkedExpense(null)}
              className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-6 space-y-4 text-xs">
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 space-y-3 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 dark:text-slate-500 font-medium">Bill Name</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{selectedLinkedExpense?.bill.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 dark:text-slate-500 font-medium">Amount Paid</span>
                <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">
                  {formatCurrency(selectedLinkedExpense?.bill.amount || 0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 dark:text-slate-500 font-medium">Category</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  📋 {selectedLinkedExpense?.expense?.category || selectedLinkedExpense?.bill.category || 'Bills'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 dark:text-slate-500 font-medium">Payment Method</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  💳 {selectedLinkedExpense?.expense?.payment_method || 'Bank Transfer'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 dark:text-slate-500 font-medium">Date Logged</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {selectedLinkedExpense?.expense?.date ? formatDate(selectedLinkedExpense.expense.date) : 'Recently'}
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedLinkedExpense(null)}
                className="btn-secondary text-xs py-2"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </AnimatedModal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Delete Bill"
        message="Are you sure you want to remove this recurring bill? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={async () => {
          if (deleteTarget) {
            await deleteBill(deleteTarget);
            setDeleteTarget(null);
          }
        }}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
};
