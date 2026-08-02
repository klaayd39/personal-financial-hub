import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { useFinance } from '../context/FinanceContext';
import type { ExpenseRecord, PaymentMethod, ExpenseCategory } from '../types/finance';
import { AnimatedModal } from './AnimatedModal';
import {
  X, MinusCircle, Save, Upload, Image as ImageIcon,
  FileText, CreditCard, Calendar, Clock, Trash2,
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

const CATEGORY_COLOR: Record<ExpenseCategory, string> = {
  Food: 'bg-orange-50 border-orange-200 text-orange-700 ring-orange-400/20',
  Transportation: 'bg-blue-50 border-blue-200 text-blue-700 ring-blue-400/20',
  Bills: 'bg-purple-50 border-purple-200 text-purple-700 ring-purple-400/20',
  Shopping: 'bg-pink-50 border-pink-200 text-pink-700 ring-pink-400/20',
  Entertainment: 'bg-yellow-50 border-yellow-200 text-yellow-700 ring-yellow-400/20',
  Health: 'bg-red-50 border-red-200 text-red-700 ring-red-400/20',
  Education: 'bg-indigo-50 border-indigo-200 text-indigo-700 ring-indigo-400/20',
  Travel: 'bg-cyan-50 border-cyan-200 text-cyan-700 ring-cyan-400/20',
  Miscellaneous: 'bg-slate-50 border-slate-200 text-slate-700 ring-slate-400/20',
};

/** Get today's date in YYYY-MM-DD using local timezone */
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
  hidden: { opacity: 0, y: 8 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.25, ease: 'easeOut' as const },
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
  const [isNewExpense, setIsNewExpense] = useState(false);
  const clockRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-tick clock for new expenses
  useEffect(() => {
    if (isOpen && isNewExpense) {
      clockRef.current = setInterval(() => {
        setTime(getLocalTimeString());
        setDate(getLocalDateString());
      }, 1000);
    }
    return () => {
      if (clockRef.current) clearInterval(clockRef.current);
    };
  }, [isOpen, isNewExpense]);

  // Stop auto-tick when user manually edits time/date
  const handleTimeChange = (val: string) => {
    if (clockRef.current) clearInterval(clockRef.current);
    setIsNewExpense(false);
    setTime(val);
  };

  const handleDateChange = (val: string) => {
    if (clockRef.current) clearInterval(clockRef.current);
    setIsNewExpense(false);
    setDate(val);
    setErrors((prev) => ({ ...prev, date: '' }));
  };

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setIsNewExpense(false);
        setAmount(initialData.amount.toString());
        setDate(initialData.date);
        setTime((initialData as any).time || getLocalTimeString());
        setCategory(initialData.category);
        setPaymentMethod(initialData.payment_method);
        setDescription(initialData.description);
        setReceiptUrl(initialData.receipt_url || '');
      } else {
        setIsNewExpense(true);
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
    } else {
      setIsNewExpense(false);
      if (clockRef.current) clearInterval(clockRef.current);
    }
  }, [initialData, isOpen]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    const parsedAmount = parseFloat(amount);
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      newErrors.amount = 'Enter a valid amount greater than ₱0.';
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
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden max-h-[92vh] flex flex-col">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0"
          style={{ background: 'linear-gradient(135deg, #fff1f2 0%, #fff 60%)' }}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-100 text-rose-600 rounded-xl shadow-sm">
              <MinusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base leading-tight">
                {isEditing ? 'Edit Expense' : 'Record New Expense'}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {isEditing ? 'Update the details below' : 'Fill in the expense details below'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-rose-50 rounded-xl transition-all active:scale-95"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Form ── */}
        <form onSubmit={handleSubmit} noValidate className="px-6 py-5 space-y-5 overflow-y-auto flex-1">

          {/* Amount */}
          <motion.div custom={0} variants={fieldVariants} initial="hidden" animate="visible">
            <label htmlFor="expense-amount" className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">
              Amount (₱) <span className="text-rose-500">*</span>
            </label>
            <div className={`flex items-center rounded-xl border-2 transition-all bg-slate-50 overflow-hidden ${
              errors.amount ? 'border-rose-400 ring-2 ring-rose-400/15' : 'border-slate-200 focus-within:border-rose-400 focus-within:ring-2 focus-within:ring-rose-400/10'
            }`}>
              <span className="pl-4 pr-2 text-rose-500 font-black text-lg select-none">₱</span>
              <input
                id="expense-amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => { setAmount(e.target.value); setErrors((prev) => ({ ...prev, amount: '' })); }}
                className="flex-1 py-3 pr-4 text-xl font-bold text-slate-800 bg-transparent outline-none placeholder:text-slate-300"
                aria-invalid={Boolean(errors.amount)}
                aria-describedby={errors.amount ? 'amount-error' : undefined}
              />
            </div>
            <AnimatePresence>
              {errors.amount && (
                <motion.p
                  id="amount-error"
                  initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="mt-1.5 text-xs text-rose-500 font-medium flex items-center gap-1"
                >
                  {errors.amount}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Description */}
          <motion.div custom={1} variants={fieldVariants} initial="hidden" animate="visible">
            <label htmlFor="expense-desc" className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">
              <span className="flex items-center gap-1.5"><FileText className="w-3 h-3" /> Description <span className="text-rose-500">*</span></span>
            </label>
            <input
              id="expense-desc"
              type="text"
              placeholder="e.g. Grocery shopping at SM"
              value={description}
              onChange={(e) => { setDescription(e.target.value); setErrors((prev) => ({ ...prev, description: '' })); }}
              className={`w-full px-4 py-3 rounded-xl border-2 bg-slate-50 text-slate-800 text-sm placeholder:text-slate-300 outline-none transition-all ${
                errors.description
                  ? 'border-rose-400 ring-2 ring-rose-400/15'
                  : 'border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/10'
              }`}
              aria-invalid={Boolean(errors.description)}
              aria-describedby={errors.description ? 'desc-error' : undefined}
            />
            <AnimatePresence>
              {errors.description && (
                <motion.p id="desc-error" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="mt-1.5 text-xs text-rose-500 font-medium">
                  {errors.description}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Category */}
          <motion.div custom={2} variants={fieldVariants} initial="hidden" animate="visible">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">
              Category
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {EXPENSE_CATEGORIES.map((cat) => {
                const isSelected = category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`flex items-center gap-1.5 px-2.5 py-2 rounded-xl border-2 text-xs font-semibold transition-all duration-150 active:scale-95 ${
                      isSelected
                        ? `${CATEGORY_COLOR[cat]} ring-2 shadow-sm`
                        : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100 hover:border-slate-300'
                    }`}
                    aria-pressed={isSelected}
                  >
                    <span className="text-sm leading-none">{CATEGORY_EMOJI[cat]}</span>
                    <span className="truncate">{cat}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* Payment + Date + Time */}
          <motion.div custom={3} variants={fieldVariants} initial="hidden" animate="visible" className="space-y-3">
            {/* Payment Method */}
            <div>
              <label htmlFor="expense-payment" className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">
                <span className="flex items-center gap-1.5"><CreditCard className="w-3 h-3" /> Payment Method</span>
              </label>
              <select
                id="expense-payment"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-slate-50 text-slate-800 text-sm outline-none transition-all focus:border-blue-400 focus:ring-2 focus:ring-blue-400/10 appearance-none"
              >
                {PAYMENT_METHODS.map((pm) => (
                  <option key={pm} value={pm}>{pm}</option>
                ))}
              </select>
            </div>

            {/* Date & Time side-by-side */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="expense-date" className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">
                  <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3" /> Date <span className="text-rose-500">*</span></span>
                </label>
                <input
                  id="expense-date"
                  type="date"
                  required
                  value={date}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className={`w-full px-3 py-3 rounded-xl border-2 bg-slate-50 text-slate-800 text-sm outline-none transition-all ${
                    errors.date
                      ? 'border-rose-400 ring-2 ring-rose-400/15'
                      : 'border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/10'
                  }`}
                  aria-invalid={Boolean(errors.date)}
                />
                <AnimatePresence>
                  {errors.date && (
                    <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="mt-1.5 text-xs text-rose-500 font-medium">
                      {errors.date}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              <div>
                <label htmlFor="expense-time" className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3 h-3" /> Time
                    {isNewExpense && (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full leading-none">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                        Live
                      </span>
                    )}
                  </span>
                </label>
                <input
                  id="expense-time"
                  type="time"
                  value={time}
                  onChange={(e) => handleTimeChange(e.target.value)}
                  className="w-full px-3 py-3 rounded-xl border-2 border-slate-200 bg-slate-50 text-slate-800 text-sm outline-none transition-all focus:border-blue-400 focus:ring-2 focus:ring-blue-400/10"
                />
              </div>
            </div>
          </motion.div>

          {/* Receipt Upload */}
          <motion.div custom={4} variants={fieldVariants} initial="hidden" animate="visible">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">
              Receipt Image <span className="font-normal text-slate-400 normal-case">(Optional)</span>
            </label>
            <div className="flex items-center gap-3 flex-wrap">
              <label className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer transition-colors border-2 border-slate-200 hover:border-slate-300 active:scale-95">
                <Upload className="w-3.5 h-3.5" />
                {receiptUrl ? 'Replace Receipt' : 'Upload Receipt'}
                <input type="file" accept="image/*" onChange={handleReceiptUpload} className="hidden" />
              </label>
              <AnimatePresence mode="wait">
                {receiptUrl ? (
                  <motion.div key="attached" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                    className="flex items-center gap-2 text-xs text-emerald-700 font-semibold bg-emerald-50 px-3 py-2 rounded-xl border-2 border-emerald-200">
                    <ImageIcon className="w-3.5 h-3.5" />
                    Receipt Attached
                  </motion.div>
                ) : (
                  <motion.span key="none" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="text-xs text-slate-400">
                    No receipt chosen
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
            <AnimatePresence>
              {receiptUrl && (
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
                  className="mt-3 relative inline-block">
                  <div className="w-24 h-24 rounded-xl overflow-hidden border-2 border-slate-200 shadow-sm">
                    <img src={receiptUrl} alt="Receipt preview" className="w-full h-full object-cover" />
                  </div>
                  <button
                    type="button"
                    onClick={() => setReceiptUrl('')}
                    className="absolute -top-2 -right-2 p-1 bg-rose-500 text-white rounded-full hover:bg-rose-600 transition-colors shadow-md"
                    aria-label="Remove receipt"
                  >
                    <Trash2 className="w-2.5 h-2.5" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </form>

        {/* ── Footer ── */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/60 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border-2 border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95"
          >
            Cancel
          </button>
          <motion.button
            type="submit"
            form=""
            disabled={isSubmitting}
            onClick={handleSubmit}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-rose-500 hover:bg-rose-600 rounded-xl shadow-md shadow-rose-500/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed active:scale-95"
          >
            <Save className="w-4 h-4" />
            {isSubmitting ? 'Saving…' : isEditing ? 'Update Expense' : 'Add Expense'}
          </motion.button>
        </div>
      </div>
    </AnimatedModal>
  );
};
