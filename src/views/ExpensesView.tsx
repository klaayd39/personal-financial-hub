import React, { useState, useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import type { ExpenseRecord, PaymentMethod } from '../types/finance';
import { formatCurrency, formatDate, MONTH_NAMES } from '../utils/formatters';
import { ConfirmModal } from '../components/ConfirmModal';
import { Plus, Search, Edit2, Trash2, CreditCard, X, ImageIcon, Calendar, Download } from 'lucide-react';

interface ExpensesViewProps {
  onOpenAddModal: () => void;
  onEditExpense: (record: ExpenseRecord) => void;
}

const PAYMENT_METHODS: (PaymentMethod | 'All')[] = [
  'All', 'Credit Card', 'Debit Card', 'Bank Transfer', 'E-Wallet', 'Cash',
];

export const ExpensesView: React.FC<ExpensesViewProps> = ({ onOpenAddModal, onEditExpense }) => {
  const { expenses, deleteExpense, filter, setFilter, salaries } = useFinance();
  const selectedMonth = filter.month === -1 ? new Date().getMonth() : filter.month;
  const selectedYear = filter.year;
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [previewReceipt, setPreviewReceipt] = useState<string | null>(null);

  // Salary for the selected month/year
  const selectedMonthSalary = filter.month !== -1
    ? salaries.find((s) => s.month === filter.month && s.year === filter.year)?.amount ?? 0
    : salaries.filter((s) => s.year === filter.year).reduce((sum, s) => sum + s.amount, 0);

  const handleSelectMonth = (monthIndex: number) => {
    setFilter((p) => ({ ...p, month: monthIndex }));
  };

  const handleSelectYear = (year: number) => {
    setFilter((p) => ({ ...p, year }));
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

  // Filtered expenses specifically for the selected month tab & filters
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
          exp.payment_method.toLowerCase().includes(filter.searchQuery.toLowerCase());

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

  // Export monthly expenses as CSV file
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

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    const monthLabel = selectedMonth === -1 ? 'All-Months' : MONTH_NAMES[selectedMonth];
    link.setAttribute('download', `Expenses_${monthLabel}_${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header with year picker & actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Monthly Expense Categorization</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {monthlyFilteredExpenses.length} transactions for {selectedMonth === -1 ? 'all months' : MONTH_NAMES[selectedMonth]} {selectedYear}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-xl">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedYear}
              onChange={(e) => handleSelectYear(parseInt(e.target.value))}
              className="bg-transparent text-slate-700 text-xs font-semibold focus:outline-none cursor-pointer"
            >
              {[2024, 2025, 2026, 2027, 2028].map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <button
            onClick={handleExportCSV}
            disabled={monthlyFilteredExpenses.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors disabled:opacity-40"
            title="Export to CSV"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
          <button
            onClick={onOpenAddModal}
            className="btn-primary gap-1.5 text-xs py-2"
          >
            <Plus className="w-3.5 h-3.5" /> Add Expense
          </button>
        </div>
      </div>

      {/* Salary vs Expenses Summary Cards Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm/50">
          <span className="text-xs text-slate-400 font-medium">
            {selectedMonth === -1 ? 'Annual Salary' : `${MONTH_NAMES[selectedMonth]} Salary`}
          </span>
          <p className="text-lg font-bold text-indigo-600 tracking-tight mt-1">
            {formatCurrency(selectedMonthSalary)}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm/50">
          <span className="text-xs text-slate-400 font-medium">Total Expenses</span>
          <p className="text-lg font-bold text-rose-500 tracking-tight mt-1">
            {formatCurrency(selectedMonthTotal)}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm/50">
          <span className="text-xs text-slate-400 font-medium">Remaining Balance</span>
          <p className={`text-lg font-bold tracking-tight mt-1 ${selectedMonthSalary - selectedMonthTotal >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {formatCurrency(selectedMonthSalary - selectedMonthTotal)}
          </p>
        </div>
      </div>

      {/* Month Selector Tabs (Grid of 12 Months) */}
      <div className="bg-white rounded-2xl p-3 border border-slate-100 shadow-sm/50">
        <div className="flex items-center justify-between px-2 mb-2">
          <span className="text-xs font-semibold text-slate-700">Select Month</span>
          <button
            onClick={() => handleSelectMonth(-1)}
            className={`text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors ${
              filter.month === -1 ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            All Months
          </button>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
          {monthlyStats.map((st) => {
            const isSelected = filter.month === st.monthIndex;
            return (
              <button
                key={st.monthIndex}
                onClick={() => handleSelectMonth(st.monthIndex)}
                className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-500/20 shadow-sm'
                    : 'bg-slate-50/50 border-slate-100 hover:bg-slate-100/70 hover:border-slate-200'
                }`}
              >
                <span className={`text-xs font-bold ${isSelected ? 'text-blue-700' : 'text-slate-800'}`}>
                  {st.monthName}
                </span>
                <span className="text-[10px] text-slate-400 mt-1 font-medium">
                  {st.count} record{st.count !== 1 ? 's' : ''}
                </span>
                <span className={`text-xs font-semibold mt-1 ${st.total > 0 ? 'text-rose-600' : 'text-slate-300'}`}>
                  {formatCurrency(st.total)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Toolbar (Search & Dropdowns) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
        <div className="relative flex-1 min-w-0">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search expenses..."
            value={filter.searchQuery}
            onChange={(e) => setFilter((p) => ({ ...p, searchQuery: e.target.value }))}
            className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            value={filter.paymentMethod}
            onChange={(e) => setFilter((p) => ({ ...p, paymentMethod: e.target.value as any }))}
            className="bg-white border border-slate-200 text-slate-700 text-xs font-medium rounded-xl px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all cursor-pointer"
          >
            {PAYMENT_METHODS.map((pm) => <option key={pm} value={pm}>{pm}</option>)}
          </select>
          <select
            value={filter.sortBy}
            onChange={(e) => setFilter((p) => ({ ...p, sortBy: e.target.value as any }))}
            className="bg-white border border-slate-200 text-slate-700 text-xs font-medium rounded-xl px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all cursor-pointer"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="highest">Highest</option>
            <option value="lowest">Lowest</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="glass-panel overflow-hidden rounded-2xl">
        {monthlyFilteredExpenses.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider py-3 px-5">Date</th>
                  <th className="text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider py-3 px-5">Description</th>
                  <th className="text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider py-3 px-5">Method</th>
                  <th className="text-right text-[10px] font-semibold text-slate-400 uppercase tracking-wider py-3 px-5">Amount</th>
                  <th className="py-3 px-5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {monthlyFilteredExpenses.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="py-4 px-5 text-xs text-slate-500 whitespace-nowrap group-hover:text-slate-900 transition-colors">{formatDate(rec.date)}</td>
                    <td className="py-3 px-5 text-xs font-medium text-slate-800 max-w-xs truncate">{rec.description}</td>
                    <td className="py-3 px-5 text-xs text-slate-400 whitespace-nowrap">{rec.payment_method}</td>
                    <td className="py-3 px-5 text-right text-xs font-semibold text-slate-800 whitespace-nowrap">
                      -{formatCurrency(rec.amount)}
                    </td>
                    <td className="py-3 px-5 whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        {rec.receipt_url && (
                          <button onClick={() => setPreviewReceipt(rec.receipt_url!)} className="p-1.5 text-slate-300 hover:text-brand-500 rounded-md hover:bg-slate-100 transition-colors" title="View Receipt">
                            <ImageIcon className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button onClick={() => onEditExpense(rec)} className="p-1.5 text-slate-300 hover:text-slate-600 rounded-md hover:bg-slate-100 transition-colors" title="Edit Expense">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setDeleteTarget(rec.id)} className="p-1.5 text-slate-300 hover:text-rose-500 rounded-md hover:bg-rose-50 transition-colors" title="Delete Expense">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center">
            <CreditCard className="w-8 h-8 mx-auto text-slate-200 mb-3" />
            <p className="text-sm font-medium text-slate-600">No expense records found</p>
            <p className="text-xs text-slate-400 mt-1 mb-4">No expenses recorded for {selectedMonth === -1 ? 'this period' : MONTH_NAMES[selectedMonth]}.</p>
            <button
              onClick={onOpenAddModal}
              className="btn-primary text-xs py-2 mx-auto"
            >
              <Plus className="w-3.5 h-3.5" /> Add First Expense
            </button>
          </div>
        )}
      </div>

      {/* Receipt lightbox */}
      {previewReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-4 max-w-lg w-full relative shadow-2xl">
            <button onClick={() => setPreviewReceipt(null)} className="absolute top-3 right-3 p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition-colors">
              <X className="w-4 h-4" />
            </button>
            <p className="text-sm font-semibold text-slate-800 mb-3">Receipt</p>
            <div className="rounded-xl overflow-hidden bg-slate-100 max-h-[70vh]">
              <img src={previewReceipt} alt="Receipt" className="w-full h-full object-contain" />
            </div>
          </div>
        </div>
      )}

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
