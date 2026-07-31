import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFinance } from '../context/FinanceContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const toastVariants = {
  initial: { opacity: 0, x: 60, scale: 0.95 },
  animate: { opacity: 1, x: 0, scale: 1 },
  exit: { opacity: 0, x: 60, scale: 0.92, transition: { duration: 0.2 } },
};

const config = {
  success: {
    icon: CheckCircle2,
    classes: 'bg-white border-emerald-200 text-slate-800',
    iconClass: 'text-emerald-500',
    bar: 'bg-emerald-500',
  },
  error: {
    icon: AlertCircle,
    classes: 'bg-white border-rose-200 text-slate-800',
    iconClass: 'text-rose-500',
    bar: 'bg-rose-500',
  },
  info: {
    icon: Info,
    classes: 'bg-white border-blue-200 text-slate-800',
    iconClass: 'text-blue-500',
    bar: 'bg-blue-500',
  },
};

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useFinance();

  return (
    <div
      className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 max-w-sm w-full px-4 pointer-events-none"
      aria-live="polite"
      aria-atomic="false"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => {
          const { icon: Icon, classes, iconClass, bar } = config[toast.type];
          return (
            <motion.div
              key={toast.id}
              layout
              variants={toastVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              className={`pointer-events-auto relative flex items-start gap-3 p-4 pr-10 rounded-2xl shadow-lg border overflow-hidden ${classes}`}
              role="alert"
            >
              {/* Colored left bar */}
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${bar}`} />

              <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${iconClass}`} aria-hidden="true" />
              <span className="text-sm font-medium leading-snug flex-1 pl-1">{toast.message}</span>

              <button
                onClick={() => removeToast(toast.id)}
                className="absolute top-3 right-3 p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                aria-label="Dismiss notification"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
