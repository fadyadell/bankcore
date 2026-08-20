'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '../../../../lib/apiClient';
import Link from 'next/link';

interface Stats {
  pendingTransactions: number;
  pendingLoans: number;
}

export default function EmployeeDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    pendingTransactions: 0,
    pendingLoans: 0
  });

  useEffect(() => {
    Promise.all([
      apiClient.get('/transactions?status=PENDING'),
      apiClient.get('/loans?status=PENDING')
    ])
    .then(([txRes, loanRes]) => {
      const txs = txRes.data.data || txRes.data || [];
      const loans = loanRes.data.data || loanRes.data || [];
      
      setStats({
        pendingTransactions: Array.isArray(txs) ? txs.length : 0,
        pendingLoans: Array.isArray(loans) ? loans.length : 0
      });
    })
    .catch(err => console.error("Failed to fetch employee dashboard data", err))
    .finally(() => setLoading(false));
  }, []);

  const totalPending = stats.pendingTransactions + stats.pendingLoans;
  
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10 max-w-5xl mx-auto">
      <div className="mb-8 glass-card p-6 border-none shadow-sm bg-white/40 flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 font-display">
            Operations Command Center
          </h1>
          <p className="mt-1.5 text-sm text-slate-500 font-medium">
            Manage your daily workflow. You have {totalPending} items requiring attention.
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-xl text-white shadow-lg shadow-slate-500/20">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
          </span>
          <span className="text-xs font-bold tracking-widest uppercase">System Online</span>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 stagger-children">
        {/* Transactions SLA Card */}
        <div className="glass-card overflow-hidden group">
          <div className="p-6 sm:p-8 flex items-start justify-between border-b border-slate-100">
            <div>
              <p className="text-sm font-semibold tracking-wider text-slate-500 uppercase flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-500">fact_check</span>
                Pending Transfers
              </p>
              {loading ? (
                <div className="mt-3 h-12 w-20 skeleton-shimmer rounded-xl" />
              ) : (
                <div className="flex items-end gap-3 mt-3">
                  <h2 className="text-5xl font-extrabold text-slate-900 font-mono-data">
                    {stats.pendingTransactions}
                  </h2>
                  <p className="text-sm font-medium text-slate-400 mb-1">awaiting review</p>
                </div>
              )}
            </div>
            <div className={`flex items-center justify-center h-16 w-16 rounded-full border-4 ${
              stats.pendingTransactions > 5 ? 'border-red-100 bg-red-50 text-red-600' : 'border-emerald-100 bg-emerald-50 text-emerald-600'
            }`}>
              <span className="material-symbols-outlined text-2xl">
                {stats.pendingTransactions > 5 ? 'warning' : 'task_alt'}
              </span>
            </div>
          </div>
          <div className="bg-slate-50/50 p-4">
            <Link 
              href="/employee/transactions" 
              className="flex items-center justify-center w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition-all shadow-md shadow-blue-500/20"
            >
              Review Transfer Queue
              <span className="material-symbols-outlined ml-2 text-lg">arrow_forward</span>
            </Link>
          </div>
        </div>

        {/* Loans SLA Card */}
        <div className="glass-card overflow-hidden group">
          <div className="p-6 sm:p-8 flex items-start justify-between border-b border-slate-100">
            <div>
              <p className="text-sm font-semibold tracking-wider text-slate-500 uppercase flex items-center gap-2">
                <span className="material-symbols-outlined text-indigo-500">rule</span>
                Loan Applications
              </p>
              {loading ? (
                <div className="mt-3 h-12 w-20 skeleton-shimmer rounded-xl" />
              ) : (
                <div className="flex items-end gap-3 mt-3">
                  <h2 className="text-5xl font-extrabold text-slate-900 font-mono-data">
                    {stats.pendingLoans}
                  </h2>
                  <p className="text-sm font-medium text-slate-400 mb-1">awaiting decision</p>
                </div>
              )}
            </div>
            <div className={`flex items-center justify-center h-16 w-16 rounded-full border-4 ${
              stats.pendingLoans > 2 ? 'border-amber-100 bg-amber-50 text-amber-600' : 'border-emerald-100 bg-emerald-50 text-emerald-600'
            }`}>
              <span className="material-symbols-outlined text-2xl">
                {stats.pendingLoans > 2 ? 'schedule' : 'task_alt'}
              </span>
            </div>
          </div>
          <div className="bg-slate-50/50 p-4">
            <Link 
              href="/employee/loans" 
              className="flex items-center justify-center w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold transition-all shadow-md shadow-indigo-500/20"
            >
              Assess Loan Risk
              <span className="material-symbols-outlined ml-2 text-lg">arrow_forward</span>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Quick Metrics */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'SLA Adherence', value: '98.4%', trend: '+1.2%', up: true },
          { label: 'Avg Review Time', value: '4m 12s', trend: '-30s', up: true },
          { label: 'Daily Processed', value: '142', trend: '+12', up: true },
          { label: 'Escalations', value: '1', trend: '-2', up: true }
        ].map((metric, i) => (
          <div key={i} className="glass-card p-4 flex flex-col justify-between">
            <p className="text-xs font-semibold text-slate-500">{metric.label}</p>
            <div className="mt-2 flex items-end justify-between">
              <p className="text-xl font-bold text-slate-900">{metric.value}</p>
              <div className="flex items-center gap-0.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                <span className="material-symbols-outlined text-[10px]">trending_up</span>
                {metric.trend}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
