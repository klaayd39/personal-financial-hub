import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { Navbar } from './components/Navbar';
import { ToastContainer } from './components/Toast';
import { DashboardView } from './views/DashboardView';
import { ExpensesView } from './views/ExpensesView';
import { SalaryView } from './views/SalaryView';
import { SavingsView } from './views/SavingsView';
import { BudgetView } from './views/BudgetView';
import { BillsView } from './views/BillsView';
import { AuthView } from './views/AuthView';
import { ExpenseModal } from './components/ExpenseModal';
import { DashboardSkeleton } from './components/SkeletonLoader';
import type { ExpenseRecord } from './types/finance';

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

const pageTransition = {
  duration: 0.25,
  ease: [0.16, 1, 0.3, 1] as const,
};

/** Animated page wrapper — used for route-level transitions */
const PageWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <motion.div
    variants={pageVariants}
    initial="initial"
    animate="animate"
    exit="exit"
    transition={pageTransition}
  >
    {children}
  </motion.div>
);

/** Inner layout requires access to location for AnimatePresence key */
const AnimatedRoutes: React.FC<{
  onOpenAddModal: () => void;
  onEditExpense: (r: ExpenseRecord) => void;
}> = ({ onOpenAddModal, onEditExpense }) => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageWrapper><DashboardView /></PageWrapper>} />
        <Route
          path="/expenses"
          element={
            <PageWrapper>
              <ExpensesView onOpenAddModal={onOpenAddModal} onEditExpense={onEditExpense} />
            </PageWrapper>
          }
        />
        <Route path="/salary" element={<PageWrapper><SalaryView /></PageWrapper>} />
        <Route path="/budget" element={<PageWrapper><BudgetView /></PageWrapper>} />
        <Route path="/bills" element={<PageWrapper><BillsView /></PageWrapper>} />
        <Route path="/savings" element={<PageWrapper><SavingsView /></PageWrapper>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
};

const MainLayout: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { isLoading: financeLoading } = useFinance();
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseRecord | null>(null);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-xs font-medium text-slate-400">Authenticating…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthView />;
  }

  const handleOpenAddExpense = () => {
    setEditingExpense(null);
    setIsExpenseModalOpen(true);
  };

  const handleEditExpense = (record: ExpenseRecord) => {
    setEditingExpense(record);
    setIsExpenseModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased selection:bg-blue-100 selection:text-blue-900">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 relative">
        {financeLoading ? (
          <DashboardSkeleton />
        ) : (
          <AnimatedRoutes
            onOpenAddModal={handleOpenAddExpense}
            onEditExpense={handleEditExpense}
          />
        )}
      </main>

      <footer className="border-t border-slate-100 py-4 text-center text-xs text-slate-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
              <span className="text-white text-[8px] font-black">F</span>
            </div>
            <span className="font-medium text-slate-400">FinanceHub</span>
            <span className="text-slate-200">·</span>
            <span>© {new Date().getFullYear()}</span>
          </div>
          <span className="hidden sm:inline text-slate-300">🔐 Encrypted · Secure Auth</span>
        </div>
      </footer>

      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        initialData={editingExpense}
      />

      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <FinanceProvider>
        <BrowserRouter>
          <MainLayout />
        </BrowserRouter>
      </FinanceProvider>
    </AuthProvider>
  );
}
