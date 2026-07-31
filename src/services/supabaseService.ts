import { supabase } from '../lib/supabase';
import type { IncomeRecord, ExpenseRecord, SalaryRecord, SavingsRecord, BudgetRecord } from '../types/finance';

export const supabaseService = {
  // ── Incomes ──────────────────────────────────────────────────────────
  async fetchIncomes(): Promise<IncomeRecord[]> {
    if (!supabase) return [];
    const { data, error } = await supabase.from('incomes').select('*').order('date', { ascending: false });
    if (error) {
      console.error('Error fetching incomes:', error);
      throw error;
    }
    return data as IncomeRecord[];
  },
  async addIncome(record: Omit<IncomeRecord, 'id' | 'created_at'>): Promise<IncomeRecord> {
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error } = await supabase.from('incomes').insert([record]).select().single();
    if (error) throw error;
    return data as IncomeRecord;
  },
  async updateIncome(id: string, record: Partial<IncomeRecord>): Promise<void> {
    if (!supabase) throw new Error('Supabase not configured');
    const { error } = await supabase.from('incomes').update(record).eq('id', id);
    if (error) throw error;
  },
  async deleteIncome(id: string): Promise<void> {
    if (!supabase) throw new Error('Supabase not configured');
    const { error } = await supabase.from('incomes').delete().eq('id', id);
    if (error) throw error;
  },

  // ── Expenses ─────────────────────────────────────────────────────────
  async fetchExpenses(): Promise<ExpenseRecord[]> {
    if (!supabase) return [];
    const { data, error } = await supabase.from('expenses').select('*').order('date', { ascending: false });
    if (error) {
      console.error('Error fetching expenses:', error);
      throw error;
    }
    return data as ExpenseRecord[];
  },
  async addExpense(record: Omit<ExpenseRecord, 'id' | 'created_at'>): Promise<ExpenseRecord> {
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error } = await supabase.from('expenses').insert([record]).select().single();
    if (error) throw error;
    return data as ExpenseRecord;
  },
  async updateExpense(id: string, record: Partial<ExpenseRecord>): Promise<void> {
    if (!supabase) throw new Error('Supabase not configured');
    const { error } = await supabase.from('expenses').update(record).eq('id', id);
    if (error) throw error;
  },
  async deleteExpense(id: string): Promise<void> {
    if (!supabase) throw new Error('Supabase not configured');
    const { error } = await supabase.from('expenses').delete().eq('id', id);
    if (error) throw error;
  },

  // ── Salaries ─────────────────────────────────────────────────────────
  async fetchSalaries(): Promise<SalaryRecord[]> {
    if (!supabase) return [];
    const { data, error } = await supabase.from('salaries').select('*');
    if (error) {
      console.error('Error fetching salaries:', error);
      throw error;
    }
    return data as SalaryRecord[];
  },
  async upsertSalary(record: SalaryRecord): Promise<SalaryRecord> {
    if (!supabase) throw new Error('Supabase not configured');
    // Using upsert in case the record already exists
    const { data, error } = await supabase.from('salaries').upsert([record], { onConflict: 'id' }).select().single();
    if (error) throw error;
    return data as SalaryRecord;
  },
  async deleteSalary(id: string): Promise<void> {
    if (!supabase) throw new Error('Supabase not configured');
    const { error } = await supabase.from('salaries').delete().eq('id', id);
    if (error) throw error;
  },

  // ── Savings ─────────────────────────────────────────────────────────
  async fetchSavings(): Promise<SavingsRecord[]> {
    if (!supabase) return [];
    const { data, error } = await supabase.from('savings').select('*').order('date', { ascending: false });
    if (error) {
      console.error('Error fetching savings:', error);
      throw error;
    }
    return data as SavingsRecord[];
  },
  async addSavingsEntry(record: Omit<SavingsRecord, 'id' | 'created_at'>): Promise<SavingsRecord> {
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error } = await supabase.from('savings').insert([record]).select().single();
    if (error) throw error;
    return data as SavingsRecord;
  },
  async updateSavingsEntry(id: string, record: Partial<SavingsRecord>): Promise<void> {
    if (!supabase) throw new Error('Supabase not configured');
    const { error } = await supabase.from('savings').update(record).eq('id', id);
    if (error) throw error;
  },
  async deleteSavingsEntry(id: string): Promise<void> {
    if (!supabase) throw new Error('Supabase not configured');
    const { error } = await supabase.from('savings').delete().eq('id', id);
    if (error) throw error;
  },

  // ── Budgets ──────────────────────────────────────────────────────────
  async fetchBudgets(): Promise<BudgetRecord[]> {
    if (!supabase) return [];
    try {
      const { data, error } = await supabase.from('budgets').select('*');
      if (error) {
        console.warn('Budgets table not created in Supabase yet:', error.message);
        const local = localStorage.getItem('finance_budgets_fallback');
        return local ? JSON.parse(local) : [];
      }
      return data as BudgetRecord[];
    } catch (e) {
      console.warn('Budgets table fallback active:', e);
      const local = localStorage.getItem('finance_budgets_fallback');
      return local ? JSON.parse(local) : [];
    }
  },
  async upsertBudget(record: BudgetRecord): Promise<BudgetRecord> {
    if (!supabase) throw new Error('Supabase not configured');
    try {
      const { data, error } = await supabase.from('budgets').upsert([record], { onConflict: 'id' }).select().single();
      if (error) throw error;
      return data as BudgetRecord;
    } catch (err: any) {
      console.warn('Supabase upsert failed, saving to local fallback:', err.message);
      const local = localStorage.getItem('finance_budgets_fallback');
      const list: BudgetRecord[] = local ? JSON.parse(local) : [];
      const idx = list.findIndex((b) => b.id === record.id);
      if (idx >= 0) list[idx] = record;
      else list.push(record);
      localStorage.setItem('finance_budgets_fallback', JSON.stringify(list));
      return record;
    }
  },
  async deleteBudget(id: string): Promise<void> {
    if (!supabase) throw new Error('Supabase not configured');
    try {
      const { error } = await supabase.from('budgets').delete().eq('id', id);
      if (error) console.warn('Supabase delete failed:', error.message);
    } catch (e) {
      console.warn('Supabase delete catch:', e);
    }
    const local = localStorage.getItem('finance_budgets_fallback');
    if (local) {
      const list: BudgetRecord[] = JSON.parse(local);
      localStorage.setItem('finance_budgets_fallback', JSON.stringify(list.filter((b) => b.id !== id)));
    }
  }
};
