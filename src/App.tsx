import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { FinanceProvider } from './context/FinanceContext';
import { Navbar } from './components/Navbar';
import { ToastContainer } from './components/Toast';
import { DashboardView } from './views/DashboardView';
import { IncomeView } from './views/IncomeView';
import { ExpensesView } from './views/ExpensesView';
import { HistoryView } from './views/HistoryView';
import { ReportsView } from './views/ReportsView';
import { SalaryView } from './views/SalaryView';
import { SavingsView } from './views/SavingsView';
import { SettingsView } from './views/SettingsView';
import { IncomeModal } from './components/IncomeModal';
import { ExpenseModal } from './components/ExpenseModal';
import type { IncomeRecord, ExpenseRecord } from './types/finance';

const MainLayout: React.FC = () => {
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  const [editingIncome, setEditingIncome] = useState<IncomeRecord | null>(null);
  const [editingExpense, setEditingExpense] = useState<ExpenseRecord | null>(null);

  const handleOpenAddIncome = () => {
    setEditingIncome(null);
    setIsIncomeModalOpen(true);
  };

  const handleEditIncome = (record: IncomeRecord) => {
    setEditingIncome(record);
    setIsIncomeModalOpen(true);
  };

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
      <Navbar
        onOpenIncomeModal={handleOpenAddIncome}
        onOpenExpenseModal={handleOpenAddExpense}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 page-enter">
        <Routes>
          <Route
            path="/"
            element={
              <DashboardView
                onOpenIncomeModal={handleOpenAddIncome}
                onOpenExpenseModal={handleOpenAddExpense}
              />
            }
          />
          <Route
            path="/income"
            element={
              <IncomeView
                onOpenAddModal={handleOpenAddIncome}
                onEditIncome={handleEditIncome}
              />
            }
          />
          <Route
            path="/expenses"
            element={
              <ExpensesView
                onOpenAddModal={handleOpenAddExpense}
                onEditExpense={handleEditExpense}
              />
            }
          />
          <Route
            path="/history"
            element={
              <HistoryView
                onEditIncome={handleEditIncome}
                onEditExpense={handleEditExpense}
              />
            }
          />
          <Route path="/salary" element={<SalaryView />} />
          <Route path="/savings" element={<SavingsView />} />
          <Route path="/reports" element={<ReportsView />} />
          <Route path="/settings" element={<SettingsView />} />
        </Routes>
      </main>

      <footer className="border-t border-slate-100 py-4 text-center text-xs text-slate-300">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <span>Personal Financial Hub &copy; {new Date().getFullYear()}</span>
          <span>100% local · no cloud · privacy-first</span>
        </div>
      </footer>

      <IncomeModal
        isOpen={isIncomeModalOpen}
        onClose={() => setIsIncomeModalOpen(false)}
        initialData={editingIncome}
      />

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
    <FinanceProvider>
      <BrowserRouter>
        <MainLayout />
      </BrowserRouter>
    </FinanceProvider>
  );
}
