'use client';

import { useState, useEffect } from 'react';
import { getAccounts } from '@/lib/apiClient';
import type { AccountDto } from '@bankcore/contracts';

export default function EmployeeAccountsPage() {
  const [data, setData] = useState<{ items: Account[]; total: number; page: number; totalPages: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  type Account = AccountDto & { user?: { firstName: string; lastName: string; email: string } };

  useEffect(() => {
    let active = true;
    getAccounts({ page, pageSize: 15, userId: search, status }).then(res => {
      if (!active) return;
      if (res.data) setData(res.data as unknown as { items: Account[]; total: number; page: number; totalPages: number });
      else setError(res.error?.message || 'Failed to load');
      setLoading(false);
    });
    return () => { active = false; };
  }, [page, search, status]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setPage(1);
  };

  if (loading && !data) return <div className="loading-page"><div className="loading-spinner" /><p>Loading accounts...</p></div>;

  return (
    <div className="fade-in">
      <header className="page-header">
        <div>
          <h1>Accounts Directory</h1>
          <p className="text-secondary">View and manage all customer accounts</p>
        </div>
      </header>

      {error && <div className="alert alert-error mb-6">{error}</div>}

      <div className="card mb-6">
        <form className="flex gap-4 mb-4" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search by User ID..."
            className="input flex-1"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select className="input w-48" value={status} onChange={e => { setStatus(e.target.value); setLoading(true); setPage(1); }}>
            <option value="">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="CLOSED">Closed</option>
          </select>
          <button type="submit" className="btn btn-primary">Filter</button>
        </form>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Account ID</th>
                <th>Customer</th>
                <th>Type</th>
                <th>Balance</th>
                <th>Status</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {data?.items.map(acc => (
                <tr key={acc.id}>
                  <td><code className="text-xs text-muted">{acc.id}</code></td>
                  <td>
                    {acc.user ? (
                      <div>
                        <div className="font-medium">{acc.user.firstName} {acc.user.lastName}</div>
                        <div className="text-sm text-secondary">{acc.user.email}</div>
                      </div>
                    ) : (
                      <code className="text-xs text-muted">{acc.userId}</code>
                    )}
                  </td>
                  <td><span className="badge">{acc.type}</span></td>
                  <td className="font-medium font-mono">${acc.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td>
                    <span className={`badge ${acc.status === 'ACTIVE' ? 'badge-success' : acc.status === 'SUSPENDED' ? 'badge-warning' : 'badge-error'}`}>
                      {acc.status}
                    </span>
                  </td>
                  <td className="text-sm text-secondary">{new Date(acc.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {data?.items.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center text-muted py-8">No accounts found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {data && data.totalPages > 1 && (
          <div className="pagination mt-4">
            <span>Page {data.page} of {data.totalPages} ({data.total} total)</span>
            <div className="pagination-buttons">
              <button className="btn btn-ghost btn-sm" disabled={page <= 1} onClick={() => { setLoading(true); setPage(p => p - 1); }}>Previous</button>
              <button className="btn btn-ghost btn-sm" disabled={page >= data.totalPages} onClick={() => { setLoading(true); setPage(p => p + 1); }}>Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
