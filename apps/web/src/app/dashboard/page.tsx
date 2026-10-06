'use client';

import { useEffect, useState } from 'react';
import { getCustomerDashboard } from '@/lib/apiClient';
import type { CustomerDashboard } from '@bankcore/contracts';
import Link from 'next/link';

export default function CustomerDashboardPage() {
  const [data, setData] = useState<CustomerDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getCustomerDashboard().then(res => {
      if (res.data) setData(res.data);
      else setError(res.error?.message || 'Failed to load dashboard');
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="loading-page"><div className="loading-spinner" /><p>Loading dashboard...</p></div>;
  if (error) return <div className="alert alert-error">{error}</div>;
  if (!data) return null;

  const totalBalance = data.accounts.reduce((s, a) => s + a.balance, 0);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Welcome back! Here&#39;s your financial overview.</p>
        </div>
      </div>

      <div className="grid-stats">
        <div className="stat-card">
          <div className="stat-label">Total Balance</div>
          <div className="stat-value" style={{ color: 'var(--accent-green)' }}>
            ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="stat-sub">Across {data.accounts.length} account{data.accounts.length !== 1 ? 's' : ''}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Active Loans</div>
          <div className="stat-value">{data.activeLoans.length}</div>
          <div className="stat-sub">
            {data.activeLoans.filter(l => ['PENDING', 'RISK_ASSESSED', 'EMPLOYEE_REVIEW', 'ADMIN_REVIEW'].includes(l.status)).length} pending review
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Notifications</div>
          <div className="stat-value">{data.unreadNotifications}</div>
          <div className="stat-sub">Unread messages</div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <h2>Accounts</h2>
            <Link href="/dashboard/accounts" className="btn btn-ghost btn-sm">View all</Link>
          </div>
          {data.accounts.length === 0 ? (
            <div className="empty-state"><p>No accounts yet</p></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {data.accounts.map(acc => (
                <div key={acc.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '0.75rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)'
                }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{acc.type} Account</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{acc.currency}</div>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '1.125rem', color: 'var(--accent-green)' }}>
                    ${acc.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <h2>Recent Transactions</h2>
            <Link href="/dashboard/transactions" className="btn btn-ghost btn-sm">View all</Link>
          </div>
          {data.recentTransactions.length === 0 ? (
            <div className="empty-state"><p>No transactions yet</p></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {data.recentTransactions.slice(0, 5).map(tx => (
                <div key={tx.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '0.625rem 0', borderBottom: '1px solid var(--border-color)'
                }}>
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>{tx.type}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div style={{
                    fontWeight: 600,
                    color: tx.type === 'DEPOSIT' ? 'var(--accent-green)' : tx.type === 'WITHDRAWAL' ? 'var(--accent-red)' : 'var(--accent-blue)'
                  }}>
                    {tx.type === 'DEPOSIT' ? '+' : '-'}${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
