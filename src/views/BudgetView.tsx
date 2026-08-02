import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, MONTH_NAMES } from '../utils/formatters';
import { ConfirmModal } from '../components/ConfirmModal';
import {
  Plus,
  Edit2,
  Trash2,
  X,
  AlertTriangle,
} from 'lucide-react';

interface BudgetModalProps {
  month: number;
  year: number;
  existingAmount?: number;
  existingFirstHalf?: number;
  existingSecondHalf?: number;
  onClose: () => void;
}

const BudgetModal: React.FC<BudgetModalProps> = ({
  month,
  year,
  existingAmount,
  existingFirstHalf,
  existingSecondHalf,
  onClose,
}) => {
  const { setBudget } = useFinance();
  const [totalAmount, setTotalAmount] = useState(existingAmount?.toString() ?? '');
  const [firstHalfAmount, setFirstHalfAmount] = useState(existingFirstHalf?.toString() ?? '');
  const [secondHalfAmount, setSecondHalfAmount] = useState(existingSecondHalf?.toString() ?? '');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-split total evenly if user enters a Total Amount without specifying halves
  const handleTotalChange = (val: string) => {
    setTotalAmount(val);
    setError('');
    const parsed = parseFloat(val);
    if (!isNaN(parsed) && parsed > 0) {
      const half = (parsed / 2).toFixed(2);
      setFirstHalfAmount(half);
      setSecondHalfAmount(half);
    } else {
      setFirstHalfAmount('');
      setSecondHalfAmount('');
    }
  };

  const handleHalfChange = (firstVal: string, secondVal: string) => {
    setFirstHalfAmount(firstVal);
    setSecondHalfAmount(secondVal);
    setError('');
    const p1 = parseFloat(firstVal) || 0;
    const p2 = parseFloat(secondVal) || 0;
    if (p1 > 0 || p2 > 0) {
      setTotalAmount((p1 + p2).toString());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedTotal = parseFloat(totalAmount);
    const parsedFirst = parseFloat(firstHalfAmount);
    const parsedSecond = parseFloat(secondHalfAmount);

    if (isNaN(parsedTotal) || parsedTotal <= 0) {
      setError('Please enter a valid monthly budget limit greater than ₱0.');
      return;
    }
    setIsSubmitting(true);
    try {
      await setBudget(
        month,
        year,
        parsedTotal,
        !isNaN(parsedFirst) ? parsedFirst : undefined,
        !isNaN(parsedSecond) ? parsedSecond : undefined
      );
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-slate-900/80 backdrop-blur-sm transition-colors duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 max-w-md w-full p-6 transition-colors duration-200">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              {existingAmount !== undefined ? 'Edit' : 'Set'} Budget Limits
            </h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              {MONTH_NAMES[month]} {year}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/50 text-rose-700 dark:text-rose-400 text-xs rounded-xl flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Total Monthly Budget (₱)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 font-bold text-base pointer-events-none select-none">
                ₱
              </span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="0.00"
                value={totalAmount}
                onChange={(e) => handleTotalChange(e.target.value)}
                className="input-base !pl-10 text-base font-bold"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">15-Day Cycle Custom Split</p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                  1st Half (8th–22nd)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 font-bold text-xs pointer-events-none select-none">
                    ₱
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={firstHalfAmount}
                    onChange={(e) => handleHalfChange(e.target.value, secondHalfAmount)}
                    className="input-base !pl-8 text-xs font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                  2nd Half (23rd–7th)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 font-bold text-xs pointer-events-none select-none">
                    ₱
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={secondHalfAmount}
                    onChange={(e) => handleHalfChange(firstHalfAmount, e.target.value)}
                    className="input-base !pl-8 text-xs font-semibold"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary py-2 text-xs disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Budget Limits'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const BudgetView: React.FC = () => {
  const { budgets, expenses, deleteBudget, filter } = useFinance();
  const selectedYear = filter.year;
  const [activeModal, setActiveModal] = useState<{
    month: number;
    year: number;
    amount?: number;
    firstHalf?: number;
    secondHalf?: number;
  } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  // Group expenses by month and half (1st Half: Days 8-22, 2nd Half: Days 23-7)
  const expensesByMonthAndHalf = React.useMemo(() => {
    const map: Record<number, { total: number; firstHalf: number; secondHalf: number }> = {};
    expenses.forEach((e) => {
      const d = new Date(e.date + 'T00:00:00');
      if (d.getFullYear() === selectedYear) {
        const month = d.getMonth();
        const day = d.getDate();
        if (!map[month]) map[month] = { total: 0, firstHalf: 0, secondHalf: 0 };
        map[month].total += e.amount;
        if (day >= 8 && day <= 22) {
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
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Monthly & Semi-Monthly Budgeting</h1>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
            Set spending limits split into pay cycles (8th–22nd and 23rd–7th).
          </p>
        </div>
      </div>

      {/* Overview Card */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg shadow-blue-600/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs text-blue-100 font-medium uppercase tracking-wider">
            Total Annual Budget ({selectedYear})
          </span>
          <p className="text-3xl font-extrabold tracking-tight mt-1">
            {formatCurrency(totalYearBudget)}
          </p>
          <p className="text-xs text-blue-100/80 mt-1">
            Across {yearBudgets.length} configured month{yearBudgets.length !== 1 ? 's' : ''}.
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
          const firstHalfLimit = budgetRec?.first_half_amount ?? budgetLimit / 2;
          const secondHalfLimit = budgetRec?.second_half_amount ?? budgetLimit / 2;

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
              className={`bg-white dark:bg-slate-900 rounded-2xl p-5 border transition-all ${
                isOverBudget
                  ? 'border-rose-300 dark:border-rose-500/50 ring-2 ring-rose-500/20 bg-rose-50/20 dark:bg-rose-900/20'
                  : isNearLimit
                  ? 'border-amber-300 dark:border-amber-500/50 ring-2 ring-amber-500/20 bg-amber-50/20 dark:bg-amber-900/20'
                  : 'border-slate-100 hover:border-slate-200 dark:border-slate-800 dark:hover:border-slate-700'
              } shadow-sm/50 flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{monthName}</span>
                    {budgetLimit > 0 && (
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          isOverBudget
                            ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400'
                            : isNearLimit
                            ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                            : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
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
                          firstHalf: budgetRec?.first_half_amount,
                          secondHalf: budgetRec?.second_half_amount,
                        })
                      }
                      className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                      title={budgetLimit ? 'Edit Budget' : 'Set Budget'}
                    >
                      {budgetLimit ? <Edit2 className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                    </button>
                    {budgetRec && (
                      <button
                        onClick={() => setDeleteTarget(budgetRec.id)}
                        className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
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
                      <span className="text-slate-400 dark:text-slate-500">Total Spent: <strong className="text-slate-700 dark:text-slate-300">{formatCurrency(monthSpent)}</strong></span>
                      <span className="text-slate-400 dark:text-slate-500">Total Limit: <strong className="text-slate-700 dark:text-slate-300">{formatCurrency(budgetLimit)}</strong></span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
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
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2">
                      {/* 1st Half: Days 8 - 22 */}
                      {(() => {
                        const pct1 = firstHalfLimit > 0 ? Math.min((firstHalfSpent / firstHalfLimit) * 100, 100) : 0;
                        const over1 = firstHalfLimit > 0 && firstHalfSpent > firstHalfLimit;
                        return (
                          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 space-y-1.5">
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase block">1st (8th–22nd)</span>
                            <p className={`text-xs font-bold ${over1 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-800 dark:text-slate-200'}`}>
                              {formatCurrency(firstHalfSpent)}
                            </p>
                            <div className="w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${over1 ? 'bg-rose-500' : 'bg-blue-500'}`}
                                style={{ width: `${pct1}%` }}
                              />
                            </div>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500">of {formatCurrency(firstHalfLimit)}</p>
                          </div>
                        );
                      })()}

                      {/* 2nd Half: Days 23 - 7 */}
                      {(() => {
                        const pct2 = secondHalfLimit > 0 ? Math.min((secondHalfSpent / secondHalfLimit) * 100, 100) : 0;
                        const over2 = secondHalfLimit > 0 && secondHalfSpent > secondHalfLimit;
                        return (
                          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 space-y-1.5">
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase block">2nd (23rd–7th)</span>
                            <p className={`text-xs font-bold ${over2 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-800 dark:text-slate-200'}`}>
                              {formatCurrency(secondHalfSpent)}
                            </p>
                            <div className="w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${over2 ? 'bg-rose-500' : 'bg-indigo-500'}`}
                                style={{ width: `${pct2}%` }}
                              />
                            </div>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500">of {formatCurrency(secondHalfLimit)}</p>
                          </div>
                        );
                      })()}
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-medium pt-1">
                      <span className={isOverBudget ? 'text-rose-600 dark:text-rose-400 font-bold' : isNearLimit ? 'text-amber-600 dark:text-amber-400' : 'text-slate-500 dark:text-slate-400'}>
                        {percentage.toFixed(0)}% used
                      </span>
                      <span className={budgetLimit - monthSpent >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400 font-bold'}>
                        {budgetLimit - monthSpent >= 0
                          ? `${formatCurrency(budgetLimit - monthSpent)} remaining`
                          : `${formatCurrency(Math.abs(budgetLimit - monthSpent))} over limit`}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="py-4 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-800/30">
                    <p className="text-xs text-slate-400 dark:text-slate-500">No budget set for this month</p>
                    <button
                      onClick={() =>
                        setActiveModal({
                          month: monthIdx,
                          year: selectedYear,
                        })
                      }
                      className="mt-2 text-xs font-semibold text-amber-600 dark:text-amber-500 hover:text-amber-700 dark:hover:text-amber-400 transition-colors"
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
          existingFirstHalf={activeModal.firstHalf}
          existingSecondHalf={activeModal.secondHalf}
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
