import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type {
  IncomeRecord,
  ExpenseRecord,
  SalaryRecord,
  SavingsRecord,
  FinancialSummary,
  FilterState,
} from '../types/finance';
import { storageService } from '../services/storageService';

interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface FinanceContextType {
  incomes: IncomeRecord[];
  expenses: ExpenseRecord[];
  salaries: SalaryRecord[];
  savingsRecords: SavingsRecord[];
  filteredIncomes: IncomeRecord[];
  filteredExpenses: ExpenseRecord[];
  summary: FinancialSummary;
  filter: FilterState;
  toasts: ToastMessage[];

  // Filter
  setFilter: React.Dispatch<React.SetStateAction<FilterState>>;

  // Income CRUD
  addIncome: (record: Omit<IncomeRecord, 'id'>) => Promise<void>;
  updateIncome: (id: string, record: Partial<IncomeRecord>) => Promise<void>;
  deleteIncome: (id: string) => Promise<void>;

  // Expense CRUD
  addExpense: (record: Omit<ExpenseRecord, 'id'>) => Promise<void>;
  updateExpense: (id: string, record: Partial<ExpenseRecord>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;

  // Salary CRUD
  setSalary: (month: number, year: number, amount: number, notes?: string) => void;
  deleteSalary: (id: string) => void;
  getSalaryForPeriod: (month: number, year: number) => SalaryRecord | undefined;

  // Savings CRUD (global ledger entries)
  addSavingsEntry: (entry: Omit<SavingsRecord, 'id' | 'created_at'>) => void;
  updateSavingsEntry: (id: string, entry: Partial<Omit<SavingsRecord, 'id' | 'created_at'>>) => void;
  deleteSavingsEntry: (id: string) => void;

  // Data management
  exportDataJSON: () => void;
  importDataJSON: (jsonText: string) => void;
  clearAllData: () => void;

  // Toast
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const currentDate = new Date();
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // ── Filter State ──────────────────────────────────────────────────────
  const [filter, setFilter] = useState<FilterState>({
    month: currentDate.getMonth(),
    year: currentDate.getFullYear(),
    searchQuery: '',
    category: 'All',
    paymentMethod: 'All',
    incomeSource: 'All',
    transactionType: 'All',
    sortBy: 'newest',
  });

  // ── Records State (backed by LocalStorage) ────────────────────────────
  const [incomes, setIncomes] = useState<IncomeRecord[]>(() => storageService.getIncomes());
  const [expenses, setExpenses] = useState<ExpenseRecord[]>(() => storageService.getExpenses());
  const [salaries, setSalaries] = useState<SalaryRecord[]>(() => storageService.getSalaries());
  const [savingsRecords, setSavingsRecords] = useState<SavingsRecord[]>(
    () => storageService.getSavingsRecords(),
  );

  useEffect(() => { storageService.saveIncomes(incomes); }, [incomes]);
  useEffect(() => { storageService.saveExpenses(expenses); }, [expenses]);
  useEffect(() => { storageService.saveSalaries(salaries); }, [salaries]);
  useEffect(() => { storageService.saveSavingsRecords(savingsRecords); }, [savingsRecords]);

  // ── Toast System ──────────────────────────────────────────────────────
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => removeToast(id), 4000);
  };
  const removeToast = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));

  // ── Income CRUD ───────────────────────────────────────────────────────
  const addIncome = async (record: Omit<IncomeRecord, 'id'>) => {
    setIncomes((prev) => [{ ...record, id: 'inc-' + Date.now() }, ...prev]);
    showToast('Income record added', 'success');
  };
  const updateIncome = async (id: string, updated: Partial<IncomeRecord>) => {
    setIncomes((prev) => prev.map((item) => (item.id === id ? { ...item, ...updated } : item)));
    showToast('Income record updated', 'success');
  };
  const deleteIncome = async (id: string) => {
    setIncomes((prev) => prev.filter((item) => item.id !== id));
    showToast('Income record removed', 'info');
  };

  // ── Expense CRUD ──────────────────────────────────────────────────────
  const addExpense = async (record: Omit<ExpenseRecord, 'id'>) => {
    setExpenses((prev) => [{ ...record, id: 'exp-' + Date.now() }, ...prev]);
    showToast('Expense record added', 'success');
  };
  const updateExpense = async (id: string, updated: Partial<ExpenseRecord>) => {
    setExpenses((prev) => prev.map((item) => (item.id === id ? { ...item, ...updated } : item)));
    showToast('Expense record updated', 'success');
  };
  const deleteExpense = async (id: string) => {
    setExpenses((prev) => prev.filter((item) => item.id !== id));
    showToast('Expense record removed', 'info');
  };

  // ── Salary CRUD ───────────────────────────────────────────────────────
  const setSalary = (month: number, year: number, amount: number, notes?: string) => {
    const id = `sal-${year}-${month}`;
    const updated_at = new Date().toISOString();
    setSalaries((prev) => {
      const exists = prev.some((s) => s.id === id);
      if (exists) return prev.map((s) => (s.id === id ? { ...s, amount, notes, updated_at } : s));
      return [...prev, { id, month, year, amount, notes, updated_at }];
    });
    showToast('Salary saved', 'success');
  };
  const deleteSalary = (id: string) => {
    setSalaries((prev) => prev.filter((s) => s.id !== id));
    showToast('Salary record removed', 'info');
  };
  const getSalaryForPeriod = (month: number, year: number) =>
    salaries.find((s) => s.month === month && s.year === year);

  // ── Savings CRUD (global ledger) ──────────────────────────────────────
  const addSavingsEntry = (entry: Omit<SavingsRecord, 'id' | 'created_at'>) => {
    const newEntry: SavingsRecord = {
      ...entry,
      id: 'sav-' + Date.now(),
      created_at: new Date().toISOString(),
    };
    setSavingsRecords((prev) => [newEntry, ...prev]);
    showToast('Savings entry added', 'success');
  };

  const updateSavingsEntry = (
    id: string,
    updated: Partial<Omit<SavingsRecord, 'id' | 'created_at'>>,
  ) => {
    setSavingsRecords((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updated } : s)),
    );
    showToast('Savings entry updated', 'success');
  };

  const deleteSavingsEntry = (id: string) => {
    setSavingsRecords((prev) => prev.filter((s) => s.id !== id));
    showToast('Savings entry removed', 'info');
  };

  // ── Backup / Import / Export ──────────────────────────────────────────
  const exportDataJSON = () => {
    storageService.exportBackupJSON(incomes, expenses, salaries, savingsRecords);
    showToast('Data exported successfully', 'success');
  };

  const importDataJSON = (jsonText: string) => {
    try {
      const backup = storageService.validateAndImportJSON(jsonText);
      setIncomes(backup.incomes);
      setExpenses(backup.expenses);
      if (backup.salaries) setSalaries(backup.salaries);
      if (backup.savings) setSavingsRecords(backup.savings);
      showToast(
        `Imported ${backup.incomes.length} income${backup.incomes.length !== 1 ? 's' : ''} & ${backup.expenses.length} expense${backup.expenses.length !== 1 ? 's' : ''}`,
        'success',
      );
    } catch (err: any) {
      showToast('Import failed: ' + (err.message || 'Invalid JSON format'), 'error');
    }
  };

  const clearAllData = () => {
    storageService.clearAllData();
    setIncomes([]);
    setExpenses([]);
    setSalaries([]);
    setSavingsRecords([]);
    showToast('All financial records cleared', 'info');
  };

  // ── Filtering ─────────────────────────────────────────────────────────
  const filteredIncomes = useMemo(() => {
    return incomes
      .filter((inc) => {
        const d = new Date(inc.date + 'T00:00:00');
        const matchMonth = filter.month === -1 || d.getMonth() === filter.month;
        const matchYear = d.getFullYear() === filter.year;
        const matchSource = filter.incomeSource === 'All' || inc.source === filter.incomeSource;
        const matchSearch =
          !filter.searchQuery ||
          inc.source.toLowerCase().includes(filter.searchQuery.toLowerCase()) ||
          (inc.notes && inc.notes.toLowerCase().includes(filter.searchQuery.toLowerCase()));
        return matchMonth && matchYear && matchSource && matchSearch;
      })
      .sort((a, b) => {
        if (filter.sortBy === 'newest') return new Date(b.date).getTime() - new Date(a.date).getTime();
        if (filter.sortBy === 'oldest') return new Date(a.date).getTime() - new Date(b.date).getTime();
        if (filter.sortBy === 'highest') return b.amount - a.amount;
        if (filter.sortBy === 'lowest') return a.amount - b.amount;
        return 0;
      });
  }, [incomes, filter]);

  const filteredExpenses = useMemo(() => {
    return expenses
      .filter((exp) => {
        const d = new Date(exp.date + 'T00:00:00');
        const matchMonth = filter.month === -1 || d.getMonth() === filter.month;
        const matchYear = d.getFullYear() === filter.year;
        const matchCategory = filter.category === 'All' || exp.category === filter.category;
        const matchPayment = filter.paymentMethod === 'All' || exp.payment_method === filter.paymentMethod;
        const matchSearch =
          !filter.searchQuery ||
          exp.description.toLowerCase().includes(filter.searchQuery.toLowerCase()) ||
          exp.category.toLowerCase().includes(filter.searchQuery.toLowerCase()) ||
          exp.payment_method.toLowerCase().includes(filter.searchQuery.toLowerCase());
        return matchMonth && matchYear && matchCategory && matchPayment && matchSearch;
      })
      .sort((a, b) => {
        if (filter.sortBy === 'newest') return new Date(b.date).getTime() - new Date(a.date).getTime();
        if (filter.sortBy === 'oldest') return new Date(a.date).getTime() - new Date(b.date).getTime();
        if (filter.sortBy === 'highest') return b.amount - a.amount;
        if (filter.sortBy === 'lowest') return a.amount - b.amount;
        return 0;
      });
  }, [expenses, filter]);

  // ── Financial Summary ─────────────────────────────────────────────────
  const summary = useMemo<FinancialSummary>(() => {
    const totalIncome   = filteredIncomes.reduce((acc, cur) => acc + cur.amount, 0);
    const totalExpenses = filteredExpenses.reduce((acc, cur) => acc + cur.amount, 0);

    // Salary for the exact selected month
    const salaryRecord =
      filter.month !== -1
        ? salaries.find((s) => s.month === filter.month && s.year === filter.year)
        : undefined;
    const monthlySalary = salaryRecord?.amount ?? 0;

    const salaryBalance    = monthlySalary - totalExpenses;
    const remainingBalance = monthlySalary > 0 ? salaryBalance : totalIncome - totalExpenses;

    // Global total savings = sum of ALL savings entries (not month-filtered)
    const manualSavings = savingsRecords.reduce((sum, s) => sum + s.amount, 0);

    // totalSavings: global manual total if any entries exist, else auto-calculated
    const totalSavings = savingsRecords.length > 0
      ? manualSavings
      : Math.max(0, remainingBalance);

    const base        = monthlySalary > 0 ? monthlySalary : totalIncome;
    const savingsRate = base > 0 ? (totalSavings / base) * 100 : 0;

    return {
      totalIncome,
      totalExpenses,
      remainingBalance,
      monthlySalary,
      salaryBalance,
      totalSavings,
      manualSavings,
      savingsRate,
    };
  }, [filteredIncomes, filteredExpenses, salaries, savingsRecords, filter]);

  return (
    <FinanceContext.Provider
      value={{
        incomes,
        expenses,
        salaries,
        savingsRecords,
        filteredIncomes,
        filteredExpenses,
        summary,
        filter,
        toasts,
        setFilter,
        addIncome,
        updateIncome,
        deleteIncome,
        addExpense,
        updateExpense,
        deleteExpense,
        setSalary,
        deleteSalary,
        getSalaryForPeriod,
        addSavingsEntry,
        updateSavingsEntry,
        deleteSavingsEntry,
        exportDataJSON,
        importDataJSON,
        clearAllData,
        showToast,
        removeToast,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) throw new Error('useFinance must be used within a FinanceProvider');
  return context;
};
