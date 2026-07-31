import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import type { IncomeRecord } from '../types/finance';
import { formatCurrency, formatDate } from '../utils/formatters';
import { ConfirmModal } from '../components/ConfirmModal';
import { Plus, Search, Edit2, Trash2, TrendingUp } from 'lucide-react';

interface IncomeViewProps {
  onOpenAddModal: () => void;
  onEditIncome: (record: IncomeRecord) => void;
}

const SOURCE_OPTIONS = ['All', 'Salary', 'Freelance', 'Business', 'Bonus', 'Allowance', 'Other'] as const;

export const IncomeView: React.FC<IncomeViewProps> = ({ onOpenAddModal, onEditIncome }) => {
  const { filteredIncomes, deleteIncome, filter, setFilter, summary } = useFinance();
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Income</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {filteredIncomes.length} records · Total{' '}
            <span className="font-semibold text-emerald-600">{formatCurrency(summary.totalIncome)}</span>
          </p>
        </div>
        <button
          onClick={onOpenAddModal}
          className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> Add Income
        </button>
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
            className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            value={filter.incomeSource}
            onChange={(e) => setFilter((p) => ({ ...p, incomeSource: e.target.value as any }))}
            className="bg-white border border-slate-200 text-slate-700 text-xs rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-slate-200"
          >
            {SOURCE_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select
            value={filter.sortBy}
            onChange={(e) => setFilter((p) => ({ ...p, sortBy: e.target.value as any }))}
            className="bg-white border border-slate-200 text-slate-700 text-xs rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-slate-200"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="highest">Highest</option>
            <option value="lowest">Lowest</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
        {filteredIncomes.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider py-3 px-5">Date</th>
                  <th className="text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider py-3 px-5">Source</th>
                  <th className="text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider py-3 px-5">Notes</th>
                  <th className="text-right text-[10px] font-semibold text-slate-400 uppercase tracking-wider py-3 px-5">Amount</th>
                  <th className="py-3 px-5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredIncomes.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-5 text-xs text-slate-500 whitespace-nowrap">{formatDate(rec.date)}</td>
                    <td className="py-3 px-5 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-xs font-medium">
                        {rec.source}
                      </span>
                    </td>
                    <td className="py-3 px-5 text-xs text-slate-400 max-w-xs truncate">{rec.notes || '—'}</td>
                    <td className="py-3 px-5 text-right text-xs font-semibold text-emerald-600 whitespace-nowrap">
                      +{formatCurrency(rec.amount)}
                    </td>
                    <td className="py-3 px-5 whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => onEditIncome(rec)} className="p-1.5 text-slate-300 hover:text-slate-600 rounded-md hover:bg-slate-100 transition-colors">
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
            <TrendingUp className="w-8 h-8 mx-auto text-slate-200 mb-3" />
            <p className="text-sm font-medium text-slate-600">No income records</p>
            <p className="text-xs text-slate-400 mt-1">Add your first income to get started.</p>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Delete income record?"
        message="This will permanently remove this income entry. This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={() => { if (deleteTarget) deleteIncome(deleteTarget); }}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
};
