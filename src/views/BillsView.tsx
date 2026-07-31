import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useFinance } from '../context/FinanceContext';
import type { BillRecord, ExpenseRecord } from '../types/finance';
import { formatCurrency, formatDate } from '../utils/formatters';
import { ConfirmModal } from '../components/ConfirmModal';
import { AnimatedModal } from '../components/AnimatedModal';
import { AnimatedList, AnimatedListItem } from '../components/AnimatedComponents';
import {
  Plus, Edit2, Trash2, X, CheckCircle2, Circle,
  Calendar, AlertTriangle, Receipt, Zap, ExternalLink,
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
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
              <Receipt className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900">
              {initialData ? 'Edit Bill' : 'Add New Bill'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
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
                className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2"
                role="alert"
              >
                <AlertTriangle className="w-4 h-4 shrink-0" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bill Name */}
          <motion.div custom={0} variants={fieldVariants} initial="hidden" animate="visible">
            <label htmlFor="bill-name" className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
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

          {/* Amount & Due Day */}
          <motion.div custom={1} variants={fieldVariants} initial="hidden" animate="visible" className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="bill-amount" className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                Amount (₱) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs pointer-events-none select-none">₱</span>
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
              <label htmlFor="bill-due" className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
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
          <motion.div custom={2} variants={fieldVariants} initial="hidden" animate="visible" className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="bill-month" className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
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
              <label htmlFor="bill-year" className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
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
          <motion.div custom={3} variants={fieldVariants} initial="hidden" animate="visible">
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
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
                      ? 'bg-blue-50 border-blue-300 text-blue-700 ring-2 ring-blue-500/20'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                  aria-pressed={billingCycle === cycle}
                >
                  {cycle}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Notes */}
          <motion.div custom={4} variants={fieldVariants} initial="hidden" animate="visible">
            <label htmlFor="bill-notes" className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
              Notes <span className="font-normal text-slate-400">(Optional)</span>
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
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
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
  const [selectedLinkedExpense, setSelectedLinkedExpense] = useState<{
    bill: BillRecord;
    expense?: ExpenseRecord;
  } | null>(null);

  const todayDay = new Date().getDate();

  const totalMonthlyBills = bills.reduce((sum, b) => sum + b.amount, 0);
  const paidTotal = bills.filter((b) => b.is_paid).reduce((sum, b) => sum + b.amount, 0);
  const unpaidTotal = totalMonthlyBills - paidTotal;

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

  const summaryCards = [
    {
      label: 'Total Monthly Bills',
      value: totalMonthlyBills,
      color: 'text-slate-900',
      sub: `${bills.length} recurring item${bills.length !== 1 ? 's' : ''}`,
      icon: <Receipt className="w-4 h-4" />,
      bg: 'bg-slate-50',
      iconColor: 'text-slate-500',
    },
    {
      label: 'Total Paid',
      value: paidTotal,
      color: 'text-emerald-600',
      progress: bills.length > 0 ? (paidTotal / totalMonthlyBills) * 100 : 0,
      sub: `${bills.filter((b) => b.is_paid).length} paid`,
      icon: <CheckCircle2 className="w-4 h-4" />,
      bg: 'bg-emerald-50',
      iconColor: 'text-emerald-500',
    },
    {
      label: 'Unpaid Remaining',
      value: unpaidTotal,
      color: 'text-rose-600',
      sub: `${bills.filter((b) => !b.is_paid).length} pending`,
      icon: <Zap className="w-4 h-4" />,
      bg: 'bg-rose-50',
      iconColor: 'text-rose-500',
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
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Fixed &amp; Recurring Bills</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Track monthly subscriptions, utilities, and scheduled payments.
          </p>
        </div>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleOpenAdd}
          className="btn-primary gap-1.5 self-start sm:self-auto text-xs py-2"
        >
          <Plus className="w-4 h-4" />
          Add Bill
        </motion.button>
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
              <span className="text-xs text-slate-400 font-medium">{card.label}</span>
              <span className={`${card.iconColor} ${card.bg} p-1.5 rounded-lg`}>{card.icon}</span>
            </div>
            <p className={`text-2xl font-extrabold ${card.color} tracking-tight mt-1`}>
              {formatCurrency(card.value)}
            </p>
            {'progress' in card && card.progress !== undefined && (
              <div className="mt-3">
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-emerald-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${card.progress}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' as const, delay: 0.3 }}
                  />
                </div>
                <span className="text-[10px] text-emerald-600 font-medium mt-1 block">
                  {card.progress.toFixed(0)}% paid
                </span>
              </div>
            )}
            <span className="text-[10px] text-slate-400 mt-1 block">{card.sub}</span>
          </motion.div>
        ))}
      </div>

      {/* Bills List */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.3 }}
        className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
      >
        {bills.length > 0 ? (
          <AnimatedList className="divide-y divide-slate-100">
            {bills.map((bill) => {
              const isDueSoon = !bill.is_paid && bill.due_day >= todayDay && bill.due_day <= todayDay + 5;
              const isPastDue = !bill.is_paid && bill.due_day < todayDay;
              const isToggling = togglingId === bill.id;

              return (
                <AnimatedListItem
                  key={bill.id}
                  className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors border-l-4 ${
                    bill.is_paid
                      ? 'bg-emerald-50/30 border-l-emerald-400'
                      : isPastDue
                      ? 'bg-rose-50/30 border-l-rose-400'
                      : isDueSoon
                      ? 'bg-amber-50/30 border-l-amber-400'
                      : 'hover:bg-slate-50/70 border-l-blue-300'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <motion.button
                      onClick={() => handleTogglePaid(bill.id)}
                      disabled={isToggling}
                      whileTap={{ scale: 0.8 }}
                      animate={isToggling ? { rotate: 360 } : {}}
                      transition={isToggling ? { duration: 0.5, repeat: Infinity, ease: 'linear' } : {}}
                      className={`p-1 rounded-full transition-colors shrink-0 ${
                        bill.is_paid
                          ? 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'
                          : 'text-slate-300 hover:text-emerald-600 hover:bg-emerald-50'
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
                        <h4
                          className={`text-sm font-semibold truncate ${
                            bill.is_paid ? 'line-through text-slate-400' : 'text-slate-800'
                          }`}
                        >
                          {bill.name}
                        </h4>
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                          {bill.month !== undefined && bill.month !== null
                            ? `${MONTH_NAMES[bill.month]} ${bill.year || ''}`
                            : 'Every Month'}
                        </span>
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                          Due day {bill.due_day}
                        </span>
                        {isPastDue && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                            Past Due
                          </span>
                        )}
                        {isDueSoon && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                            Due Soon
                          </span>
                        )}
                        {bill.is_paid && bill.bill_expense_id && (
                          <button
                            type="button"
                            onClick={() => {
                              const linkedExp = expenses.find((e) => e.id === bill.bill_expense_id);
                              setSelectedLinkedExpense({ bill, expense: linkedExp });
                            }}
                            className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 hover:bg-emerald-200 transition-colors flex items-center gap-1 cursor-pointer"
                            title="View Linked Expense Record"
                          >
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            View Linked Expense
                          </button>
                        )}
                      </div>
                      {bill.notes && <p className="text-xs text-slate-400 mt-0.5">{bill.notes}</p>}
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                    <p className={`text-sm font-bold ${bill.is_paid ? 'text-slate-400' : 'text-slate-900'}`}>
                      {formatCurrency(bill.amount)}
                    </p>
                    <div className="flex items-center gap-1">
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleEdit(bill)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Edit Bill"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setDeleteTarget(bill.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
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
            <Calendar className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-600">No recurring bills added yet</p>
            <p className="text-xs text-slate-400 mt-1 mb-5">
              Keep track of your monthly subscriptions, utilities, and scheduled payments.
            </p>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleOpenAdd}
              className="btn-primary text-xs py-2"
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
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-emerald-50 to-white">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl">
                <Receipt className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Linked Expense Details</h3>
                <p className="text-xs text-slate-400">Bill: {selectedLinkedExpense?.bill.name}</p>
              </div>
            </div>
            <button
              onClick={() => setSelectedLinkedExpense(null)}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-6 space-y-4 text-xs">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Bill Reference ID:</span>
                <span className="font-mono text-xs font-semibold text-slate-800">{selectedLinkedExpense?.bill.id}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Expense Record ID:</span>
                <span className="font-mono text-xs font-semibold text-blue-600">{selectedLinkedExpense?.bill.bill_expense_id}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block mb-0.5 text-[10px] uppercase font-bold tracking-wider">Amount</span>
                <span className="text-base font-bold text-slate-900">
                  {formatCurrency(selectedLinkedExpense?.expense?.amount || selectedLinkedExpense?.bill.amount || 0)}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block mb-0.5 text-[10px] uppercase font-bold tracking-wider">Payment Date</span>
                <span className="text-sm font-semibold text-slate-800">
                  {selectedLinkedExpense?.expense?.date ? formatDate(selectedLinkedExpense.expense.date) : 'Today'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block mb-0.5 text-[10px] uppercase font-bold tracking-wider">Category</span>
                <span className="text-xs font-semibold text-slate-800">
                  📋 {selectedLinkedExpense?.expense?.category || 'Bills'}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block mb-0.5 text-[10px] uppercase font-bold tracking-wider">Payment Method</span>
                <span className="text-xs font-semibold text-slate-800">
                  {selectedLinkedExpense?.expense?.payment_method || 'Bank Transfer'}
                </span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-400 block mb-0.5 text-[10px] uppercase font-bold tracking-wider">Notes & Description</span>
              <p className="font-medium text-slate-800">
                {selectedLinkedExpense?.expense?.description || `Bill Payment: ${selectedLinkedExpense?.bill.name}`}
              </p>
              {selectedLinkedExpense?.expense?.notes && (
                <p className="text-slate-500 text-[11px] mt-1 border-t border-slate-200/60 pt-1">
                  {selectedLinkedExpense.expense.notes}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between px-6 py-3 border-t border-slate-100 bg-slate-50/50">
            <Link
              to="/expenses"
              onClick={() => setSelectedLinkedExpense(null)}
              className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-semibold"
            >
              View in Expenses Page <ExternalLink className="w-3 h-3" />
            </Link>
            <button
              type="button"
              onClick={() => setSelectedLinkedExpense(null)}
              className="btn-secondary py-1.5 text-xs px-4"
            >
              Close
            </button>
          </div>
        </div>
      </AnimatedModal>

      {/* Delete Confirmation */}
      {deleteTarget && (
        <ConfirmModal
          isOpen={true}
          title="Delete Recurring Bill"
          message="Are you sure you want to delete this bill? If it was marked as paid, the deducted amount will be restored to your salary balance."
          confirmLabel="Delete"
          onConfirm={async () => {
            await deleteBill(deleteTarget);
            setDeleteTarget(null);
          }}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};
