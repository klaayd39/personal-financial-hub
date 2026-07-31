import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { ConfirmModal } from '../components/ConfirmModal';
import { Download, Upload, Trash2, CheckCircle2, ShieldCheck } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { incomes, expenses, exportDataJSON, importDataJSON, clearAllData } = useFinance();
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [importFileName, setImportFileName] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImportFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) importDataJSON(text);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="space-y-5 max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Data & Settings</h1>
          <p className="text-xs text-slate-400 mt-0.5">Manage your local browser data</p>
        </div>
        <span className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg text-xs font-medium">
          <ShieldCheck className="w-3.5 h-3.5" /> 100% Local
        </span>
      </div>

      {/* Stats */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center gap-8 shadow-sm/50 hover-lift">
        <div>
          <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Income Records</p>
          <p className="text-2xl font-bold text-slate-900 mt-0.5">{incomes.length}</p>
        </div>
        <div className="h-8 w-px bg-slate-100" />
        <div>
          <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Expense Records</p>
          <p className="text-2xl font-bold text-slate-900 mt-0.5">{expenses.length}</p>
        </div>
        <div className="h-8 w-px bg-slate-100" />
        <div>
          <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Storage</p>
          <p className="text-sm font-semibold text-slate-600 mt-0.5">LocalStorage</p>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Export */}
        <div className="glass-panel p-6 space-y-3">
          <div>
            <p className="text-sm font-semibold text-slate-800">Export Backup</p>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Download all your records as a JSON file for offline backup.
            </p>
          </div>
          <button
            onClick={exportDataJSON}
            className="w-full flex items-center justify-center gap-2 py-2 btn-secondary bg-slate-900 hover:bg-slate-700 text-white"
          >
            <Download className="w-3.5 h-3.5" /> Export JSON
          </button>
        </div>

        {/* Import */}
        <div className="glass-panel p-6 space-y-3">
          <div>
            <p className="text-sm font-semibold text-slate-800">Import Backup</p>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Restore records from a previously exported JSON backup.
            </p>
          </div>
          <label className="w-full flex items-center justify-center gap-2 py-2 btn-primary cursor-pointer">
            <Upload className="w-3.5 h-3.5" /> Choose JSON File
            <input type="file" accept=".json,application/json" onChange={handleFileUpload} className="hidden" />
          </label>
          {importFileName && (
            <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> {importFileName}
            </p>
          )}
        </div>
      </div>

      {/* Danger zone */}
      <div className="bg-white rounded-2xl border border-rose-100 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm/50">
        <div>
          <p className="text-sm font-semibold text-rose-700">Reset All Data</p>
          <p className="text-xs text-slate-400 mt-0.5">
            Permanently wipe all records from LocalStorage. This cannot be undone.
          </p>
        </div>
        <button
          onClick={() => setIsClearModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 btn-danger shrink-0"
        >
          <Trash2 className="w-3.5 h-3.5" /> Clear All Data
        </button>
      </div>

      <ConfirmModal
        isOpen={isClearModalOpen}
        title="Clear all data?"
        message="This will permanently delete all income and expense records from LocalStorage. Export a backup first if needed."
        confirmLabel="Clear All Data"
        isDanger={true}
        onConfirm={clearAllData}
        onClose={() => setIsClearModalOpen(false)}
      />
    </div>
  );
};
