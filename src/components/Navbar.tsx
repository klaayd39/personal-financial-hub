import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { useFinance } from '../context/FinanceContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { MONTH_NAMES } from '../utils/formatters';
import { CustomDropdown } from './CustomDropdown';
import {
  LayoutDashboard,
  CreditCard,
  Banknote,
  PiggyBank,
  Wallet,
  Menu,
  X,
  Calendar,
  LogOut,
  Receipt,
  Moon,
  Sun,
  Monitor,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, signOut } = useAuth();
  const { filter, setFilter } = useFinance();
  const { theme, setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const YEARS = [2024, 2025, 2026, 2027, 2028];

  const navItems = [
    { to: '/', label: 'Dashboard', icon: <LayoutDashboard className="w-3.5 h-3.5" /> },
    { to: '/expenses', label: 'Expenses', icon: <CreditCard className="w-3.5 h-3.5" /> },
    { to: '/salary', label: 'Salary', icon: <Banknote className="w-3.5 h-3.5" /> },
    { to: '/budget', label: 'Budget', icon: <Calendar className="w-3.5 h-3.5" /> },
    { to: '/bills', label: 'Bills', icon: <Receipt className="w-3.5 h-3.5" /> },
    { to: '/savings', label: 'Savings', icon: <PiggyBank className="w-3.5 h-3.5" /> },
  ];

  const mobileMenuVariants: Variants = {
    hidden: { opacity: 0, height: 0, overflow: 'hidden' },
    visible: {
      opacity: 1,
      height: 'auto',
      overflow: 'hidden',
      transition: { duration: 0.28, ease: 'easeInOut' as const },
    },
    exit: {
      opacity: 0,
      height: 0,
      transition: { duration: 0.2, ease: 'easeInOut' as const },
    },
  };

  const currentMonthLabel =
    filter.month === -1 ? 'All Months' : MONTH_NAMES[filter.month];

  return (
    <header className="glass-panel dark:bg-slate-900/80 dark:border-slate-800 sticky top-0 z-40 border-t-0 border-l-0 border-r-0 rounded-none transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main header row */}
        <div className="flex items-center justify-between h-16 gap-4">

          {/* Brand Logo & Title */}
          <NavLink to="/" className="flex items-center gap-2.5 shrink-0 group">
            <motion.div
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-600/30"
            >
              <Wallet className="w-4 h-4 text-white" />
            </motion.div>
            <div className="flex flex-col">
              <span className="font-bold text-slate-900 dark:text-white text-sm tracking-tight group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
                FinanceHub
              </span>
            </div>
          </NavLink>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-0.5 bg-slate-100/70 dark:bg-slate-800/50 p-1 rounded-xl border border-slate-200/50 dark:border-slate-700/50" aria-label="Main navigation">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/25'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white/70 dark:hover:bg-slate-700/50'
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

            {/* Filter Period (Desktop) */}
            <div className="hidden sm:flex items-center gap-1.5 p-1">
              <CustomDropdown
                options={[
                  { value: -1, label: 'All Months' },
                  ...MONTH_NAMES.map((name, i) => ({ value: i, label: name }))
                ]}
                value={filter.month}
                onChange={(val) => setFilter((p) => ({ ...p, month: val as number }))}
                className="w-32"
                ariaLabel="Filter by month"
              />
              <CustomDropdown
                options={YEARS.map(y => ({ value: y, label: y.toString() }))}
                value={filter.year}
                onChange={(val) => setFilter((p) => ({ ...p, year: val as number }))}
                className="w-24"
                ariaLabel="Filter by year"
              />
            </div>

            {/* User & Logout */}
            <div className="flex items-center gap-2">
              {/* Theme Toggle */}
              <button
                onClick={() => {
                  if (theme === 'light') setTheme('dark');
                  else if (theme === 'dark') setTheme('system');
                  else setTheme('light');
                }}
                className="p-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                title={`Theme: ${theme.charAt(0).toUpperCase() + theme.slice(1)} (Click to cycle)`}
              >
                {theme === 'light' ? <Sun className="w-4 h-4" /> : theme === 'dark' ? <Moon className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
              </button>

              {user && (
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[150px]">
                    {user.email}
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">Signed in</span>
                </div>
              )}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={signOut}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 dark:text-rose-400 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 rounded-xl transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </motion.button>

              {/* Mobile Hamburger */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={mobileMenuOpen}
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={mobileMenuOpen ? 'close' : 'open'}
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                  </motion.div>
                </AnimatePresence>
              </motion.button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              key="mobile-menu"
              variants={mobileMenuVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="lg:hidden border-t border-slate-100 dark:border-slate-800"
            >
              <div className="py-3 space-y-3">
                {/* Filter selectors for Mobile */}
                <div className="sm:hidden flex items-center gap-2 mb-4">
                  <CustomDropdown
                    options={[
                      { value: -1, label: 'All Months' },
                      ...MONTH_NAMES.map((name, i) => ({ value: i, label: name }))
                    ]}
                    value={filter.month}
                    onChange={(val) => setFilter((p) => ({ ...p, month: val as number }))}
                    className="flex-1"
                    ariaLabel="Filter by month"
                  />
                  <CustomDropdown
                    options={YEARS.map(y => ({ value: y, label: y.toString() }))}
                    value={filter.year}
                    onChange={(val) => setFilter((p) => ({ ...p, year: val as number }))}
                    className="w-24 shrink-0"
                    ariaLabel="Filter by year"
                  />
                </div>

                {/* Current period indicator */}
                <div className="px-1">
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold mb-1.5">
                    Viewing: {currentMonthLabel} {filter.year}
                  </p>
                </div>

                {/* Mobile Links Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {navItems.map((item, i) => (
                    <motion.div
                      key={item.to}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                    >
                      <NavLink
                        to={item.to}
                        end={item.to === '/'}
                        onClick={() => setMobileMenuOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                            isActive
                              ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/25'
                              : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:bg-slate-800/50 dark:text-slate-400 dark:hover:bg-slate-700/50 dark:hover:text-slate-100'
                          }`
                        }
                      >
                        {item.icon}
                        {item.label}
                      </NavLink>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};
