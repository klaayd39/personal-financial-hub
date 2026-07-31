import type { IncomeRecord, ExpenseRecord, SalaryRecord, SavingsRecord, BackupData } from '../types/finance';

// v3 keys — bumped from v2 to clear any previously cached sample/demo data
const STORAGE_KEY_INCOMES   = 'pfh_local_incomes_v3';
const STORAGE_KEY_EXPENSES  = 'pfh_local_expenses_v3';
const STORAGE_KEY_SALARIES  = 'pfh_local_salaries_v1';
const STORAGE_KEY_SAVINGS   = 'pfh_local_savings_v1';

export const storageService = {
  // ── Incomes ──────────────────────────────────────────────────────────
  getIncomes(): IncomeRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_INCOMES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  saveIncomes(incomes: IncomeRecord[]): void {
    localStorage.setItem(STORAGE_KEY_INCOMES, JSON.stringify(incomes));
  },

  // ── Expenses ─────────────────────────────────────────────────────────
  getExpenses(): ExpenseRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_EXPENSES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  saveExpenses(expenses: ExpenseRecord[]): void {
    localStorage.setItem(STORAGE_KEY_EXPENSES, JSON.stringify(expenses));
  },

  // ── Salaries ─────────────────────────────────────────────────────────
  getSalaries(): SalaryRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_SALARIES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  saveSalaries(salaries: SalaryRecord[]): void {
    localStorage.setItem(STORAGE_KEY_SALARIES, JSON.stringify(salaries));
  },

  // ── Savings ────────────────────────────────────────────────
  getSavingsRecords(): SavingsRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_SAVINGS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  saveSavingsRecords(savings: SavingsRecord[]): void {
    localStorage.setItem(STORAGE_KEY_SAVINGS, JSON.stringify(savings));
  },

  // ── Backup / Restore ──────────────────────────────────────────────────
  exportBackupJSON(
    incomes: IncomeRecord[],
    expenses: ExpenseRecord[],
    salaries: SalaryRecord[],
    savings: SavingsRecord[],
  ): void {
    const backup: BackupData = {
      version: '3.2.0',
      exportedAt: new Date().toISOString(),
      incomes,
      expenses,
      salaries,
      savings,
    };
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(backup, null, 2));
    const a = document.createElement('a');
    a.setAttribute('href', dataStr);
    a.setAttribute(
      'download',
      `Personal_Finance_Backup_${new Date().toISOString().split('T')[0]}.json`,
    );
    document.body.appendChild(a);
    a.click();
    a.remove();
  },

  validateAndImportJSON(jsonText: string): BackupData {
    const parsed = JSON.parse(jsonText);
    if (!parsed || typeof parsed !== 'object') {
      throw new Error('Invalid JSON format.');
    }
    if (!Array.isArray(parsed.incomes) || !Array.isArray(parsed.expenses)) {
      throw new Error('Backup file must contain valid incomes and expenses arrays.');
    }
    return parsed as BackupData;
  },

  clearAllData(): void {
    localStorage.removeItem(STORAGE_KEY_INCOMES);
    localStorage.removeItem(STORAGE_KEY_EXPENSES);
    localStorage.removeItem(STORAGE_KEY_SALARIES);
    localStorage.removeItem(STORAGE_KEY_SAVINGS);
  },
};
