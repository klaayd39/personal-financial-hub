import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { useFinance } from '../context/FinanceContext';
import type { ExpenseRecord, PaymentMethod, ExpenseCategory } from '../types/finance';
import { AnimatedModal } from './AnimatedModal';
import {
  X, MinusCircle, Save, Upload, Image as ImageIcon,
  FileText, CreditCard, Calendar, Clock,
} from 'lucide-react';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: ExpenseRecord | null;
}

const PAYMENT_METHODS: PaymentMethod[] = [
  'Credit Card', 'Debit Card', 'Bank Transfer', 'E-Wallet', 'Cash',
];

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Food', 'Transportation', 'Bills', 'Shopping', 'Entertainment',
  'Health', 'Education', 'Travel', 'Miscellaneous',
];

const CATEGORY_EMOJI: Record<ExpenseCategory, string> = {
  Food: '🍽️',
  Transportation: '🚗',
  Bills: '📋',
  Shopping: '🛒',
  Entertainment: '🎬',
  Health: '🏥',
  Education: '📚',
  Travel: '✈️',
  Miscellaneous: '📦',
};

/** Get today's date in YYYY-MM-DD using local timezone (not UTC) */
const getLocalDateString = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

/** Get current time in HH:MM using local timezone */
const getLocalTimeString = () => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

const fieldVariants: Variants = {
  hidden: { opacity: 0, y: 6 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.05, duration: 0.2, ease: 'easeOut' as const },
  }),
};

