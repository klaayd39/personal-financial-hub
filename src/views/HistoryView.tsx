import React, { useState, useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import type { IncomeRecord, ExpenseRecord } from '../types/finance';
import { formatCurrency, formatDate } from '../utils/formatters';
import { ConfirmModal } from '../components/ConfirmModal';
import { TrendingUp, TrendingDown, Search, Edit2, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

interface HistoryViewProps {
  onEditIncome: (record: IncomeRecord) => void;
  onEditExpense: (record: ExpenseRecord) => void;
}

const ITEMS_PER_PAGE = 10;

export const HistoryView: React.FC<HistoryViewProps> = ({ onEditIncome, onEditExpense }) => {
  const { filteredIncomes, filteredExpenses, deleteIncome, deleteExpense, filter, setFilter } = useFinance();
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; type: 'income' | 'expense' } | null>(null);

  const allTransactions = useMemo(() => {
    const combined = [
      ...filteredIncomes.map((inc) => ({
        id: inc.id, type: 'income' as const,
        title: inc.source, sub: inc.notes || '—',
        amount: inc.amount, date: inc.date,
        original: inc,
      })),
      ...filteredExpenses.map((exp) => ({
        id: exp.id, type: 'expense' as const,
        title: exp.description, sub: exp.category,
        amount: exp.amount, date: exp.date,
        original: exp,
      })),
    ].filter((tx) => {
      if (filter.transactionType === 'income') return tx.type === 'income';
      if (filter.transactionType === 'expense') return tx.type === 'expense';
      return true;
    });

    return combined.sort((a, b) => {
      if (filter.sortBy === 'newest') return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (filter.sortBy === 'oldest') return new Date(a.date).getTime() - new Date(b.date).getTime();
      if (filter.sortBy === 'highest') return b.amount - a.amount;
      if (filter.sortBy === 'lowest') return a.amount - b.amount;
      return 0;
    });
  }, [filteredIncomes, filteredExpenses, filter]);

  const totalPages = Math.max(1, Math.ceil(allTransactions.length / ITEMS_PER_PAGE));
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return allTransactions.slice(start, start + ITEMS_PER_PAGE);
  }, [allTransactions, currentPage]);

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === 'income') await deleteIncome(deleteTarget.id);
    else await deleteExpense(deleteTarget.id);
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Transaction History</h1>
          <p className="text-xs text-slate-400 mt-0.5">{allTransactions.length} transactions</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
        <div className="relative flex-1 min-w-0">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={filter.searchQuery}
            onChange={(e) => { setFilter((p) => ({ ...p, searchQuery: e.target.value })); setCurrentPage(1); }}
            className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            value={filter.transactionType}
            onChange={(e) => { setFilter((p) => ({ ...p, transactionType: e.target.value as any })); setCurrentPage(1); }}
            className="bg-white border border-slate-200 text-slate-700 text-xs rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 transition-all cursor-pointer"
          >
            <option value="All">All types</option>
            <option value="income">Income only</option>
            <option value="expense">Expenses only</option>
          </select>
          <select
            value={filter.sortBy}
            onChange={(e) => setFilter((p) => ({ ...p, sortBy: e.target.value as any }))}
            className="bg-white border border-slate-200 text-slate-700 text-xs rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 transition-all cursor-pointer"
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
        {paginated.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider py-3 px-5">Type</th>
                    <th className="text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider py-3 px-5">Date</th>
                    <th className="text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider py-3 px-5">Description</th>
                    <th className="text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider py-3 px-5">Category / Source</th>
                    <th className="text-right text-[10px] font-semibold text-slate-400 uppercase tracking-wider py-3 px-5">Amount</th>
                    <th className="py-3 px-5"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {paginated.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="py-4 px-5 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium ${
                          tx.type === 'income' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-600'
                        }`}>
                          {tx.type === 'income' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {tx.type === 'income' ? 'Income' : 'Expense'}
                        </span>
                      </td>
                      <td className="py-3 px-5 text-xs text-slate-500 whitespace-nowrap">{formatDate(tx.date)}</td>
                      <td className="py-3 px-5 text-xs font-medium text-slate-800 max-w-xs truncate">{tx.title}</td>
                      <td className="py-3 px-5 text-xs text-slate-400 whitespace-nowrap">{tx.sub}</td>
                      <td className={`py-3 px-5 text-right text-xs font-semibold whitespace-nowrap ${
                        tx.type === 'income' ? 'text-emerald-600' : 'text-slate-800'
                      }`}>
                        {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                      </td>
                      <td className="py-3 px-5 whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => tx.type === 'income' ? onEditIncome(tx.original as IncomeRecord) : onEditExpense(tx.original as ExpenseRecord)}
                            className="p-1.5 text-slate-300 hover:text-slate-600 rounded-md hover:bg-slate-100 transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget({ id: tx.id, type: tx.type })}
                            className="p-1.5 text-slate-300 hover:text-rose-500 rounded-md hover:bg-rose-50 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
                <span className="text-xs text-slate-400">
                  Page {currentPage} of {totalPages}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => p - 1)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white disabled:opacity-30 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => p + 1)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white disabled:opacity-30 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="py-16 text-center">
            <p className="text-sm font-medium text-slate-600">No transactions found</p>
            <p className="text-xs text-slate-400 mt-1">Try adjusting your filters.</p>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Delete transaction?"
        message="This will permanently remove this record. This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
};
