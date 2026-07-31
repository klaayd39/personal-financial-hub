import React from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, MONTH_NAMES } from '../utils/formatters';
import { exportToExcel, exportToPDF } from '../utils/exportUtils';
import { FileText, FileSpreadsheet, PiggyBank, Wallet } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, CartesianGrid,
} from 'recharts';

const CATEGORY_COLORS: Record<string, string> = {
  Food: '#f59e0b',
  Transportation: '#3b82f6',
  Bills: '#ef4444',
  Shopping: '#ec4899',
  Entertainment: '#8b5cf6',
  Health: '#10b981',
  Education: '#06b6d4',
  Travel: '#6366f1',
  Miscellaneous: '#64748b',
};

export const ReportsView: React.FC = () => {
  const { filteredIncomes, filteredExpenses, filter, summary, incomes, expenses } = useFinance();

  const periodTitle =
    filter.month === -1 ? `${filter.year}` : `${MONTH_NAMES[filter.month]} ${filter.year}`;

  const comparisonData = React.useMemo(() => [
    { period: periodTitle, Income: summary.totalIncome, Expenses: summary.totalExpenses, Savings: summary.totalSavings },
  ], [summary, periodTitle]);

  const categoryData = React.useMemo(() => {
    const totals: Record<string, number> = {};
    filteredExpenses.forEach((exp) => { totals[exp.category] = (totals[exp.category] || 0) + exp.amount; });
    return Object.entries(totals).map(([name, value]) => ({ name, value }));
  }, [filteredExpenses]);

  const topCategory = React.useMemo(() => {
    if (!categoryData.length) return { name: 'None', amount: 0 };
    return [...categoryData].sort((a, b) => b.value - a.value)[0];
  }, [categoryData]);

  const savingsTrendData = React.useMemo(() => {
    return MONTH_NAMES.map((name, index) => {
      const incSum = incomes.filter((i) => { const d = new Date(i.date + 'T00:00:00'); return d.getFullYear() === filter.year && d.getMonth() === index; }).reduce((s, i) => s + i.amount, 0);
      const expSum = expenses.filter((e) => { const d = new Date(e.date + 'T00:00:00'); return d.getFullYear() === filter.year && d.getMonth() === index; }).reduce((s, e) => s + e.amount, 0);
      return { month: name.substring(0, 3), Income: incSum, Expenses: expSum, Savings: Math.max(0, incSum - expSum) };
    });
  }, [incomes, expenses, filter.year]);

  const tooltipStyle = { borderRadius: '10px', border: '1px solid #f1f5f9', fontSize: 12, padding: '6px 10px' };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Reports</h1>
          <p className="text-xs text-slate-400 mt-0.5">{periodTitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => exportToPDF(filteredIncomes, filteredExpenses, filter)}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-700 text-white text-xs font-medium rounded-lg transition-colors"
          >
            <FileText className="w-3.5 h-3.5" /> PDF
          </button>
          <button
            onClick={() => exportToExcel(filteredIncomes, filteredExpenses, filter)}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" /> Excel
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white rounded-xl p-4 border border-slate-100 flex items-center gap-3">
          <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600"><PiggyBank className="w-4 h-4" /></div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Savings Rate</p>
            <p className="text-xl font-bold text-slate-900">{summary.savingsRate.toFixed(1)}%</p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-100 flex items-center gap-3">
          <div className="p-2 bg-amber-50 rounded-lg text-amber-600"><FileText className="w-4 h-4" /></div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Top Category</p>
            <p className="text-lg font-bold text-slate-900 truncate max-w-[140px]">{topCategory.name}</p>
            <p className="text-xs text-slate-400">{formatCurrency(topCategory.amount)}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-100 flex items-center gap-3">
          <div className="p-2 bg-slate-100 rounded-lg text-slate-600"><Wallet className="w-4 h-4" /></div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Net Balance</p>
            <p className={`text-xl font-bold ${summary.remainingBalance >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
              {formatCurrency(summary.remainingBalance)}
            </p>
          </div>
        </div>
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Bar comparison */}
        <div className="bg-white rounded-xl border border-slate-100 p-5">
          <div className="mb-4">
            <p className="text-sm font-semibold text-slate-800">Income vs Expenses vs Savings</p>
            <p className="text-xs text-slate-400">{periodTitle}</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                <XAxis dataKey="period" stroke="#cbd5e1" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#cbd5e1" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip formatter={(v: any) => [formatCurrency(Number(v) || 0), '']} contentStyle={tooltipStyle} cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="Income" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={52} />
                <Bar dataKey="Expenses" fill="#f43f5e" radius={[6, 6, 0, 0]} maxBarSize={52} />
                <Bar dataKey="Savings" fill="#8b5cf6" radius={[6, 6, 0, 0]} maxBarSize={52} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie chart */}
        <div className="bg-white rounded-xl border border-slate-100 p-5">
          <div className="mb-4">
            <p className="text-sm font-semibold text-slate-800">Expense Breakdown</p>
            <p className="text-xs text-slate-400">Proportional spending</p>
          </div>
          {categoryData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="48%" innerRadius={52} outerRadius={84} paddingAngle={3} dataKey="value">
                    {categoryData.map((entry) => <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name] || '#64748b'} />)}
                  </Pie>
                  <Tooltip formatter={(v: any) => [formatCurrency(Number(v) || 0), 'Spent']} contentStyle={tooltipStyle} />
                  <Legend verticalAlign="bottom" height={32} iconType="circle" iconSize={8} formatter={(v) => <span className="text-xs text-slate-600">{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-sm text-slate-400 text-center py-16">No expense data for this period.</p>
          )}
        </div>
      </div>

      {/* Annual trend */}
      <div className="bg-white rounded-xl border border-slate-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-semibold text-slate-800">Annual Trend ({filter.year})</p>
            <p className="text-xs text-slate-400">Monthly Jan – Dec</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />Income</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />Expenses</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-violet-500 inline-block" />Savings</span>
          </div>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={savingsTrendData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" stroke="#cbd5e1" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#cbd5e1" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip formatter={(v: any) => [formatCurrency(Number(v) || 0), '']} contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="Income" stroke="#10b981" strokeWidth={2} dot={{ r: 3, fill: '#10b981' }} activeDot={{ r: 4 }} />
              <Line type="monotone" dataKey="Expenses" stroke="#f43f5e" strokeWidth={2} dot={{ r: 3, fill: '#f43f5e' }} activeDot={{ r: 4 }} />
              <Line type="monotone" dataKey="Savings" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3, fill: '#8b5cf6' }} activeDot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
