import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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
import type { ExpenseRecord } from './types/finance';

const MainLayout: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { isLoading: financeLoading } = useFinance();
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseRecord | null>(null);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>
          <p className="text-xs font-medium text-slate-400">Authenticating...</p>
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
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased selection:bg-brand-100 selection:text-brand-900">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 page-enter relative">
        {financeLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-50/50 backdrop-blur-sm z-50">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin"></div>
              <p className="text-sm font-medium text-slate-500">Loading financial data...</p>
            </div>
          </div>
        ) : null}
        <Routes>
          <Route path="/" element={<DashboardView />} />
          <Route
            path="/expenses"
            element={
              <ExpensesView
                onOpenAddModal={handleOpenAddExpense}
                onEditExpense={handleEditExpense}
              />
            }
          />
          <Route path="/salary" element={<SalaryView />} />
          <Route path="/budget" element={<BudgetView />} />
          <Route path="/bills" element={<BillsView />} />
          <Route path="/savings" element={<SavingsView />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <footer className="border-t border-slate-100 py-4 text-center text-xs text-slate-300">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <span>Personal Financial Hub &copy; {new Date().getFullYear()}</span>
          <span>Encrypted · Secure Auth</span>
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
