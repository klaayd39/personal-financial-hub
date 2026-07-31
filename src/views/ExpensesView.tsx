import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import type { ExpenseRecord, ExpenseCategory, PaymentMethod } from '../types/finance';
import { formatCurrency, formatDate } from '../utils/formatters';
import { ConfirmModal } from '../components/ConfirmModal';
import { Plus, Search, Edit2, Trash2, CreditCard, X, ImageIcon } from 'lucide-react';

interface ExpensesViewProps {
  onOpenAddModal: () => void;
  onEditExpense: (record: ExpenseRecord) => void;
}

const CATEGORIES: (ExpenseCategory | 'All')[] = [
  'All', 'Food', 'Transportation', 'Bills', 'Shopping',
  'Entertainment', 'Health', 'Education', 'Travel', 'Miscellaneous',
];

const PAYMENT_METHODS: (PaymentMethod | 'All')[] = [
  'All', 'Credit Card', 'Debit Card', 'Bank Transfer', 'E-Wallet', 'Cash',
];

export const ExpensesView: React.FC<ExpensesViewProps> = ({ onOpenAddModal, onEditExpense }) => {
  const { filteredExpenses, deleteExpense, filter, setFilter, summary } = useFinance();
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [previewReceipt, setPreviewReceipt] = useState<string | null>(null);

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Expenses</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {filteredExpenses.length} records · Total{' '}
            <span className="font-semibold text-rose-500">{formatCurrency(summary.totalExpenses)}</span>
          </p>
        </div>
        <button
          onClick={onOpenAddModal}
          className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-700 text-white text-xs font-medium rounded-lg transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> Add Expense
        </button>
      </div>

      {/* Category pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter((p) => ({ ...p, category: cat }))}
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              filter.category === cat
                ? 'bg-slate-900 text-white'
                : 'bg-white border border-slate-200 text-slate-500 hover:border-slate-400'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
        <div className="relative flex-1 min-w-0">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search..."
            value={filter.searchQuery}
            onChange={(e) => setFilter((p) => ({ ...p, searchQuery: e.target.value }))}
            className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            value={filter.paymentMethod}
            onChange={(e) => setFilter((p) => ({ ...p, paymentMethod: e.target.value as any }))}
            className="bg-white border border-slate-200 text-slate-700 text-xs rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all cursor-pointer"
          >
            {PAYMENT_METHODS.map((pm) => <option key={pm} value={pm}>{pm}</option>)}
          </select>
          <select
            value={filter.sortBy}
            onChange={(e) => setFilter((p) => ({ ...p, sortBy: e.target.value as any }))}
            className="bg-white border border-slate-200 text-slate-700 text-xs rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all cursor-pointer"
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
        {filteredExpenses.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider py-3 px-5">Date</th>
                  <th className="text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider py-3 px-5">Description</th>
                  <th className="text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider py-3 px-5">Category</th>
                  <th className="text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider py-3 px-5">Method</th>
                  <th className="text-right text-[10px] font-semibold text-slate-400 uppercase tracking-wider py-3 px-5">Amount</th>
                  <th className="py-3 px-5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredExpenses.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="py-4 px-5 text-xs text-slate-500 whitespace-nowrap group-hover:text-slate-900 transition-colors">{formatDate(rec.date)}</td>
                    <td className="py-3 px-5 text-xs font-medium text-slate-800 max-w-xs truncate">{rec.description}</td>
                    <td className="py-3 px-5 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs font-medium">
                        {rec.category}
                      </span>
                    </td>
                    <td className="py-3 px-5 text-xs text-slate-400 whitespace-nowrap">{rec.payment_method}</td>
                    <td className="py-3 px-5 text-right text-xs font-semibold text-slate-800 whitespace-nowrap">
                      -{formatCurrency(rec.amount)}
                    </td>
                    <td className="py-3 px-5 whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        {rec.receipt_url && (
                          <button onClick={() => setPreviewReceipt(rec.receipt_url!)} className="p-1.5 text-slate-300 hover:text-brand-500 rounded-md hover:bg-slate-100 transition-colors">
                            <ImageIcon className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button onClick={() => onEditExpense(rec)} className="p-1.5 text-slate-300 hover:text-slate-600 rounded-md hover:bg-slate-100 transition-colors">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setDeleteTarget(rec.id)} className="p-1.5 text-slate-300 hover:text-rose-500 rounded-md hover:bg-rose-50 transition-colors">
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
            <p className="text-sm font-medium text-slate-600">No expense records</p>
            <p className="text-xs text-slate-400 mt-1">Add your first expense to get started.</p>
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
