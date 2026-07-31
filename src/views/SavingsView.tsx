import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import type { SavingsRecord } from '../types/finance';
import { formatCurrency, formatDate } from '../utils/formatters';
import { ConfirmModal } from '../components/ConfirmModal';
import { SavingsVault3D } from '../components/3d/SavingsVault3D';
import {
  PiggyBank, Plus, Edit2, Trash2, X, CheckCircle2,
  TrendingUp, TrendingDown, Info,
} from 'lucide-react';

// ── Modal ─────────────────────────────────────────────────────────────────────
interface SavingsModalProps {
  existing?: SavingsRecord;
  onClose: () => void;
}

const SavingsModal: React.FC<SavingsModalProps> = ({ existing, onClose }) => {
  const { addSavingsEntry, updateSavingsEntry } = useFinance();
  const today = new Date().toISOString().split('T')[0];

  const [entryType, setEntryType] = useState<'deposit' | 'withdrawal'>(
    existing ? (existing.amount >= 0 ? 'deposit' : 'withdrawal') : 'deposit',
  );
  const [amount, setAmount] = useState(
    existing ? Math.abs(existing.amount).toString() : '',
  );
  const [description, setDescription] = useState(existing?.description ?? '');
  const [date, setDate] = useState(existing?.date ?? today);
  const [notes, setNotes] = useState(existing?.notes ?? '');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(amount);
    if (isNaN(parsed) || parsed <= 0) {
      setError('Please enter a valid amount greater than ₱0.');
      return;
    }
    if (!description.trim()) {
      setError('Please enter a description.');
      return;
    }

    const finalAmount = entryType === 'withdrawal' ? -parsed : parsed;

    if (existing) {
      await updateSavingsEntry(existing.id, {
        amount: finalAmount,
        description: description.trim(),
        date,
        notes: notes.trim() || undefined,
      });
    } else {
      await addSavingsEntry({
        amount: finalAmount,
        description: description.trim(),
        date,
        notes: notes.trim() || undefined,
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-md w-full p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-slate-900">
            {existing ? 'Edit' : 'Add'} Savings Entry
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type toggle */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">Entry Type</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setEntryType('deposit')}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium border transition-all ${
                  entryType === 'deposit'
                    ? 'bg-emerald-600 border-emerald-600 text-white'
                    : 'border-slate-200 text-slate-500 hover:border-slate-300'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" /> Deposit
              </button>
              <button
                type="button"
                onClick={() => setEntryType('withdrawal')}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium border transition-all ${
                  entryType === 'withdrawal'
                    ? 'bg-rose-500 border-rose-500 text-white'
                    : 'border-slate-200 text-slate-500 hover:border-slate-300'
                }`}
              >
                <TrendingDown className="w-3.5 h-3.5" /> Withdrawal
              </button>
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Amount (₱) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm pointer-events-none select-none">₱</span>
              <input
                type="number"
                min="0.01"
                step="0.01"
                required
                autoFocus
                placeholder="0.00"
                value={amount}
                onChange={(e) => { setAmount(e.target.value); setError(''); }}
                className="w-full !pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:bg-white transition-colors"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Description <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Emergency fund, investment deposit…"
              value={description}
              onChange={(e) => { setDescription(e.target.value); setError(''); }}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:bg-white transition-colors"
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:bg-white transition-colors"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Notes <span className="text-slate-400">(optional)</span>
            </label>
            <input
              type="text"
              placeholder="Additional details…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:bg-white transition-colors"
            />
          </div>

          {error && <p className="text-xs text-rose-500">{error}</p>}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary text-xs py-2"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              {existing ? 'Update Entry' : 'Add Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Main view ─────────────────────────────────────────────────────────────────
export const SavingsView: React.FC = () => {
  const { savingsRecords, deleteSavingsEntry } = useFinance();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<SavingsRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const sorted = [...savingsRecords].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  const totalDeposits    = savingsRecords.filter((s) => s.amount > 0).reduce((sum, s) => sum + s.amount, 0);
  const totalWithdrawals = savingsRecords.filter((s) => s.amount < 0).reduce((sum, s) => sum + Math.abs(s.amount), 0);
  const netSavings       = totalDeposits - totalWithdrawals;

  const openAdd = () => { setEditTarget(null); setIsModalOpen(true); };
  const openEdit = (r: SavingsRecord) => { setEditTarget(r); setIsModalOpen(true); };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Savings</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {savingsRecords.length} entr{savingsRecords.length !== 1 ? 'ies' : 'y'} · Net savings{' '}
            <span className={`font-semibold ${netSavings >= 0 ? 'text-violet-600' : 'text-rose-500'}`}>
              {formatCurrency(netSavings)}
            </span>
          </p>
        </div>
        <button
          onClick={openAdd}
          className="btn-primary text-xs py-2"
        >
          <Plus className="w-3.5 h-3.5" /> Add Entry
        </button>
      </div>

      {/* 3D Savings Vault */}
      <SavingsVault3D netSavings={netSavings} />

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm/50 hover-lift">
          <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1.5">Total Deposits</p>
          <p className="text-xl font-bold text-emerald-600">{formatCurrency(totalDeposits)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm/50 hover-lift">
          <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1.5">Total Withdrawals</p>
          <p className="text-xl font-bold text-rose-500">{formatCurrency(totalWithdrawals)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-violet-100 p-5 shadow-sm/50 hover-lift ring-1 ring-violet-50">
          <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1.5">Net Savings</p>
          <p className={`text-xl font-bold ${netSavings >= 0 ? 'text-violet-600' : 'text-rose-500'}`}>
            {formatCurrency(netSavings)}
          </p>
        </div>
      </div>

      {/* Info banner */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 flex items-start gap-3">
        <Info className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
        <p className="text-xs text-slate-500 leading-relaxed">
          Track all your savings deposits and withdrawals here. The{' '}
          <strong className="text-slate-700">Net Savings</strong> total is shown on the dashboard as
          your overall savings balance.
        </p>
      </div>

      {/* Ledger table */}
      <div className="glass-panel overflow-hidden rounded-2xl">
        {sorted.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider py-3 px-5">Date</th>
                  <th className="text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider py-3 px-5">Description</th>
                  <th className="text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider py-3 px-5">Notes</th>
                  <th className="text-right text-[10px] font-semibold text-slate-400 uppercase tracking-wider py-3 px-5">Amount</th>
                  <th className="py-3 px-5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {sorted.map((entry) => {
                  const isDeposit = entry.amount >= 0;
                  return (
                    <tr key={entry.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="py-4 px-5 text-xs text-slate-500 whitespace-nowrap group-hover:text-slate-900 transition-colors">
                        {formatDate(entry.date)}
                      </td>
                      <td className="py-3 px-5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className={`p-1 rounded-md ${isDeposit ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'}`}>
                            {isDeposit ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          </span>
                          <span className="text-xs font-medium text-slate-800">{entry.description}</span>
                        </div>
                      </td>
                      <td className="py-3 px-5 text-xs text-slate-400 max-w-xs truncate">
                        {entry.notes || '—'}
                      </td>
                      <td className={`py-3 px-5 text-right text-xs font-semibold whitespace-nowrap ${isDeposit ? 'text-emerald-600' : 'text-rose-500'}`}>
                        {isDeposit ? '+' : ''}{formatCurrency(entry.amount)}
                      </td>
                      <td className="py-3 px-5 whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEdit(entry)}
                            className="p-1.5 text-slate-300 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(entry.id)}
                            className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-md transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center">
            <PiggyBank className="w-8 h-8 mx-auto text-slate-200 mb-3" />
            <p className="text-sm font-medium text-slate-600">No savings entries yet</p>
            <p className="text-xs text-slate-400 mt-1">Add your first deposit or withdrawal to start tracking.</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <SavingsModal
          existing={editTarget ?? undefined}
          onClose={() => { setIsModalOpen(false); setEditTarget(null); }}
        />
      )}

      {/* Delete confirm */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Remove savings entry?"
        message="This will permanently remove this entry from your savings ledger."
        confirmLabel="Remove"
        isDanger={false}
        onConfirm={() => { if (deleteTarget) deleteSavingsEntry(deleteTarget); }}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
};
