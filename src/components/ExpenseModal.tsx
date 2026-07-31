import React, { useState, useEffect } from 'react';
import { useFinance } from '../context/FinanceContext';
import type { ExpenseRecord, ExpenseCategory, PaymentMethod } from '../types/finance';
import { X, MinusCircle, Save, Upload, Image as ImageIcon } from 'lucide-react';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: ExpenseRecord | null;
}

const CATEGORIES: ExpenseCategory[] = [
  'Food',
  'Transportation',
  'Bills',
  'Shopping',
  'Entertainment',
  'Health',
  'Education',
  'Travel',
  'Miscellaneous',
];

const PAYMENT_METHODS: PaymentMethod[] = [
  'Credit Card',
  'Debit Card',
  'Bank Transfer',
  'E-Wallet',
  'Cash',
];

export const ExpenseModal: React.FC<ExpenseModalProps> = ({ isOpen, onClose, initialData }) => {
  const { addExpense, updateExpense } = useFinance();
  const [amount, setAmount] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [category, setCategory] = useState<ExpenseCategory>('Food');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Credit Card');
  const [description, setDescription] = useState<string>('');
  const [receiptUrl, setReceiptUrl] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setAmount(initialData.amount.toString());
      setDate(initialData.date);
      setCategory(initialData.category);
      setPaymentMethod(initialData.payment_method);
      setDescription(initialData.description);
      setReceiptUrl(initialData.receipt_url || '');
    } else {
      setAmount('');
      setDate(new Date().toISOString().split('T')[0]);
      setCategory('Food');
      setPaymentMethod('Credit Card');
      setDescription('');
      setReceiptUrl('');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create local object URL preview for demonstration
      const url = URL.createObjectURL(file);
      setReceiptUrl(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Please enter a valid amount greater than zero.');
      return;
    }
    if (!description.trim()) {
      alert('Please enter a description for this expense.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (initialData) {
        await updateExpense(initialData.id, {
          amount: parsedAmount,
          date,
          category,
          payment_method: paymentMethod,
          description: description.trim(),
          receipt_url: receiptUrl,
        });
      } else {
        await addExpense({
          amount: parsedAmount,
          date,
          category,
          payment_method: paymentMethod,
          description: description.trim(),
          receipt_url: receiptUrl,
        });
      }
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-lg w-full overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
              <MinusCircle className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-800 text-lg">
              {initialData ? 'Edit Expense Record' : 'Record New Expense'}
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
              Amount ($)
            </label>
            <input
              type="number"
              step="0.01"
              required
              placeholder="e.g. 85.50"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="input-base text-lg font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
              Description
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Grocery items & Household supplies"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-base"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                className="input-base"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="input-base"
              >
                {PAYMENT_METHODS.map((pm) => (
                  <option key={pm} value={pm}>
                    {pm}
                  </option>
                ))}
              </select>
            </div>
          </div>

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
              Receipt Image (Optional)
            </label>
            <div className="flex items-center gap-3">
              <label className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium cursor-pointer transition-colors border border-slate-200">
                <Upload className="w-4 h-4" />
                Upload Receipt
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleReceiptUpload}
                  className="hidden"
                />
              </label>
              {receiptUrl ? (
                <div className="flex items-center gap-2 text-xs text-emerald-600 font-medium bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                  <ImageIcon className="w-4 h-4" />
                  Receipt Attached
                </div>
              ) : (
                <span className="text-xs text-slate-400">No receipt file chosen</span>
              )}
            </div>
            {receiptUrl && (
              <div className="mt-2 relative w-24 h-24 rounded-lg overflow-hidden border border-slate-200">
                <img src={receiptUrl} alt="Receipt preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setReceiptUrl('')}
                  className="absolute top-1 right-1 p-0.5 bg-slate-900/70 text-white rounded-full hover:bg-slate-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
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
              className="btn-danger disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSubmitting ? 'Saving...' : initialData ? 'Update Expense' : 'Add Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
