export type IncomeSource = 'Salary' | 'Freelance' | 'Business' | 'Bonus' | 'Allowance' | 'Other';

export type ExpenseCategory =
  | 'Food'
  | 'Transportation'
  | 'Bills'
  | 'Shopping'
  | 'Entertainment'
  | 'Health'
  | 'Education'
  | 'Travel'
  | 'Miscellaneous';

export type PaymentMethod =
  | 'Cash'
  | 'Credit Card'
  | 'Debit Card'
  | 'Bank Transfer'
  | 'E-Wallet';

/** Monthly salary record — one per calendar month/year. */
export interface SalaryRecord {
  id: string;        // e.g. "sal-2026-6"
  month: number;     // 0 = January … 11 = December
  year: number;
  amount: number;
  notes?: string;
  updated_at: string; // ISO timestamp
}

/** Monthly budget limit — one per calendar month/year. */
export interface BudgetRecord {
  id: string;        // e.g. "bud-2026-6"
  month: number;     // 0 = January … 11 = December
  year: number;
  amount: number;
  updated_at: string; // ISO timestamp
}

/** A single savings ledger entry (global, not per-month). */
export interface SavingsRecord {
  id: string;
  /** Positive = deposit into savings, negative = withdrawal from savings. */
  amount: number;
  description: string;
  date: string;       // YYYY-MM-DD
  notes?: string;
  created_at: string; // ISO timestamp
}

export interface IncomeRecord {
  id: string;
  amount: number;
  date: string; // YYYY-MM-DD
  source: IncomeSource;
  notes?: string;
  created_at?: string;
}

export interface ExpenseRecord {
  id: string;
  amount: number;
  date: string; // YYYY-MM-DD
  category: ExpenseCategory;
  payment_method: PaymentMethod;
  description: string;
  receipt_url?: string;
  created_at?: string;
}

export interface FinancialSummary {
  /** Sum of all income records in the filtered period */
  totalIncome: number;
  totalExpenses: number;
  /** Salary (if set) minus total expenses for the period */
  remainingBalance: number;
  /** monthlySalary for the active month/year (0 if not set) */
  monthlySalary: number;
  /** Salary − Expenses (only meaningful when a salary is set) */
  salaryBalance: number;
  /** Auto-calculated savings (max(0, remainingBalance)) */
  totalSavings: number;
  /** Manually entered savings for this period (0 if not set) */
  manualSavings: number;
  savingsRate: number;
}

export interface FilterState {
  month: number; // 0 (Jan) to 11 (Dec), or -1 for All
  year: number;  // e.g., 2026
  searchQuery: string;
  category: ExpenseCategory | 'All';
  paymentMethod: PaymentMethod | 'All';
  incomeSource: IncomeSource | 'All';
  transactionType: 'All' | 'income' | 'expense';
  sortBy: 'newest' | 'oldest' | 'highest' | 'lowest';
}

export interface BackupData {
  version: string;
  exportedAt: string;
  incomes: IncomeRecord[];
  expenses: ExpenseRecord[];
  salaries?: SalaryRecord[];
  savings?: SavingsRecord[];
}
