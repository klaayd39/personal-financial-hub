import React, { useState, useEffect } from 'react';
import { useFinance } from '../context/FinanceContext';
import type { IncomeRecord, IncomeSource } from '../types/finance';
import { X, PlusCircle, Save } from 'lucide-react';

interface IncomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: IncomeRecord | null;
}

const SOURCES: IncomeSource[] = ['Salary', 'Freelance', 'Business', 'Bonus', 'Allowance', 'Other'];

export const IncomeModal: React.FC<IncomeModalProps> = ({ isOpen, onClose, initialData }) => {
  const { addIncome, updateIncome } = useFinance();
  const [amount, setAmount] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [source, setSource] = useState<IncomeSource>('Salary');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setAmount(initialData.amount.toString());
      setDate(initialData.date);
      setSource(initialData.source);
      setNotes(initialData.notes || '');
    } else {
      setAmount('');
      setDate(new Date().toISOString().split('T')[0]);
      setSource('Salary');
      setNotes('');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Please enter a valid amount greater than zero.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (initialData) {
        await updateIncome(initialData.id, {
          amount: parsedAmount,
          date,
          source,
          notes,
        });
      } else {
        await addIncome({
          amount: parsedAmount,
          date,
          source,
          notes,
        });
      }
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <PlusCircle className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-800 text-lg">
              {initialData ? 'Edit Income Record' : 'Record New Income'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
              Amount ($)
            </label>
            <input
              type="number"
              step="0.01"
              required
              placeholder="e.g. 5500.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="input-base text-lg font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="input-base"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Source
              </label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value as IncomeSource)}
                className="input-base"
              >
                {SOURCES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
              Notes / Description (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Monthly salary from Tech Corp..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="input-base resize-none"
            />
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSubmitting ? 'Saving...' : initialData ? 'Update Income' : 'Add Income'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
