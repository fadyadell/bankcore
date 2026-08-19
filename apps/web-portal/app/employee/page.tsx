'use client';
import { useEffect, useState } from 'react';

export default function EmployeeDashboard() {
  const [stats, setStats] = useState({
    pendingTransactions: 0,
    pendingLoans: 0,
    totalUsers: 0,
    totalAccounts: 0,
  });

  useEffect(() => {
    // In a real scenario, this would have the Keycloak JWT token attached
    fetch('http://localhost:3100/admin/stats')
      .then((res) => res.json())
      .then((data) => {
        if (!data.statusCode) {
          setStats(data);
        }
      })
      .catch(console.error);
  }, []);

  return (
    <div className="bg-slate-50 text-on-surface font-body-md text-body-md h-full flex overflow-hidden">
      {/* SideNavBar */}
      <aside className="hidden md:flex flex-col bg-surface-container-low border-r border-outline-variant h-screen w-64 pt-6 pb-lg px-md gap-sm">
        <div className="mb-lg px-unit">
          <h2 className="text-title-md font-title-md text-primary">BankCore</h2>
          <p className="text-body-sm font-body-sm text-on-surface-variant">Employee Portal</p>
        </div>
        <nav className="flex-1 flex flex-col gap-xs">
          <a
            className="flex items-center gap-md px-md py-sm bg-secondary-container text-on-secondary-container font-bold rounded-lg scale-[0.98] transition-transform duration-150"
            href="#"
          >
            <span
              className="material-symbols-outlined"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              dashboard
            </span>
            <span className="text-label-md font-label-md">Dashboard</span>
          </a>
          <a
            className="flex items-center gap-md px-md py-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors rounded-lg"
            href="#"
          >
            <span className="material-symbols-outlined">receipt_long</span>
            <span className="text-label-md font-label-md">Transactions</span>
          </a>
          <a
            className="flex items-center gap-md px-md py-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors rounded-lg"
            href="#"
          >
            <span className="material-symbols-outlined">real_estate_agent</span>
            <span className="text-label-md font-label-md">Loans</span>
          </a>
        </nav>
      </aside>

      {/* Main Content Canvas */}
      <main className="flex-1 overflow-y-auto pt-6 px-lg">
        <div className="max-w-[1600px] mx-auto space-y-gutter">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-md mb-8">
            <div>
              <h1 className="text-headline-lg font-headline-lg text-slate-900">
                Operational Overview
              </h1>
              <p className="text-body-md font-body-md text-slate-500 mt-1">
                Real-time task queue and manual review status.
              </p>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-between h-32">
              <div className="flex justify-between items-start">
                <span className="text-sm font-medium text-slate-500">Pending Transactions</span>
                <span className="material-symbols-outlined text-rose-500">warning</span>
              </div>
              <div className="text-3xl font-bold text-slate-900">{stats.pendingTransactions}</div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-between h-32">
              <div className="flex justify-between items-start">
                <span className="text-sm font-medium text-slate-500">Pending Loan Approvals</span>
                <span className="material-symbols-outlined text-blue-500">real_estate_agent</span>
              </div>
              <div className="text-3xl font-bold text-slate-900">{stats.pendingLoans}</div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-between h-32">
              <div className="flex justify-between items-start">
                <span className="text-sm font-medium text-slate-500">Total System Users</span>
                <span className="material-symbols-outlined text-purple-500">group</span>
              </div>
              <div className="text-3xl font-bold text-slate-900">{stats.totalUsers}</div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-between h-32">
              <div className="flex justify-between items-start">
                <span className="text-sm font-medium text-slate-500">Total Accounts</span>
                <span className="material-symbols-outlined text-emerald-500">account_balance</span>
              </div>
              <div className="text-3xl font-bold text-slate-900">{stats.totalAccounts}</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
