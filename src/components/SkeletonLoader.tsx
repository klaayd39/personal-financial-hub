import React from 'react';

// ──────────────────────────────────────────────────────────────────────────────
// Reusable skeleton shimmer elements using pure CSS animation
// ──────────────────────────────────────────────────────────────────────────────

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => (
  <div className={`skeleton ${className}`} aria-hidden="true" />
);

// Dashboard Overview skeleton (row of 4-6 cards)
export const DashboardSkeleton: React.FC = () => (
  <div className="space-y-4" aria-label="Loading dashboard" aria-busy="true">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="card space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-8 w-8 rounded-lg" />
          </div>
          <Skeleton className="h-7 w-32" />
        </div>
      ))}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 card h-64 space-y-3">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-48 w-full" />
      </div>
      <div className="space-y-4">
        <div className="card space-y-3">
          <Skeleton className="h-4 w-32" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between py-1">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// Expense table skeleton
export const ExpenseTableSkeleton: React.FC = () => (
  <div className="glass-panel rounded-2xl overflow-hidden" aria-busy="true">
    <div className="divide-y divide-slate-50">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center justify-between px-5 py-4 gap-4">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 flex-1 max-w-xs" />
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-12" />
        </div>
      ))}
    </div>
  </div>
);

// Bill list skeleton
export const BillListSkeleton: React.FC = () => (
  <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden" aria-busy="true">
    <div className="divide-y divide-slate-100">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center justify-between p-4 gap-3">
          <div className="flex items-center gap-3 flex-1">
            <Skeleton className="h-6 w-6 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-2 w-24" />
            </div>
          </div>
          <Skeleton className="h-4 w-20" />
        </div>
      ))}
    </div>
  </div>
);
