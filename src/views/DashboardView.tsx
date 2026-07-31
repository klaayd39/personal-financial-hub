import React from 'react';
import { Link } from 'react-router-dom';
import { useFinance } from '../context/FinanceContext';
import { DashboardOverview } from '../components/DashboardOverview';
import { formatCurrency, formatDate } from '../utils/formatters';
import { TrendingUp, TrendingDown, Calendar, Circle } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';

export const DashboardView: React.FC = () => {
  const { filteredIncomes, filteredExpenses, summary, bills, toggleBillPaid } = useFinance();

  const upcomingBills = React.useMemo(() => {
    return bills
      .filter((b) => !b.is_paid)
      .sort((a, b) => a.due_day - b.due_day)
      .slice(0, 4);
  }, [bills]);

  const recentTransactions = React.useMemo(() => {
    const combined = [
      ...filteredIncomes.map((inc) => ({
        id: inc.id, type: 'income' as const,
        title: inc.source, sub: inc.notes || '—',
        amount: inc.amount, date: inc.date,
      })),
      ...filteredExpenses.map((exp) => ({
        id: exp.id, type: 'expense' as const,
        title: exp.description, sub: exp.payment_method,
        amount: exp.amount, date: exp.date,
      })),
    ];
    return combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 6);
  }, [filteredIncomes, filteredExpenses]);

  const barData = [{ name: 'Period', Salary: summary.monthlySalary || 0, Expenses: summary.totalExpenses }];

  return (
    <div className="space-y-6">
      {/* Overview cards */}
      <DashboardOverview />

      {/* Charts + recent */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Charts */}
        <div className="lg:col-span-2">
          {/* Bar chart */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm/50 hover-lift h-full flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-slate-800">Salary vs Expenses</p>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#cbd5e1" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#cbd5e1" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    formatter={(v: any) => [formatCurrency(Number(v)), '']}
                    contentStyle={{ borderRadius: '10px', border: '1px solid #f1f5f9', fontSize: 12 }}
                    cursor={{ fill: '#f8fafc' }}
                  />
                  <Bar dataKey="Salary" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={48} />
                  <Bar dataKey="Expenses" fill="#f43f5e" radius={[6, 6, 0, 0]} maxBarSize={48} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent transactions & Upcoming Bills */}
        <div className="space-y-4 flex flex-col">
          {/* Upcoming Bills Widget */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm/50 hover-lift">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-500" />
                <p className="text-sm font-semibold text-slate-800">Upcoming Bills</p>
              </div>
              <Link to="/bills" className="text-xs text-amber-600 hover:text-amber-700 font-medium">Manage →</Link>
            </div>

            {upcomingBills.length > 0 ? (
              <div className="space-y-2">
                {upcomingBills.map((b) => (
                  <div key={b.id} className="flex items-center justify-between py-1.5 border-b border-slate-50 last:border-0 text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <button
                        onClick={() => toggleBillPaid(b.id)}
                        className="p-1 text-slate-300 hover:text-emerald-600 transition-colors shrink-0"
                        title="Mark Paid"
                      >
                        <Circle className="w-3.5 h-3.5" />
                      </button>
                      <span className="font-medium text-slate-800 truncate">{b.name}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] font-semibold text-slate-400">Due {b.due_day}th</span>
                      <span className="font-bold text-rose-600">{formatCurrency(b.amount)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-2 text-center">No unpaid bills due this month! 🎉</p>
            )}
          </div>

          {/* Recent transactions */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm/50 hover-lift flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-slate-800">Recent Transactions</p>
            </div>

            {recentTransactions.length > 0 ? (
              <div className="space-y-1 flex-1">
                {recentTransactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`p-1.5 rounded-lg shrink-0 ${tx.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'}`}>
                        {tx.type === 'income' ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-slate-800 truncate">{tx.title}</p>
                        <p className="text-[10px] text-slate-400">{formatDate(tx.date)}</p>
                      </div>
                    </div>
                    <p className={`text-xs font-semibold shrink-0 ml-2 ${tx.type === 'income' ? 'text-emerald-600' : 'text-slate-700'}`}>
                      {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400 text-center py-12 flex-1">No transactions yet.</p>
            )}

            <div className="mt-4 pt-4 border-t border-slate-50 flex gap-4">
              <Link to="/expenses" className="text-xs text-slate-600 hover:text-slate-800 font-medium transition-colors">Expenses →</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
