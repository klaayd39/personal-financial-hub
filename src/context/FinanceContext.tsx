import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type {
  IncomeRecord,
  ExpenseRecord,
  SalaryRecord,
  SavingsRecord,
  BudgetRecord,
  BillRecord,
  FinancialSummary,
  FilterState,
} from '../types/finance';
import { supabaseService } from '../services/supabaseService';
import { storageService } from '../services/storageService'; // keep for export

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
  budgets: BudgetRecord[];
  bills: BillRecord[];
  filteredIncomes: IncomeRecord[];
  filteredExpenses: ExpenseRecord[];
  summary: FinancialSummary;
  filter: FilterState;
  toasts: ToastMessage[];
  isLoading: boolean;

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
  setSalary: (month: number, year: number, amount: number, notes?: string) => Promise<void>;
  deleteSalary: (id: string) => Promise<void>;
  getSalaryForPeriod: (month: number, year: number) => SalaryRecord | undefined;

  // Budget CRUD
  setBudget: (
    month: number,
    year: number,
    amount: number,
    firstHalfAmount?: number,
    secondHalfAmount?: number
  ) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
  getBudgetForPeriod: (month: number, year: number) => BudgetRecord | undefined;

  // Bills CRUD
  addBill: (record: Omit<BillRecord, 'id'>) => Promise<void>;
  updateBill: (id: string, record: Partial<BillRecord>) => Promise<void>;
  deleteBill: (id: string) => Promise<void>;
  toggleBillPaid: (id: string) => Promise<void>;

  // Savings CRUD (global ledger entries)
  addSavingsEntry: (entry: Omit<SavingsRecord, 'id' | 'created_at'>) => Promise<void>;
  updateSavingsEntry: (id: string, entry: Partial<Omit<SavingsRecord, 'id' | 'created_at'>>) => Promise<void>;
  deleteSavingsEntry: (id: string) => Promise<void>;

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
  const [isLoading, setIsLoading] = useState(true);

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

  // ── Records State (backed by Supabase) ────────────────────────────
  const [incomes, setIncomes] = useState<IncomeRecord[]>([]);
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [salaries, setSalaries] = useState<SalaryRecord[]>([]);
  const [savingsRecords, setSavingsRecords] = useState<SavingsRecord[]>([]);
  const [budgets, setBudgets] = useState<BudgetRecord[]>([]);
  const [bills, setBills] = useState<BillRecord[]>([]);

  useEffect(() => {
    let isMounted = true;
    const fetchInitialData = async () => {
      try {
        const [inc, exp, sal, sav, bud, bls] = await Promise.all([
          supabaseService.fetchIncomes(),
          supabaseService.fetchExpenses(),
          supabaseService.fetchSalaries(),
          supabaseService.fetchSavings(),
          supabaseService.fetchBudgets(),
          supabaseService.fetchBills(),
        ]);
        if (isMounted) {
          setIncomes(inc);
          setExpenses(exp);
          setSalaries(sal);
          setSavingsRecords(sav);
          setBudgets(bud);
          setBills(bls);
        }
      } catch (err: any) {
        showToast('Error loading data: ' + err.message, 'error');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchInitialData();
    return () => { isMounted = false; };
  }, []);

  // ── Toast System ──────────────────────────────────────────────────────
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => removeToast(id), 4000);
  };
  const removeToast = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));

  // ── Income CRUD ───────────────────────────────────────────────────────
  const addIncome = async (record: Omit<IncomeRecord, 'id'>) => {
    try {
      // Remove local id generation, let DB or service handle it (wait, our schema needs id! UUID generation will be needed if we didn't specify default gen_random_uuid() in schema. Wait, schema is TEXT PRIMARY KEY. Let's pass the id.)
      const newRecord = { ...record, id: 'inc-' + Date.now() };
      const saved = await supabaseService.addIncome(newRecord);
      setIncomes((prev) => [saved, ...prev]);
      showToast('Income record added', 'success');
    } catch (err: any) {
      showToast('Failed to add income: ' + err.message, 'error');
    }
  };
  const updateIncome = async (id: string, updated: Partial<IncomeRecord>) => {
    try {
      await supabaseService.updateIncome(id, updated);
      setIncomes((prev) => prev.map((item) => (item.id === id ? { ...item, ...updated } : item)));
      showToast('Income record updated', 'success');
    } catch (err: any) {
      showToast('Failed to update income: ' + err.message, 'error');
    }
  };
  const deleteIncome = async (id: string) => {
    try {
      await supabaseService.deleteIncome(id);
      setIncomes((prev) => prev.filter((item) => item.id !== id));
      showToast('Income record removed', 'info');
    } catch (err: any) {
      showToast('Failed to delete income: ' + err.message, 'error');
    }
  };

  // ── Expense CRUD ──────────────────────────────────────────────────────
  const addExpense = async (record: Omit<ExpenseRecord, 'id'>) => {
    try {
      const newRecord = { ...record, id: 'exp-' + Date.now() };
      const saved = await supabaseService.addExpense(newRecord);
      setExpenses((prev) => [saved, ...prev]);
      showToast('Expense record added', 'success');
    } catch (err: any) {
      showToast('Failed to add expense: ' + err.message, 'error');
    }
  };
  const updateExpense = async (id: string, updated: Partial<ExpenseRecord>) => {
    try {
      await supabaseService.updateExpense(id, updated);
      setExpenses((prev) => prev.map((item) => (item.id === id ? { ...item, ...updated } : item)));
      showToast('Expense record updated', 'success');
    } catch (err: any) {
      showToast('Failed to update expense: ' + err.message, 'error');
    }
  };
  const deleteExpense = async (id: string) => {
    try {
      await supabaseService.deleteExpense(id);
      setExpenses((prev) => prev.filter((item) => item.id !== id));
      showToast('Expense record removed', 'info');
    } catch (err: any) {
      showToast('Failed to delete expense: ' + err.message, 'error');
    }
  };

  // ── Salary CRUD ───────────────────────────────────────────────────────
  const setSalary = async (month: number, year: number, amount: number, notes?: string) => {
    const id = `sal-${year}-${month}`;
    const updated_at = new Date().toISOString();
    try {
      const saved = await supabaseService.upsertSalary({ id, month, year, amount, notes, updated_at });
      setSalaries((prev) => {
        const exists = prev.some((s) => s.id === id);
        if (exists) return prev.map((s) => (s.id === id ? saved : s));
        return [...prev, saved];
      });
      showToast('Salary saved', 'success');
    } catch (err: any) {
      showToast('Failed to set salary: ' + err.message, 'error');
    }
  };
  const deleteSalary = async (id: string) => {
    try {
      await supabaseService.deleteSalary(id);
      setSalaries((prev) => prev.filter((s) => s.id !== id));
      showToast('Salary record removed', 'info');
    } catch (err: any) {
      showToast('Failed to delete salary: ' + err.message, 'error');
    }
  };
  const getSalaryForPeriod = (month: number, year: number) =>
    salaries.find((s) => s.month === month && s.year === year);

  // ── Budget CRUD ───────────────────────────────────────────────────────
  const setBudget = async (
    month: number,
    year: number,
    amount: number,
    firstHalfAmount?: number,
    secondHalfAmount?: number
  ) => {
    const id = `bud-${year}-${month}`;
    const updated_at = new Date().toISOString();
    try {
      const saved = await supabaseService.upsertBudget({
        id,
        month,
        year,
        amount,
        first_half_amount: firstHalfAmount,
        second_half_amount: secondHalfAmount,
        updated_at,
      });
      setBudgets((prev) => {
        const exists = prev.some((b) => b.id === id);
        if (exists) return prev.map((b) => (b.id === id ? saved : b));
        return [...prev, saved];
      });
      showToast('Monthly budget saved', 'success');
    } catch (err: any) {
      showToast('Failed to set budget: ' + err.message, 'error');
    }
  };
  const deleteBudget = async (id: string) => {
    try {
      await supabaseService.deleteBudget(id);
      setBudgets((prev) => prev.filter((b) => b.id !== id));
      showToast('Budget record removed', 'info');
    } catch (err: any) {
      showToast('Failed to delete budget: ' + err.message, 'error');
    }
  };
  const getBudgetForPeriod = (month: number, year: number) =>
    budgets.find((b) => b.month === month && b.year === year);

  // ── Bills CRUD ────────────────────────────────────────────────────────
  const addBill = async (record: Omit<BillRecord, 'id'>) => {
    try {
      const newBill: BillRecord = {
        ...record,
        id: 'bill-' + Date.now(),
      };
      const saved = await supabaseService.addBill(newBill);
      setBills((prev) => [...prev, saved].sort((a, b) => a.due_day - b.due_day));
      showToast('Bill added successfully', 'success');
    } catch (err: any) {
      showToast('Failed to add bill: ' + err.message, 'error');
    }
  };

  const updateBill = async (id: string, updated: Partial<BillRecord>) => {
    try {
      await supabaseService.updateBill(id, updated);
      setBills((prev) =>
        prev
          .map((b) => (b.id === id ? { ...b, ...updated } : b))
          .sort((a, b) => a.due_day - b.due_day)
      );
      showToast('Bill updated', 'success');
    } catch (err: any) {
      showToast('Failed to update bill: ' + err.message, 'error');
    }
  };

  const deleteBill = async (id: string) => {
    const target = bills.find((b) => b.id === id);
    try {
      // If the bill was paid, remove its linked expense to restore salary
      if (target?.bill_expense_id) {
        try {
          await supabaseService.deleteExpense(target.bill_expense_id);
          setExpenses((prev) => prev.filter((e) => e.id !== target.bill_expense_id));
        } catch {
          // Expense may have been manually deleted; proceed
        }
      }
      await supabaseService.deleteBill(id);
      setBills((prev) => prev.filter((b) => b.id !== id));
      showToast('Bill removed', 'info');
    } catch (err: any) {
      showToast('Failed to delete bill: ' + err.message, 'error');
    }
  };

  const toggleBillPaid = async (id: string) => {
    const target = bills.find((b) => b.id === id);
    if (!target) return;
    const isNowPaid = !target.is_paid;

    try {
      if (isNowPaid) {
        // Guard: Check if linked expense already exists to prevent duplicates
        if (target.bill_expense_id) {
          const existingExp = expenses.find((e) => e.id === target.bill_expense_id);
          if (existingExp) {
            await supabaseService.updateBill(id, { is_paid: true });
            setBills((prev) => prev.map((b) => (b.id === id ? { ...b, is_paid: true } : b)));
            showToast('Bill marked as Paid (Linked expense already exists)', 'info');
            return;
          }
        }

        // Create a new corresponding expense record for this paid bill
        const today = new Date();
        const targetYear = target.year !== undefined && target.year !== null
          ? target.year
          : filter.month !== -1
          ? filter.year
          : today.getFullYear();

        const targetMonth = target.month !== undefined && target.month !== null
          ? target.month
          : filter.month !== -1
          ? filter.month
          : today.getMonth();

        const daysInMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
        const targetDay = Math.min(Math.max(1, target.due_day || today.getDate()), daysInMonth);

        const monthStr = String(targetMonth + 1).padStart(2, '0');
        const dayStr = String(targetDay).padStart(2, '0');
        const dateStr = `${targetYear}-${monthStr}-${dayStr}`;

        const expenseId = 'exp-bill-' + Date.now();
        const newExpense: Omit<ExpenseRecord, 'created_at'> = {
          id: expenseId,
          amount: target.amount,
          date: dateStr,
          category: 'Bills' as const,
          payment_method: 'Bank Transfer' as const,
          description: target.notes
            ? `Bill Payment: ${target.name} (${target.notes})`
            : `Bill Payment: ${target.name}`,
          notes: target.notes
            ? `[Ref ID: ${target.id}] ${target.notes}`
            : `[Ref ID: ${target.id}] Auto-generated bill payment`,
        };

        const savedExpense = await supabaseService.addExpense(newExpense);
        setExpenses((prev) => [savedExpense, ...prev]);

        // Update bill: mark paid + store the linked expense reference ID
        await supabaseService.updateBill(id, { is_paid: true, bill_expense_id: savedExpense.id });
        setBills((prev) =>
          prev.map((b) => (b.id === id ? { ...b, is_paid: true, bill_expense_id: savedExpense.id } : b))
        );
        showToast(`✓ ${target.name} marked as Paid — expense created & totals updated`, 'success');
      } else {
        // Unmark paid: delete the linked expense if it exists
        if (target.bill_expense_id) {
          try {
            await supabaseService.deleteExpense(target.bill_expense_id);
            setExpenses((prev) => prev.filter((e) => e.id !== target.bill_expense_id));
          } catch {
            // Expense may have been manually deleted; proceed
          }
        }

        // Update bill: mark unpaid + clear expense reference
        await supabaseService.updateBill(id, { is_paid: false, bill_expense_id: null });
        setBills((prev) =>
          prev.map((b) => (b.id === id ? { ...b, is_paid: false, bill_expense_id: null } : b))
        );
        showToast(`↩ ${target.name} marked as Unpaid — expense removed & totals updated`, 'info');
      }
    } catch (err: any) {
      showToast('Failed to update bill status: ' + err.message, 'error');
    }
  };

  // ── Savings CRUD (global ledger) ──────────────────────────────────────
  const addSavingsEntry = async (entry: Omit<SavingsRecord, 'id' | 'created_at'>) => {
    try {
      const newEntry = {
        ...entry,
        id: 'sav-' + Date.now(),
      };
      const saved = await supabaseService.addSavingsEntry(newEntry);
      setSavingsRecords((prev) => [saved, ...prev]);
      showToast('Savings entry added', 'success');
    } catch (err: any) {
      showToast('Failed to add savings entry: ' + err.message, 'error');
    }
  };

  const updateSavingsEntry = async (
    id: string,
    updated: Partial<Omit<SavingsRecord, 'id' | 'created_at'>>,
  ) => {
    try {
      await supabaseService.updateSavingsEntry(id, updated);
      setSavingsRecords((prev) =>
        prev.map((s) => (s.id === id ? { ...s, ...updated } : s)),
      );
      showToast('Savings entry updated', 'success');
    } catch (err: any) {
      showToast('Failed to update savings entry: ' + err.message, 'error');
    }
  };

  const deleteSavingsEntry = async (id: string) => {
    try {
      await supabaseService.deleteSavingsEntry(id);
      setSavingsRecords((prev) => prev.filter((s) => s.id !== id));
      showToast('Savings entry removed', 'info');
    } catch (err: any) {
      showToast('Failed to delete savings entry: ' + err.message, 'error');
    }
  };

  // ── Backup / Import / Export ──────────────────────────────────────────
  const exportDataJSON = () => {
    storageService.exportBackupJSON(incomes, expenses, salaries, savingsRecords);
    showToast('Data exported successfully', 'success');
  };

  const importDataJSON = async (jsonText: string) => {
    try {
      const backup = storageService.validateAndImportJSON(jsonText);
      
      // We will perform naive bulk inserts for simplicity (skipping for now in UI if they prefer)
      // Actually we'll just loop and insert to Supabase. This can be slow, but it works.
      setIsLoading(true);
      await Promise.all([
        ...backup.incomes.map(i => supabaseService.addIncome(i)),
        ...backup.expenses.map(e => supabaseService.addExpense(e)),
        ...(backup.salaries || []).map(s => supabaseService.upsertSalary(s)),
        ...(backup.savings || []).map(s => supabaseService.addSavingsEntry(s))
      ]);
      
      // Re-fetch everything
      const [inc, exp, sal, sav] = await Promise.all([
        supabaseService.fetchIncomes(),
        supabaseService.fetchExpenses(),
        supabaseService.fetchSalaries(),
        supabaseService.fetchSavings()
      ]);
      setIncomes(inc);
      setExpenses(exp);
      setSalaries(sal);
      setSavingsRecords(sav);
      
      showToast(
        `Imported ${backup.incomes.length} income${backup.incomes.length !== 1 ? 's' : ''} & ${backup.expenses.length} expense${backup.expenses.length !== 1 ? 's' : ''}`,
        'success',
      );
    } catch (err: any) {
      showToast('Import failed: ' + (err.message || 'Invalid JSON format'), 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const clearAllData = async () => {
    setIsLoading(true);
    try {
      // Very crude way to delete all local state records from Supabase
      await Promise.all([
        ...incomes.map(i => supabaseService.deleteIncome(i.id)),
        ...expenses.map(e => supabaseService.deleteExpense(e.id)),
        ...salaries.map(s => supabaseService.deleteSalary(s.id)),
        ...savingsRecords.map(s => supabaseService.deleteSavingsEntry(s.id))
      ]);
      setIncomes([]);
      setExpenses([]);
      setSalaries([]);
      setSavingsRecords([]);
      showToast('All financial records cleared', 'info');
    } catch (err: any) {
      showToast('Clear failed: ' + err.message, 'error');
    } finally {
      setIsLoading(false);
    }
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

    // totalSavings: sum of savings entries only (0 if none added)
    const totalSavings = manualSavings;

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
        budgets,
        bills,
        filteredIncomes,
        filteredExpenses,
        summary,
        filter,
        toasts,
        isLoading,
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
        setBudget,
        deleteBudget,
        getBudgetForPeriod,
        addBill,
        updateBill,
        deleteBill,
        toggleBillPaid,
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
