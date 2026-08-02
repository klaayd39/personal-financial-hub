-- Personal Financial Hub Supabase Database Schema

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES TABLE
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text,
  currency text default 'USD',
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Profiles
alter table public.profiles enable row level security;

create policy "Users can view their own profile." 
  on public.profiles for select 
  using (auth.uid() = id);

create policy "Users can update their own profile." 
  on public.profiles for update 
  using (auth.uid() = id);

create policy "Users can insert their own profile." 
  on public.profiles for insert 
  with check (auth.uid() = id);

-- 2. INCOMES TABLE
create table if not exists public.incomes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  amount numeric(12,2) not null check (amount >= 0),
  date date not null,
  source text not null check (source in ('Salary', 'Freelance', 'Bonus', 'Business', 'Other')),
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Incomes
alter table public.incomes enable row level security;

create policy "Users can view their own incomes." 
  on public.incomes for select 
  using (auth.uid() = user_id);

create policy "Users can insert their own incomes." 
  on public.incomes for insert 
  with check (auth.uid() = user_id);

create policy "Users can update their own incomes." 
  on public.incomes for update 
  using (auth.uid() = user_id);

create policy "Users can delete their own incomes." 
  on public.incomes for delete 
  using (auth.uid() = user_id);

-- 3. EXPENSES TABLE
create table if not exists public.expenses (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  amount numeric(12,2) not null check (amount >= 0),
  date date not null,
  time text,
  category text not null check (category in (
    'Food', 'Transportation', 'Bills', 'Shopping', 
    'Entertainment', 'Health', 'Education', 'Travel', 'Miscellaneous'
  )),
  payment_method text not null check (payment_method in (
    'Cash', 'Credit Card', 'Debit Card', 'Bank Transfer', 'E-Wallet'
  )),
  description text not null,
  receipt_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Expenses
alter table public.expenses enable row level security;

create policy "Users can view their own expenses." 
  on public.expenses for select 
  using (auth.uid() = user_id);

create policy "Users can insert their own expenses." 
  on public.expenses for insert 
  with check (auth.uid() = user_id);

create policy "Users can update their own expenses." 
  on public.expenses for update 
  using (auth.uid() = user_id);

create policy "Users can delete their own expenses." 
  on public.expenses for delete 
  using (auth.uid() = user_id);

-- INDEXES for fast filtering
create index if not exists idx_incomes_user_date on public.incomes(user_id, date);
create index if not exists idx_expenses_user_date on public.expenses(user_id, date);
create index if not exists idx_expenses_category on public.expenses(user_id, category);

-- Automatic Profile Creation Trigger
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
