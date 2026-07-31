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

-- Enable Row Level Security (RLS) & add open policy for standard access
ALTER TABLE public.incomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public access to incomes" ON public.incomes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access to expenses" ON public.expenses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access to salaries" ON public.salaries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access to savings" ON public.savings FOR ALL USING (true) WITH CHECK (true);
