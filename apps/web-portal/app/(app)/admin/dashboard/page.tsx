'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '../../../../lib/apiClient';
import Link from 'next/link';

interface Stats {
  pendingTransactions: number;
  pendingLoans: number;
  totalUsers: number;
}

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    pendingTransactions: 0,
    pendingLoans: 0,
    totalUsers: 0,
  });

  useEffect(() => {
    Promise.all([
      apiClient.get('/transactions?status=EMPLOYEE_APPROVED'),
      apiClient.get('/loans?status=EMPLOYEE_APPROVED'),
    ])
    .then(([txRes, loanRes]) => {
      const txs = txRes.data.data || txRes.data || [];
      const loans = loanRes.data.data || loanRes.data || [];
      
      setStats({
        pendingTransactions: Array.isArray(txs) ? txs.length : 0,
        pendingLoans: Array.isArray(loans) ? loans.length : 0,
        totalUsers: 1420 // Mock
      });
    })
    .catch(err => console.error("Failed to fetch admin dashboard data", err))
    .finally(() => setLoading(false));
  }, []);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10 max-w-6xl mx-auto">
      
      {/* Executive Header */}
      <div className="glass-card p-6 border-none shadow-sm bg-white/40 flex flex-col md:flex-row md:items-end justify-between mb-8 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-violet-400/10 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2" />
        <div className="absolute left-0 bottom-0 w-64 h-64 bg-fuchsia-400/10 rounded-full blur-3xl -z-10 -translate-x-1/2 translate-y-1/2" />
        
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 font-display">
            Executive Overview
          </h1>
          <p className="mt-1.5 text-sm text-slate-500 font-medium">
            Platform governance and final-tier escalations.
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-3">
          <Link href="/admin/audit" className="flex items-center gap-2 px-4 py-2 bg-white/60 hover:bg-white rounded-xl text-slate-700 shadow-sm transition-all border border-white/60 font-semibold text-sm">
            <span className="material-symbols-outlined text-[18px]">policy</span>
            Audit Logs
          </Link>
          <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-xl text-white shadow-lg shadow-violet-500/20 font-semibold text-sm">
            <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
            Superuser
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3 stagger-children">
        
        {/* Total Users */}
        <div className="glass-card p-6 sm:p-8 flex flex-col justify-between group relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-500">
            <span className="material-symbols-outlined text-8xl text-indigo-600">group</span>
          </div>
          <div>
            <p className="text-sm font-semibold tracking-wider text-slate-500 uppercase flex items-center gap-2">
              <span className="material-symbols-outlined text-indigo-500">group</span>
              Active Users
            </p>
            {loading ? (
              <div className="mt-3 h-12 w-24 skeleton-shimmer rounded-xl" />
            ) : (
              <h2 className="mt-3 text-5xl font-extrabold text-slate-900 font-mono-data">
                {stats.totalUsers.toLocaleString()}
              </h2>
            )}
          </div>
          <div className="mt-8">
            <Link href="/admin/users" className="text-sm font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
              Manage Directory <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>
        </div>

        {/* High Value Transfers */}
        <div className="glass-card p-6 sm:p-8 flex flex-col justify-between group relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-500">
            <span className="material-symbols-outlined text-8xl text-rose-600">gavel</span>
          </div>
          <div>
            <p className="text-sm font-semibold tracking-wider text-slate-500 uppercase flex items-center gap-2">
              <span className="material-symbols-outlined text-rose-500">gavel</span>
              Tier-2 Approvals
            </p>
            {loading ? (
              <div className="mt-3 h-12 w-20 skeleton-shimmer rounded-xl" />
            ) : (
              <h2 className="mt-3 text-5xl font-extrabold text-slate-900 font-mono-data">
                {stats.pendingTransactions}
              </h2>
            )}
          </div>
          <div className="mt-8">
            <Link href="/admin/transactions" className="text-sm font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1">
              Review High-Value Transfers <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>
        </div>

        {/* High Value Loans */}
        <div className="glass-card p-6 sm:p-8 flex flex-col justify-between group relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-500">
            <span className="material-symbols-outlined text-8xl text-amber-600">account_balance</span>
          </div>
          <div>
            <p className="text-sm font-semibold tracking-wider text-slate-500 uppercase flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-500">account_balance</span>
              Enterprise Loans
            </p>
            {loading ? (
              <div className="mt-3 h-12 w-20 skeleton-shimmer rounded-xl" />
            ) : (
              <h2 className="mt-3 text-5xl font-extrabold text-slate-900 font-mono-data">
                {stats.pendingLoans}
              </h2>
            )}
          </div>
          <div className="mt-8">
            <Link href="/admin/loans" className="text-sm font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1">
              Review Loan Escalations <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>
        </div>
      </div>
      
      {/* System Status Table Mock */}
      <div className="mt-8 glass-card p-6">
        <h3 className="font-bold text-slate-900 mb-6">Core Infrastructure Status</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            { name: 'API Gateway', status: 'Operational', ping: '12ms' },
            { name: 'Workflow Engine', status: 'Operational', ping: '45ms' },
            { name: 'Identity Provider', status: 'Operational', ping: '22ms' },
            { name: 'Message Broker', status: 'Operational', ping: '8ms' },
          ].map(service => (
            <div key={service.name} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-white/50">
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-slate-800">{service.name}</span>
                <span className="text-xs text-slate-400 font-mono-data">Ping: {service.ping}</span>
              </div>
              <div className="flex h-3 w-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
