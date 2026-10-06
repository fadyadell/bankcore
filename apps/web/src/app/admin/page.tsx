'use client';

import { useState, useEffect } from 'react';
import { getDashboardStats } from '@/lib/apiClient';
import type { DashboardStats } from '@bankcore/contracts';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getDashboardStats().then(res => {
      if (!active) return;
      if (res.data) setStats(res.data as unknown as DashboardStats);
      setLoading(false);
    });
    return () => { active = false; };
  }, []);

  if (loading || !stats) return <div className="loading-page"><div className="loading-spinner" /><p>Loading dashboard...</p></div>;

  return (
    <div className="fade-in">
      <header className="page-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p className="text-secondary">System-wide overview and metrics</p>
        </div>
      </header>

      <div className="stats-grid mb-8">
        <div className="stat-card">
          <div className="stat-label">Total Users</div>
          <div className="stat-value">{stats.totalUsers}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Accounts</div>
          <div className="stat-value">{stats.totalAccounts}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Balance (Global)</div>
          <div className="stat-value">${stats.totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total / Pending Loans</div>
          <div className="stat-value">{stats.totalLoans} / {stats.pendingLoans}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Quick Links</h2>
          <div className="flex flex-col gap-3">
            <Link href="/admin/users" className="btn btn-outline justify-start">Manage System Users</Link>
            <Link href="/admin/accounts" className="btn btn-outline justify-start">View All Accounts</Link>
            <Link href="/admin/transactions" className="btn btn-outline justify-start">Monitor Global Transactions</Link>
            <Link href="/admin/loans" className="btn btn-outline justify-start">Review Loan Applications</Link>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-4">System Status</h2>
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center p-3 bg-bg-primary rounded-lg border border-border-color">
              <span className="font-medium">Core API</span>
              <span className="badge badge-success">Online</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-bg-primary rounded-lg border border-border-color">
              <span className="font-medium">Database Cluster</span>
              <span className="badge badge-success">Healthy</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-bg-primary rounded-lg border border-border-color">
              <span className="font-medium">Auth Service</span>
              <span className="badge badge-success">Online</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
