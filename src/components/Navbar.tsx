import React from 'react';
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
} from 'lucide-react';

interface NavbarProps {
  onOpenIncomeModal: () => void;
  onOpenExpenseModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenIncomeModal, onOpenExpenseModal }) => {
  const { filter, setFilter } = useFinance();
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
    <header className="bg-white border-b border-slate-100 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-6">
        {/* Main bar */}
        <div className="flex items-center h-14 gap-6">
          {/* Brand */}
          <NavLink to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center">
              <Wallet className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-slate-900 text-sm">FinanceHub</span>
          </NavLink>

          {/* Nav links */}
          <nav className="flex items-center gap-1 overflow-x-auto flex-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-slate-100 text-slate-900'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                  }`
                }
              >
                {item.icon}
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Period selector */}
          <div className="hidden md:flex items-center gap-1.5 shrink-0">
            <select
              value={filter.month}
              onChange={(e) => setFilter((p) => ({ ...p, month: parseInt(e.target.value) }))}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-slate-300"
            >
              <option value={-1}>All Months</option>
              {MONTH_NAMES.map((name, i) => (
                <option key={name} value={i}>{name}</option>
              ))}
            </select>
            <select
              value={filter.year}
              onChange={(e) => setFilter((p) => ({ ...p, year: parseInt(e.target.value) }))}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-slate-300"
            >
              {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>

          {/* Quick actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onOpenIncomeModal}
              className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Income</span>
            </button>
            <button
              onClick={onOpenExpenseModal}
              className="flex items-center gap-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-700 text-white text-xs font-medium rounded-lg transition-colors"
            >
              <Minus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Expense</span>
            </button>
          </div>
        </div>

        {/* Mobile period selector */}
        <div className="md:hidden flex items-center gap-2 py-2 border-t border-slate-100">
          <select
            value={filter.month}
            onChange={(e) => setFilter((p) => ({ ...p, month: parseInt(e.target.value) }))}
            className="flex-1 bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium rounded-lg px-2 py-1.5"
          >
            <option value={-1}>All Months</option>
            {MONTH_NAMES.map((name, i) => <option key={name} value={i}>{name}</option>)}
          </select>
          <select
            value={filter.year}
            onChange={(e) => setFilter((p) => ({ ...p, year: parseInt(e.target.value) }))}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium rounded-lg px-2 py-1.5"
          >
            {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>
    </header>
  );
};
