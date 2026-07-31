import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, MONTH_NAMES } from '../utils/formatters';
import { ConfirmModal } from '../components/ConfirmModal';
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Calendar,
  AlertTriangle,
} from 'lucide-react';

const YEARS = [2024, 2025, 2026, 2027, 2028];

interface BudgetModalProps {
  month: number;
  year: number;
  existingAmount?: number;
  onClose: () => void;
}

const BudgetModal: React.FC<BudgetModalProps> = ({
  month,
  year,
  existingAmount,
  onClose,
}) => {
  const { setBudget } = useFinance();
  const [amount, setAmount] = useState(existingAmount?.toString() ?? '');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(amount);
    if (isNaN(parsed) || parsed <= 0) {
      setError('Please enter a valid monthly budget limit greater than ₱0.');
      return;
    }
    setIsSubmitting(true);
    try {
      await setBudget(month, year, parsed);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-md w-full p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              {existingAmount !== undefined ? 'Edit' : 'Set'} Budget Limit
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {MONTH_NAMES[month]} {year}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">
              Monthly Budget Limit (₱)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-sm">
                ₱
              </span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="e.g. 15000.00"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setError('');
                }}
                className="input-base pl-8 text-base font-bold"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary py-2 text-xs disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Budget Limit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const BudgetView: React.FC = () => {
  const { budgets, expenses, deleteBudget, filter } = useFinance();
  const [selectedYear, setSelectedYear] = useState<number>(filter.year);
  const [activeModal, setActiveModal] = useState<{
    month: number;
    year: number;
    amount?: number;
  } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  // Group expenses by month and half (1st Half: Days 1-15, 2nd Half: Days 16+)
  const expensesByMonthAndHalf = React.useMemo(() => {
    const map: Record<number, { total: number; firstHalf: number; secondHalf: number }> = {};
    expenses.forEach((e) => {
      const d = new Date(e.date + 'T00:00:00');
      if (d.getFullYear() === selectedYear) {
        const month = d.getMonth();
        const day = d.getDate();
        if (!map[month]) map[month] = { total: 0, firstHalf: 0, secondHalf: 0 };
        map[month].total += e.amount;
        if (day <= 15) {
          map[month].firstHalf += e.amount;
        } else {
          map[month].secondHalf += e.amount;
        }
      }
    });
    return map;
  }, [expenses, selectedYear]);

  // Compute total budget for the year
  const yearBudgets = budgets.filter((b) => b.year === selectedYear);
  const totalYearBudget = yearBudgets.reduce((acc, b) => acc + b.amount, 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Monthly & Semi-Monthly Budgeting</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Set spending limits split into 15-day pay cycles (1st–15th and 16th–End).
          </p>
        </div>

        {/* Year Selector */}
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="input-base text-xs font-semibold py-1.5 px-3 bg-white border border-slate-200 rounded-xl"
          >
            {YEARS.map((yr) => (
              <option key={yr} value={yr}>
                {yr}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Overview Card */}
      <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl p-6 text-white shadow-lg shadow-amber-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs text-amber-100 font-medium uppercase tracking-wider">
            Total Annual Budget ({selectedYear})
          </span>
          <p className="text-3xl font-extrabold tracking-tight mt-1">
            {formatCurrency(totalYearBudget)}
          </p>
          <p className="text-xs text-amber-100/80 mt-1">
            Across {yearBudgets.length} configured month{yearBudgets.length !== 1 ? 's' : ''} (₱{(totalYearBudget / 2).toLocaleString()} per 15-day cycle).
          </p>
        </div>
      </div>

      {/* Month Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {MONTH_NAMES.map((monthName, monthIdx) => {
          const budgetRec = budgets.find(
            (b) => b.month === monthIdx && b.year === selectedYear
          );
          const budgetLimit = budgetRec?.amount ?? 0;
          const halfBudgetLimit = budgetLimit / 2;

          const monthStats = expensesByMonthAndHalf[monthIdx] || { total: 0, firstHalf: 0, secondHalf: 0 };
          const monthSpent = monthStats.total;
          const firstHalfSpent = monthStats.firstHalf;
          const secondHalfSpent = monthStats.secondHalf;

          const percentage = budgetLimit > 0 ? Math.min((monthSpent / budgetLimit) * 100, 100) : 0;
          const isOverBudget = budgetLimit > 0 && monthSpent > budgetLimit;
          const isNearLimit = budgetLimit > 0 && percentage >= 80 && !isOverBudget;

          return (
            <div
              key={monthIdx}
              className={`bg-white rounded-2xl p-5 border transition-all ${
                isOverBudget
                  ? 'border-rose-300 ring-2 ring-rose-500/20 bg-rose-50/20'
                  : isNearLimit
                  ? 'border-amber-300 ring-2 ring-amber-500/20 bg-amber-50/20'
                  : 'border-slate-100 hover:border-slate-200'
              } shadow-sm/50 flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-800">{monthName}</span>
                    {budgetLimit > 0 && (
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          isOverBudget
                            ? 'bg-rose-100 text-rose-700'
                            : isNearLimit
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {isOverBudget ? 'Over Budget' : isNearLimit ? 'Near Limit' : 'On Track'}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() =>
                        setActiveModal({
                          month: monthIdx,
                          year: selectedYear,
                          amount: budgetLimit || undefined,
                        })
                      }
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                      title={budgetLimit ? 'Edit Budget' : 'Set Budget'}
                    >
                      {budgetLimit ? <Edit2 className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                    </button>
                    {budgetRec && (
                      <button
                        onClick={() => setDeleteTarget(budgetRec.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete Budget"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {budgetLimit > 0 ? (
                  <div className="space-y-3">
                    <div className="flex items-baseline justify-between text-xs">
                      <span className="text-slate-400">Total Spent: <strong className="text-slate-700">{formatCurrency(monthSpent)}</strong></span>
                      <span className="text-slate-400">Total Limit: <strong className="text-slate-700">{formatCurrency(budgetLimit)}</strong></span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isOverBudget
                            ? 'bg-rose-500'
                            : isNearLimit
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>

                    {/* 15-Day Semi-Monthly Split Cycles */}
                    <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2">
                      {/* 1st Half: Days 1 - 15 */}
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold uppercase">
                          <span>1st Half (1st–15th)</span>
                        </div>
                        <p className={`text-xs font-bold ${firstHalfSpent > halfBudgetLimit ? 'text-rose-600' : 'text-slate-800'}`}>
                          {formatCurrency(firstHalfSpent)}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          Limit: {formatCurrency(halfBudgetLimit)}
                        </p>
                      </div>

                      {/* 2nd Half: Days 16 - End */}
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold uppercase">
                          <span>2nd Half (16th–End)</span>
                        </div>
                        <p className={`text-xs font-bold ${secondHalfSpent > halfBudgetLimit ? 'text-rose-600' : 'text-slate-800'}`}>
                          {formatCurrency(secondHalfSpent)}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          Limit: {formatCurrency(halfBudgetLimit)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-medium pt-1">
                      <span className={isOverBudget ? 'text-rose-600 font-bold' : isNearLimit ? 'text-amber-600' : 'text-slate-500'}>
                        {percentage.toFixed(0)}% used
                      </span>
                      <span className={budgetLimit - monthSpent >= 0 ? 'text-emerald-600' : 'text-rose-600 font-bold'}>
                        {budgetLimit - monthSpent >= 0
                          ? `${formatCurrency(budgetLimit - monthSpent)} remaining`
                          : `${formatCurrency(Math.abs(budgetLimit - monthSpent))} over limit`}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="py-4 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                    <p className="text-xs text-slate-400">No budget set for this month</p>
                    <button
                      onClick={() =>
                        setActiveModal({
                          month: monthIdx,
                          year: selectedYear,
                        })
                      }
                      className="mt-2 text-xs font-semibold text-amber-600 hover:text-amber-700 transition-colors"
                    >
                      + Set Limit
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {activeModal && (
        <BudgetModal
          month={activeModal.month}
          year={activeModal.year}
          existingAmount={activeModal.amount}
          onClose={() => setActiveModal(null)}
        />
      )}

      {/* Confirm Delete */}
      {deleteTarget && (
        <ConfirmModal
          isOpen={true}
          title="Delete Budget Limit"
          message="Are you sure you want to remove the budget limit for this month?"
          confirmLabel="Delete"
          onConfirm={async () => {
            await deleteBudget(deleteTarget);
            setDeleteTarget(null);
          }}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};
