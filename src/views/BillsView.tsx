import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import type { BillRecord } from '../types/finance';
import { formatCurrency } from '../utils/formatters';
import { ConfirmModal } from '../components/ConfirmModal';
import {
  Plus,
  Edit2,
  Trash2,
  X,
  CheckCircle2,
  Circle,
  Calendar,
  AlertTriangle,
} from 'lucide-react';

interface BillModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: BillRecord | null;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const BillModal: React.FC<BillModalProps> = ({ isOpen, onClose, initialData }) => {
  const { addBill, updateBill } = useFinance();
  const [name, setName] = useState(initialData?.name ?? '');
  const [amount, setAmount] = useState(initialData?.amount.toString() ?? '');
  const [dueDay, setDueDay] = useState(initialData?.due_day.toString() ?? '1');
  const [monthOption, setMonthOption] = useState<string>(
    initialData?.month !== undefined && initialData?.month !== null ? initialData.month.toString() : 'all'
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

  if (!isOpen) return null;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-slate-900">
            {initialData ? 'Edit Bill' : 'Add Bill'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
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
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
              Bill / Subscription Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Electricity, Internet, Spotify"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              className="input-base text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                Amount (₱)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-xs">
                  ₱
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  placeholder="e.g. 1499.00"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    setError('');
                  }}
                  className="input-base pl-7 text-sm font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                Due Day of Month
              </label>
              <input
                type="number"
                min="1"
                max="31"
                required
                placeholder="e.g. 15"
                value={dueDay}
                onChange={(e) => {
                  setDueDay(e.target.value);
                  setError('');
                }}
                className="input-base text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                Bill Month
              </label>
              <select
                value={monthOption}
                onChange={(e) => setMonthOption(e.target.value)}
                className="input-base text-xs font-medium"
              >
                <option value="all">Every Month (Recurring)</option>
                {MONTH_NAMES.map((m, idx) => (
                  <option key={m} value={idx}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                Bill Year
              </label>
              <select
                disabled={monthOption === 'all'}
                value={yearOption}
                onChange={(e) => setYearOption(Number(e.target.value))}
                className="input-base text-xs font-medium disabled:opacity-50"
              >
                {[2024, 2025, 2026, 2027, 2028].map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
              Billing Cycle
            </label>
            <select
              value={billingCycle}
              onChange={(e) => setBillingCycle(e.target.value as any)}
              className="input-base text-xs font-medium"
            >
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
              Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Auto-debit from Credit Card"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="input-base text-xs"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
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
              {isSubmitting ? 'Saving...' : initialData ? 'Update Bill' : 'Add Bill'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const BillsView: React.FC = () => {
  const { bills, deleteBill, toggleBillPaid } = useFinance();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBill, setEditingBill] = useState<BillRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Fixed & Recurring Bills</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Track monthly subscriptions, utilities, and scheduled payments.
          </p>
        </div>
        <button onClick={handleOpenAdd} className="btn-primary gap-1.5 self-start sm:self-auto text-xs py-2">
          <Plus className="w-4 h-4" />
          Add Bill
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm/50">
          <span className="text-xs text-slate-400 font-medium">Total Monthly Bills</span>
          <p className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            {formatCurrency(totalMonthlyBills)}
          </p>
          <span className="text-[10px] text-slate-400">{bills.length} recurring item{bills.length !== 1 ? 's' : ''}</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm/50">
          <span className="text-xs text-slate-400 font-medium">Total Paid</span>
          <p className="text-2xl font-extrabold text-emerald-600 tracking-tight mt-1">
            {formatCurrency(paidTotal)}
          </p>
          <span className="text-[10px] text-emerald-600 font-medium">
            {bills.length > 0 ? `${((paidTotal / totalMonthlyBills) * 100).toFixed(0)}% paid` : '0%'}
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm/50">
          <span className="text-xs text-slate-400 font-medium">Unpaid Remaining</span>
          <p className="text-2xl font-extrabold text-rose-600 tracking-tight mt-1">
            {formatCurrency(unpaidTotal)}
          </p>
          <span className="text-[10px] text-rose-600 font-medium">
            {bills.filter((b) => !b.is_paid).length} pending item{bills.filter((b) => !b.is_paid).length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Bills List */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm/50 overflow-hidden">
        {bills.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {bills.map((bill) => {
              const isDueSoon = !bill.is_paid && bill.due_day >= todayDay && bill.due_day <= todayDay + 5;
              const isPastDue = !bill.is_paid && bill.due_day < todayDay;

              return (
                <div
                  key={bill.id}
                  className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                    bill.is_paid
                      ? 'bg-slate-50/50'
                      : isPastDue
                      ? 'bg-rose-50/30'
                      : isDueSoon
                      ? 'bg-amber-50/30'
                      : 'hover:bg-slate-50/70'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      onClick={() => toggleBillPaid(bill.id)}
                      className={`p-1 rounded-full transition-colors shrink-0 ${
                        bill.is_paid ? 'text-emerald-600 bg-emerald-50' : 'text-slate-300 hover:text-slate-400'
                      }`}
                      title={bill.is_paid ? 'Mark as Unpaid' : 'Mark as Paid'}
                    >
                      {bill.is_paid ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                    </button>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className={`text-sm font-semibold truncate ${bill.is_paid ? 'line-through text-slate-400' : 'text-slate-800'}`}>
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
                      </div>
                      {bill.notes && <p className="text-xs text-slate-400 mt-0.5">{bill.notes}</p>}
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                    <p className={`text-sm font-bold ${bill.is_paid ? 'text-slate-400' : 'text-slate-900'}`}>
                      {formatCurrency(bill.amount)}
                    </p>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEdit(bill)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Edit Bill"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(bill.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete Bill"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center">
            <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-700">No recurring bills added yet</p>
            <p className="text-xs text-slate-400 mt-1 mb-4">Keep track of your monthly subscriptions, utilities, and scheduled payments.</p>
            <button onClick={handleOpenAdd} className="btn-primary text-xs py-2">
              + Add First Bill
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      <BillModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} initialData={editingBill} />

      {/* Delete Confirmation */}
      {deleteTarget && (
        <ConfirmModal
          isOpen={true}
          title="Delete Recurring Bill"
          message="Are you sure you want to delete this bill record?"
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
