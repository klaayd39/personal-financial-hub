-- 1. Ensure Budgets table exists
CREATE TABLE IF NOT EXISTS public.budgets (
    id TEXT PRIMARY KEY,
    month INTEGER NOT NULL,
    year INTEGER NOT NULL,
    amount NUMERIC NOT NULL,
    first_half_amount NUMERIC,
    second_half_amount NUMERIC,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable RLS and add basic policies for budgets
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all actions for budgets" ON public.budgets;
CREATE POLICY "Allow all actions for budgets" ON public.budgets FOR ALL USING (true) WITH CHECK (true);

-- 3. Ensure Bills table exists
CREATE TABLE IF NOT EXISTS public.bills (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    due_day INTEGER NOT NULL,
    month INTEGER,
    year INTEGER,
    billing_cycle TEXT NOT NULL,
    category TEXT,
    is_paid BOOLEAN DEFAULT false,
    bill_expense_id TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Enable RLS and add basic policies for bills
ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all actions for bills" ON public.bills;
CREATE POLICY "Allow all actions for bills" ON public.bills FOR ALL USING (true) WITH CHECK (true);

-- 5. Add any missing columns to existing bills table just in case it was created earlier
ALTER TABLE public.bills ADD COLUMN IF NOT EXISTS bill_expense_id TEXT;
ALTER TABLE public.bills ADD COLUMN IF NOT EXISTS month INTEGER;
ALTER TABLE public.bills ADD COLUMN IF NOT EXISTS year INTEGER;
