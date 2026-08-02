import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency } from '../utils/formatters';
import { MONTH_NAMES } from '../utils/formatters';
import { ConfirmModal } from '../components/ConfirmModal';
import {
  Plus,
  Edit2,
  Trash2,
  X,
  CheckCircle2,
  Calendar,
} from 'lucide-react';

interface SalaryModalProps {
  month: number;
  year: number;
  existingAmount?: number;
  existingNotes?: string;
  onClose: () => void;
}

const SalaryModal: React.FC<SalaryModalProps> = ({
  month,
  year,
  existingAmount,
  existingNotes,
  onClose,
}) => {
  const { setSalary } = useFinance();
  const [amount, setAmount] = useState(existingAmount?.toString() ?? '');
  const [notes, setNotes] = useState(existingNotes ?? '');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(amount);
    if (isNaN(parsed) || parsed <= 0) {
      setError('Please enter a valid salary amount greater than ₱0.');
      return;
    }
    await setSalary(month, year, parsed, notes.trim() || undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-md w-full p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              {existingAmount !== undefined ? 'Edit' : 'Set'} Salary
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {MONTH_NAMES[month]} {year}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Amount */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Monthly Salary (₱) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-base pointer-events-none select-none">
                ₱
              </span>
              <input
                type="number"
                min="0"
                step="0.01"
                required
                autoFocus
                placeholder="0.00"
                value={amount}
                onChange={(e) => { setAmount(e.target.value); setError(''); }}
                className="input-base !pl-10 text-base font-bold"
              />
            </div>
            {error && <p className="text-xs text-rose-500 mt-1">{error}</p>}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Notes <span className="text-slate-400">(optional)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. After tax, includes allowances…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="input-base"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              {existingAmount !== undefined ? 'Update Salary' : 'Save Salary'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const SalaryView: React.FC = () => {
  const { salaries, deleteSalary, filter } = useFinance();
  const [editTarget, setEditTarget] = useState<{ month: number } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  // Salaries for the selected year, indexed by month (0–11)
  const salaryByMonth = React.useMemo(() => {
    const map: Record<number, (typeof salaries)[number]> = {};
    salaries.filter((s) => s.year === filter.year).forEach((s) => { map[s.month] = s; });
    return map;
  }, [salaries, filter.year]);

  const totalAnnual = Object.values(salaryByMonth).reduce((sum, s) => sum + s.amount, 0);
  const monthsSet = Object.keys(salaryByMonth).length;

  const editRecord = editTarget !== null ? salaryByMonth[editTarget.month] : undefined;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Monthly Salary</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {monthsSet} month{monthsSet !== 1 ? 's' : ''} configured · Annual total{' '}
            <span className="font-semibold text-slate-600">{formatCurrency(totalAnnual)}</span>
          </p>
        </div>
      </div>

      {/* Info banner */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 flex items-start gap-3">
        <Calendar className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
        <p className="text-xs text-slate-500 leading-relaxed">
          Set a salary for each month you want to track. Leave months empty if salary isn't applicable.
        </p>
      </div>

      {/* 12-month grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {MONTH_NAMES.map((name, idx) => {
          const record = salaryByMonth[idx];
          const isCurrentPeriod =
            idx === filter.month;

          return (
            <div
              key={name}
              className={`bg-white rounded-2xl border p-5 shadow-sm/50 hover-lift ${
                isCurrentPeriod ? 'border-emerald-200 ring-1 ring-emerald-100' : 'border-slate-100'
              }`}
            >
              {/* Month label + current badge */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-700">{name}</span>
                  {isCurrentPeriod && (
                    <span className="text-[10px] font-medium px-1.5 py-0.5 bg-emerald-50 text-emerald-600 rounded-full">
                      Active
                    </span>
                  )}
                </div>
                {record && (
                  <div className="flex items-center gap-0.5">
                    <button
                      onClick={() => setEditTarget({ month: idx })}
                      className="p-1.5 text-slate-300 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(record.id)}
                      className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-md transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {record ? (
                <div>
                  <p className="text-lg font-bold text-slate-900 tracking-tight">
                    {formatCurrency(record.amount)}
                  </p>
                  {record.notes && (
                    <p className="text-[10px] text-slate-400 mt-0.5 truncate">{record.notes}</p>
                  )}
                </div>
              ) : (
                  <button
                    onClick={() => setEditTarget({ month: idx })}
                    className="w-full flex items-center justify-center gap-1.5 py-3 border-2 border-dashed border-blue-200 hover:border-blue-400 hover:bg-blue-50/50 text-blue-400 hover:text-blue-600 rounded-xl text-xs font-semibold transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" /> Set salary
                  </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Salary modal */}
      {editTarget !== null && (
        <SalaryModal
          month={editTarget.month}
          year={filter.year}
          existingAmount={editRecord?.amount}
          existingNotes={editRecord?.notes}
          onClose={() => setEditTarget(null)}
        />
      )}

      {/* Delete confirm */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Remove salary record?"
        message="This will remove the salary for this month. The dashboard will fall back to income-based calculations for that period."
        confirmLabel="Remove"
        isDanger={false}
        onConfirm={() => { if (deleteTarget) deleteSalary(deleteTarget); }}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
};
