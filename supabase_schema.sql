-- Personal Financial Hub Database Schema for Supabase

-- 1. Incomes Table
CREATE TABLE IF NOT EXISTS public.incomes (
  id TEXT PRIMARY KEY,
  amount NUMERIC NOT NULL,
  date DATE NOT NULL,
  source TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Expenses Table
CREATE TABLE IF NOT EXISTS public.expenses (
  id TEXT PRIMARY KEY,
  amount NUMERIC NOT NULL,
  date DATE NOT NULL,
  time TEXT,
  category TEXT NOT NULL,
  payment_method TEXT NOT NULL,
  description TEXT NOT NULL,
  receipt_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Salaries Table
CREATE TABLE IF NOT EXISTS public.salaries (
  id TEXT PRIMARY KEY,
  month INT NOT NULL,
  year INT NOT NULL,
  amount NUMERIC NOT NULL,
  notes TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Savings Table
CREATE TABLE IF NOT EXISTS public.savings (
  id TEXT PRIMARY KEY,
  amount NUMERIC NOT NULL,
  description TEXT NOT NULL,
  date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Budgets Table
CREATE TABLE IF NOT EXISTS public.budgets (
  id TEXT PRIMARY KEY,
  month INT NOT NULL,
  year INT NOT NULL,
  amount NUMERIC NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Bills Table (Fixed & Recurring Bills)
CREATE TABLE IF NOT EXISTS public.bills (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  due_day INT NOT NULL, -- 1 to 31
  month INT, -- NULL = recurring every month, 0-11 for specific month
  year INT,
  billing_cycle TEXT DEFAULT 'monthly', -- 'monthly' | 'yearly' | 'weekly'
  category TEXT,
  is_paid BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS) & add open policy for standard access
ALTER TABLE public.incomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public access to incomes" ON public.incomes;
CREATE POLICY "Allow public access to incomes" ON public.incomes FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public access to expenses" ON public.expenses;
CREATE POLICY "Allow public access to expenses" ON public.expenses FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public access to salaries" ON public.salaries;
CREATE POLICY "Allow public access to salaries" ON public.salaries FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public access to savings" ON public.savings;
CREATE POLICY "Allow public access to savings" ON public.savings FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public access to budgets" ON public.budgets;
CREATE POLICY "Allow public access to budgets" ON public.budgets FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public access to bills" ON public.bills;
CREATE POLICY "Allow public access to bills" ON public.bills FOR ALL USING (true) WITH CHECK (true);
