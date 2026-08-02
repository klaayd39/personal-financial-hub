import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFinance } from '../context/FinanceContext';
import type { ExpenseRecord, PaymentMethod } from '../types/finance';
import { formatCurrency, formatDate, MONTH_NAMES } from '../utils/formatters';
import { ConfirmModal } from '../components/ConfirmModal';
import { CustomDropdown } from '../components/CustomDropdown';
import {
  Plus, Search, Edit2, Trash2, CreditCard, X, ImageIcon, Download,
} from 'lucide-react';

interface ExpensesViewProps {
  onOpenAddModal: () => void;
  onEditExpense: (record: ExpenseRecord) => void;
}

const PAYMENT_METHODS: (PaymentMethod | 'All')[] = [
  'All', 'Credit Card', 'Debit Card', 'Bank Transfer', 'E-Wallet', 'Cash',
];

const CATEGORY_EMOJI: Record<string, string> = {
  Food: '🍽️', Transportation: '🚗', Bills: '📋', Shopping: '🛒',
  Entertainment: '🎬', Health: '🏥', Education: '📚', Travel: '✈️', Miscellaneous: '📦',
};

export const ExpensesView: React.FC<ExpensesViewProps> = ({ onOpenAddModal, onEditExpense }) => {
  const { expenses, deleteExpense, filter, setFilter, salaries } = useFinance();
  const selectedMonth = filter.month === -1 ? new Date().getMonth() : filter.month;
  const selectedYear = filter.year;
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [previewReceipt, setPreviewReceipt] = useState<string | null>(null);

  // Salary for the selected month/year
  const selectedMonthSalary =
    filter.month !== -1
      ? salaries.find((s) => s.month === filter.month && s.year === filter.year)?.amount ?? 0
      : salaries.filter((s) => s.year === filter.year).reduce((sum, s) => sum + s.amount, 0);

  const handleSelectMonth = (monthIndex: number) => {
    setFilter((p) => ({ ...p, month: monthIndex }));
  };

  // Group all expenses by Month (0 - 11) for the selected Year
  const monthlyStats = useMemo(() => {
    const stats = Array.from({ length: 12 }, (_, i) => ({
      monthIndex: i,
      monthName: MONTH_NAMES[i],
      count: 0,
      total: 0,
    }));

    expenses.forEach((exp) => {
      const d = new Date(exp.date + 'T00:00:00');
      if (d.getFullYear() === selectedYear) {
        const month = d.getMonth();
        stats[month].count += 1;
        stats[month].total += exp.amount;
      }
    });

    return stats;
  }, [expenses, selectedYear]);

  // Filtered expenses for the selected month tab & filters
  const monthlyFilteredExpenses = useMemo(() => {
    return expenses
      .filter((exp) => {
        const d = new Date(exp.date + 'T00:00:00');
        const matchMonth = selectedMonth === -1 || d.getMonth() === selectedMonth;
        const matchYear = d.getFullYear() === selectedYear;
        const matchPayment = filter.paymentMethod === 'All' || exp.payment_method === filter.paymentMethod;
        const matchSearch =
          !filter.searchQuery ||
          exp.description.toLowerCase().includes(filter.searchQuery.toLowerCase()) ||
          exp.payment_method.toLowerCase().includes(filter.searchQuery.toLowerCase()) ||
          exp.category.toLowerCase().includes(filter.searchQuery.toLowerCase());

        return matchMonth && matchYear && matchPayment && matchSearch;
      })
      .sort((a, b) => {
        if (filter.sortBy === 'newest') return new Date(b.date).getTime() - new Date(a.date).getTime();
        if (filter.sortBy === 'oldest') return new Date(a.date).getTime() - new Date(b.date).getTime();
        if (filter.sortBy === 'highest') return b.amount - a.amount;
        if (filter.sortBy === 'lowest') return a.amount - b.amount;
        return 0;
      });
  }, [expenses, selectedMonth, selectedYear, filter]);

  const selectedMonthTotal = useMemo(() => {
    return monthlyFilteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  }, [monthlyFilteredExpenses]);

  const handleExportCSV = () => {
    if (monthlyFilteredExpenses.length === 0) return;
    const headers = ['Date', 'Description', 'Category', 'Payment Method', 'Amount (PHP)'];
    const rows = monthlyFilteredExpenses.map((e) => [
      e.date,
      `"${e.description.replace(/"/g, '""')}"`,
      `"${e.category}"`,
      `"${e.payment_method}"`,
      e.amount.toFixed(2),
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    const monthLabel = selectedMonth === -1 ? 'All-Months' : MONTH_NAMES[selectedMonth];
    link.setAttribute('download', `Expenses_${monthLabel}_${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const remainingBalance = selectedMonthSalary - selectedMonthTotal;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-white">Monthly Expense Categorization</h1>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
            {monthlyFilteredExpenses.length} transaction
            {monthlyFilteredExpenses.length !== 1 ? 's' : ''} for{' '}
            {selectedMonth === -1 ? 'all months' : MONTH_NAMES[selectedMonth]} {selectedYear}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={handleExportCSV}
            disabled={monthlyFilteredExpenses.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl transition-colors disabled:opacity-40"
            title="Export to CSV"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onOpenAddModal}
            className="btn-primary gap-1.5 text-xs py-2"
          >
            <Plus className="w-3.5 h-3.5" /> Add Expense
          </motion.button>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          {
            label: selectedMonth === -1 ? 'Annual Salary' : `${MONTH_NAMES[selectedMonth]} Salary`,
            value: selectedMonthSalary,
            color: 'text-indigo-600',
          },
          { label: 'Total Expenses', value: selectedMonthTotal, color: 'text-rose-500' },
          {
            label: 'Remaining Balance',
            value: remainingBalance,
            color: remainingBalance >= 0 ? 'text-emerald-600' : 'text-rose-600',
          },
        ].map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07, duration: 0.3 }}
            className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-sm hover-lift transition-colors duration-200"
          >
            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">{card.label}</span>
            <p className={`text-lg font-bold ${card.color} tracking-tight mt-1`}>
              {formatCurrency(card.value)}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Month Selector Tabs */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.3 }}
        className="bg-white dark:bg-slate-900 rounded-2xl p-3 border border-slate-100 dark:border-slate-800 shadow-sm transition-colors duration-200"
      >
        <div className="flex items-center justify-between px-2 mb-2">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Select Month</span>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => handleSelectMonth(-1)}
            className={`text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors ${
              filter.month === -1 ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            All Months
          </motion.button>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
          {monthlyStats.map((st) => {
            const isSelected = filter.month === st.monthIndex;
            return (
              <motion.button
                key={st.monthIndex}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleSelectMonth(st.monthIndex)}
                className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/50 ring-2 ring-blue-500/20 shadow-sm'
                    : 'bg-slate-50/50 dark:bg-slate-800/30 border-slate-100 dark:border-slate-800 hover:bg-slate-100/70 dark:hover:bg-slate-800/70 hover:border-slate-200 dark:hover:border-slate-700'
                }`}
                aria-pressed={isSelected}
                aria-label={`Select ${st.monthName}`}
              >
                <span className={`text-xs font-bold ${isSelected ? 'text-blue-700 dark:text-blue-400' : 'text-slate-800 dark:text-slate-200'}`}>
                  {st.monthName}
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-medium">
                  {st.count} record{st.count !== 1 ? 's' : ''}
                </span>
                <span className={`text-xs font-semibold mt-1 ${st.total > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-300 dark:text-slate-600'}`}>
                  {formatCurrency(st.total)}
                </span>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
        <div className="relative flex-1 min-w-0">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Search expenses by description, category, or payment method…"
            value={filter.searchQuery}
            onChange={(e) => setFilter((p) => ({ ...p, searchQuery: e.target.value }))}
            className="w-full pl-8 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            aria-label="Search expenses"
          />
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 z-10">
          <CustomDropdown
            options={PAYMENT_METHODS.map(pm => ({ value: pm, label: pm }))}
            value={filter.paymentMethod}
            onChange={(val) => setFilter((p) => ({ ...p, paymentMethod: val as any }))}
            className="w-full sm:w-40"
            ariaLabel="Filter by payment method"
          />
          <CustomDropdown
            options={[
              { value: 'newest', label: 'Newest First' },
              { value: 'oldest', label: 'Oldest First' },
              { value: 'highest', label: 'Highest Amount' },
              { value: 'lowest', label: 'Lowest Amount' }
            ]}
            value={filter.sortBy}
            onChange={(val) => setFilter((p) => ({ ...p, sortBy: val as any }))}
            className="w-full sm:w-40"
            ariaLabel="Sort expenses"
          />
        </div>
      </div>

      {/* Expense Table */}
      <div className="glass-panel overflow-hidden rounded-2xl">
        {monthlyFilteredExpenses.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm" role="table">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <th className="text-left text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider py-3 px-5">Date</th>
                  <th className="text-left text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider py-3 px-5">Description</th>
                  <th className="text-left text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider py-3 px-5 hidden sm:table-cell">Category</th>
                  <th className="text-left text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider py-3 px-5 hidden md:table-cell">Method</th>
                  <th className="text-right text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider py-3 px-5">Amount</th>
                  <th className="py-3 px-5" aria-label="Actions" />
                </tr>
              </thead>
              <AnimatePresence mode="popLayout">
                <motion.tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                  {monthlyFilteredExpenses.map((rec, i) => (
                    <motion.tr
                      key={rec.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: i * 0.03, duration: 0.2 }}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group"
                    >
                      <td className="py-4 px-5 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors">
                        {formatDate(rec.date, rec.time)}
                      </td>
                      <td className="py-3 px-5 text-xs font-medium text-slate-800 dark:text-slate-200 max-w-[200px] truncate">
                        {rec.description}
                      </td>
                      <td className="py-3 px-5 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap hidden sm:table-cell">
                        <span className="inline-flex items-center gap-1">
                          <span>{CATEGORY_EMOJI[rec.category] || '📦'}</span>
                          <span>{rec.category}</span>
                        </span>
                      </td>
                      <td className="py-3 px-5 text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap hidden md:table-cell">
                        {rec.payment_method}
                      </td>
                      <td className="py-3 px-5 text-right text-xs font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                        -{formatCurrency(rec.amount)}
                      </td>
                      <td className="py-3 px-5 whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          {rec.receipt_url && (
                            <motion.button
                              whileTap={{ scale: 0.9 }}
                              onClick={() => setPreviewReceipt(rec.receipt_url!)}
                              className="p-1.5 text-slate-300 dark:text-slate-600 hover:text-blue-500 dark:hover:text-blue-400 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                              title="View Receipt"
                              aria-label="View receipt"
                            >
                              <ImageIcon className="w-3.5 h-3.5" />
                            </motion.button>
                          )}
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => onEditExpense(rec)}
                            className="p-1.5 text-slate-300 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-300 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Edit Expense"
                            aria-label={`Edit ${rec.description}`}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </motion.button>
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setDeleteTarget(rec.id)}
                            className="p-1.5 text-slate-300 dark:text-slate-600 hover:text-rose-500 dark:hover:text-rose-400 rounded-md hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                            title="Delete Expense"
                            aria-label={`Delete ${rec.description}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </motion.tbody>
              </AnimatePresence>
            </table>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-16 text-center"
          >
            <CreditCard className="w-10 h-10 mx-auto text-slate-200 dark:text-slate-700 mb-3" />
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">No expense records found</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 mb-5">
              {filter.searchQuery
                ? `No results for "${filter.searchQuery}"`
                : `No expenses recorded for ${selectedMonth === -1 ? 'this period' : MONTH_NAMES[selectedMonth]}.`}
            </p>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={onOpenAddModal}
              className="btn-primary text-xs py-2 mx-auto"
            >
              <Plus className="w-3.5 h-3.5" /> Add First Expense
            </motion.button>
          </motion.div>
        )}
      </div>

      {/* Receipt Lightbox */}
      <AnimatePresence>
        {previewReceipt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setPreviewReceipt(null)}
            role="dialog"
            aria-label="Receipt preview"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="bg-white dark:bg-slate-900 rounded-2xl p-4 max-w-lg w-full relative shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setPreviewReceipt(null)}
                className="absolute top-3 right-3 p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full transition-colors"
                aria-label="Close receipt preview"
              >
                <X className="w-4 h-4" />
              </button>
              <p className="text-sm font-semibold text-slate-800 dark:text-white mb-3">Receipt</p>
              <div className="rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 max-h-[70vh]">
                <img src={previewReceipt} alt="Receipt" className="w-full h-full object-contain" />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Delete expense record?"
        message="This will permanently remove this expense entry. This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={() => { if (deleteTarget) deleteExpense(deleteTarget); }}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
};