export const ExpenseModal: React.FC<ExpenseModalProps> = ({ isOpen, onClose, initialData }) => {
  const { addExpense, updateExpense, showToast } = useFinance();
  const [amount, setAmount] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [time, setTime] = useState<string>('');
  const [category, setCategory] = useState<ExpenseCategory>('Miscellaneous');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Credit Card');
  const [description, setDescription] = useState<string>('');
  const [receiptUrl, setReceiptUrl] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setAmount(initialData.amount.toString());
        setDate(initialData.date);
        setTime((initialData as any).time || '');
        setCategory(initialData.category);
        setPaymentMethod(initialData.payment_method);
        setDescription(initialData.description);
        setReceiptUrl(initialData.receipt_url || '');
      } else {
        setAmount('');
        setDate(getLocalDateString());
        setTime(getLocalTimeString());
        setCategory('Miscellaneous');
        setPaymentMethod('Credit Card');
        setDescription('');
        setReceiptUrl('');
      }
      setErrors({});
      setIsSubmitting(false);
    }
  }, [initialData, isOpen]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    const parsedAmount = parseFloat(amount);

    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      newErrors.amount = 'Please enter a valid amount greater than ₱0.';
    }
    if (!description.trim()) {
      newErrors.description = 'A description is required.';
    }
    if (!date) {
      newErrors.date = 'Please select a date.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setReceiptUrl(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      showToast('Please fix the errors before saving.', 'error');
      return;
    }
    const parsedAmount = parseFloat(amount);
    setIsSubmitting(true);
    try {
      if (initialData) {
        await updateExpense(initialData.id, {
          amount: parsedAmount,
          date,
          category,
          payment_method: paymentMethod,
          description: description.trim(),
          receipt_url: receiptUrl || undefined,
        });
      } else {
        await addExpense({
          amount: parsedAmount,
          date,
          category,
          payment_method: paymentMethod,
          description: description.trim(),
          receipt_url: receiptUrl || undefined,
        });
      }
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const isEditing = Boolean(initialData);

  return (
    <AnimatedModal isOpen={isOpen} onClose={onClose} maxWidth="max-w-lg">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-rose-50 to-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-100 text-rose-600 rounded-xl">
              <MinusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">
                {isEditing ? 'Edit Expense' : 'Record New Expense'}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {isEditing ? 'Update the details below' : 'Fill in the expense details below'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all active:scale-95"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Amount */}
          <motion.div custom={0} variants={fieldVariants} initial="hidden" animate="visible">
            <label htmlFor="expense-amount" className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
              <span className="flex items-center gap-1.5">Amount (₱) <span className="text-rose-500">*</span></span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-base pointer-events-none select-none">₱</span>
              <input
                id="expense-amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => { setAmount(e.target.value); setErrors((prev) => ({ ...prev, amount: '' })); }}
                className={`input-base !pl-10 text-base font-bold ${errors.amount ? 'border-rose-400 ring-2 ring-rose-400/20' : ''}`}
                aria-invalid={Boolean(errors.amount)}
                aria-describedby={errors.amount ? 'amount-error' : undefined}
              />
            </div>
            {errors.amount && (
              <p id="amount-error" className="mt-1 text-xs text-rose-500 font-medium">{errors.amount}</p>
            )}
          </motion.div>

          {/* Description */}
          <motion.div custom={1} variants={fieldVariants} initial="hidden" animate="visible">
            <label htmlFor="expense-desc" className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
              <span className="flex items-center gap-1.5"><FileText className="w-3 h-3" /> Description <span className="text-rose-500">*</span></span>
            </label>
            <input
              id="expense-desc"
              type="text"
              placeholder="e.g. Grocery shopping at SM"
              value={description}
              onChange={(e) => { setDescription(e.target.value); setErrors((prev) => ({ ...prev, description: '' })); }}
              className={`input-base ${errors.description ? 'border-rose-400 ring-2 ring-rose-400/20' : ''}`}
              aria-invalid={Boolean(errors.description)}
              aria-describedby={errors.description ? 'desc-error' : undefined}
            />
            {errors.description && (
              <p id="desc-error" className="mt-1 text-xs text-rose-500 font-medium">{errors.description}</p>
            )}
          </motion.div>

          {/* Category */}
          <motion.div custom={2} variants={fieldVariants} initial="hidden" animate="visible">
            <label htmlFor="expense-category" className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
              Category
            </label>
            <div className="grid grid-cols-3 gap-2">
              {EXPENSE_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-medium transition-all active:scale-95 ${
                    category === cat
                      ? 'bg-blue-50 border-blue-300 text-blue-700 ring-2 ring-blue-500/20'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                  aria-pressed={category === cat}
                >
                  <span>{CATEGORY_EMOJI[cat]}</span>
                  <span className="truncate">{cat}</span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Payment Method & Date */}
          <motion.div custom={3} variants={fieldVariants} initial="hidden" animate="visible" className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="expense-payment" className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                <span className="flex items-center gap-1.5"><CreditCard className="w-3 h-3" /> Payment</span>
              </label>
              <select
                id="expense-payment"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="input-base"
              >
                {PAYMENT_METHODS.map((pm) => (
                  <option key={pm} value={pm}>{pm}</option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              <div>
                <label htmlFor="expense-date" className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                  <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3" /> Date <span className="text-rose-500">*</span></span>
                </label>
                <input
                  id="expense-date"
                  type="date"
                  required
                  value={date}
                  onChange={(e) => { setDate(e.target.value); setErrors((prev) => ({ ...prev, date: '' })); }}
                  className={`input-base ${errors.date ? 'border-rose-400 ring-2 ring-rose-400/20' : ''}`}
                  aria-invalid={Boolean(errors.date)}
                />
                {errors.date && (
                  <p className="mt-1 text-xs text-rose-500 font-medium">{errors.date}</p>
                )}
              </div>
              <div>
                <label htmlFor="expense-time" className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                  <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> Time</span>
                </label>
                <input
                  id="expense-time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="input-base"
                />
              </div>
            </div>
          </motion.div>

          {/* Receipt Upload */}
          <motion.div custom={4} variants={fieldVariants} initial="hidden" animate="visible">
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
              Receipt Image <span className="font-normal text-slate-400">(Optional)</span>
            </label>
            <div className="flex items-center gap-3 flex-wrap">
              <label className="flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-medium cursor-pointer transition-colors border border-slate-200 active:scale-95">
                <Upload className="w-3.5 h-3.5" />
                {receiptUrl ? 'Replace Receipt' : 'Upload Receipt'}
                <input type="file" accept="image/*" onChange={handleReceiptUpload} className="hidden" />
              </label>
              {receiptUrl ? (
                <div className="flex items-center gap-2 text-xs text-emerald-700 font-medium bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                  <ImageIcon className="w-3.5 h-3.5" />
                  Receipt Attached
                </div>
              ) : (
                <span className="text-xs text-slate-400">No receipt chosen</span>
              )}
            </div>
            {receiptUrl && (
              <div className="mt-3 relative inline-block">
                <div className="w-24 h-24 rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                  <img src={receiptUrl} alt="Receipt preview" className="w-full h-full object-cover" />
                </div>
                <button
                  type="button"
                  onClick={() => setReceiptUrl('')}
                  className="absolute -top-2 -right-2 p-1 bg-slate-800 text-white rounded-full hover:bg-slate-900 transition-colors shadow"
                  aria-label="Remove receipt"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </div>
            )}
          </motion.div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50 shrink-0">
          <button type="button" onClick={onClose} className="btn-secondary text-sm">
            Cancel
          </button>
          <motion.button
            type="submit"
            form=""
            disabled={isSubmitting}
            onClick={handleSubmit}
            whileTap={{ scale: 0.97 }}
            className="btn-primary text-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            {isSubmitting ? 'Saving…' : isEditing ? 'Update Expense' : 'Add Expense'}
          </motion.button>
        </div>
      </div>
    </AnimatedModal>
  );
};
