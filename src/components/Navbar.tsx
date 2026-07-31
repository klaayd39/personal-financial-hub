import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useFinance } from '../context/FinanceContext';
import { MONTH_NAMES } from '../utils/formatters';
import {
  LayoutDashboard,
  TrendingUp,
  CreditCard,
  History,
  Banknote,
  PiggyBank,
  BarChart3,
  Settings,
  Plus,
  Minus,
  Wallet,
  Menu,
  X,
  Calendar,
} from 'lucide-react';

interface NavbarProps {
  onOpenIncomeModal: () => void;
  onOpenExpenseModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenIncomeModal, onOpenExpenseModal }) => {
  const { filter, setFilter } = useFinance();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const YEARS = [2024, 2025, 2026, 2027, 2028];

  const navItems = [
    { to: '/', label: 'Dashboard', icon: <LayoutDashboard className="w-3.5 h-3.5" /> },
    { to: '/income', label: 'Income', icon: <TrendingUp className="w-3.5 h-3.5" /> },
    { to: '/expenses', label: 'Expenses', icon: <CreditCard className="w-3.5 h-3.5" /> },
    { to: '/history', label: 'History', icon: <History className="w-3.5 h-3.5" /> },
    { to: '/salary', label: 'Salary', icon: <Banknote className="w-3.5 h-3.5" /> },
    { to: '/savings', label: 'Savings', icon: <PiggyBank className="w-3.5 h-3.5" /> },
    { to: '/reports', label: 'Reports', icon: <BarChart3 className="w-3.5 h-3.5" /> },
    { to: '/settings', label: 'Settings', icon: <Settings className="w-3.5 h-3.5" /> },
  ];

  return (
    <header className="glass-panel sticky top-0 z-40 border-t-0 border-l-0 border-r-0 rounded-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main header row */}
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand Logo & Title */}
          <NavLink to="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center shadow-md shadow-slate-900/10 group-hover:scale-105 transition-transform">
              <Wallet className="w-4 h-4 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-slate-900 text-sm tracking-tight group-hover:text-slate-700 transition-colors">
                FinanceHub
              </span>
            </div>
          </NavLink>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-100/70 p-1 rounded-xl border border-slate-200/50">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                    isActive
                      ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-white/50'
                  }`
                }
              >
                {item.icon}
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2 shrink-0">
            
            {/* Filter Period Dropdowns (Desktop) */}
            <div className="hidden sm:flex items-center gap-1.5 bg-slate-50 border border-slate-200/80 p-1 rounded-xl">
              <div className="flex items-center gap-1 pl-1 text-slate-400">
                <Calendar className="w-3.5 h-3.5" />
              </div>
              <select
                value={filter.month}
                onChange={(e) => setFilter((p) => ({ ...p, month: parseInt(e.target.value) }))}
                className="bg-transparent text-slate-700 text-xs font-semibold rounded-lg py-1 px-1.5 focus:outline-none cursor-pointer"
              >
                <option value={-1}>All Months</option>
                {MONTH_NAMES.map((name, i) => (
                  <option key={name} value={i}>{name}</option>
                ))}
              </select>
              <span className="text-slate-300">|</span>
              <select
                value={filter.year}
                onChange={(e) => setFilter((p) => ({ ...p, year: parseInt(e.target.value) }))}
                className="bg-transparent text-slate-700 text-xs font-semibold rounded-lg py-1 px-1.5 focus:outline-none cursor-pointer"
              >
                {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>

            {/* Income & Expense Quick Buttons */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={onOpenIncomeModal}
                className="flex items-center gap-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
                title="Add Income"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span className="hidden md:inline">Income</span>
              </button>
              <button
                onClick={onOpenExpenseModal}
                className="flex items-center gap-1 px-3 py-2 bg-slate-900 hover:bg-slate-800 active:scale-95 text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
                title="Add Expense"
              >
                <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span className="hidden md:inline">Expense</span>
              </button>
            </div>

            {/* Mobile Hamburger Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-3 border-t border-slate-100 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
            
            {/* Filter selectors for Mobile */}
            <div className="sm:hidden flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200/80">
              <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={filter.month}
                onChange={(e) => setFilter((p) => ({ ...p, month: parseInt(e.target.value) }))}
                className="flex-1 bg-white border border-slate-200 text-slate-700 text-xs font-medium rounded-lg p-1.5"
              >
                <option value={-1}>All Months</option>
                {MONTH_NAMES.map((name, i) => <option key={name} value={i}>{name}</option>)}
              </select>
              <select
                value={filter.year}
                onChange={(e) => setFilter((p) => ({ ...p, year: parseInt(e.target.value) }))}
                className="bg-white border border-slate-200 text-slate-700 text-xs font-medium rounded-lg p-1.5"
              >
                {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>

            {/* Mobile Links Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`
                  }
                >
                  {item.icon}
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
