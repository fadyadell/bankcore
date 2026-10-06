'use client';

import { useState, useEffect } from 'react';
import { getTransactions } from '@/lib/apiClient';
import type { TransactionDto } from '@bankcore/contracts';

export default function EmployeeTransactionsPage() {
  const [data, setData] = useState<{ items: TransactionDto[]; total: number; page: number; totalPages: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [accountId, setAccountId] = useState('');

  useEffect(() => {
    let active = true;
    getTransactions({ page, pageSize: 20, accountId }).then(res => {
      if (!active) return;
      if (res.data) setData(res.data);
      else setError(res.error?.message || 'Failed to load');
      setLoading(false);
    });
    return () => { active = false; };
  }, [page, accountId]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setPage(1);
  };

  if (loading && !data) return <div className="loading-page"><div className="loading-spinner" /><p>Loading transactions...</p></div>;

  return (
    <div className="fade-in">
      <header className="page-header">
        <div>
          <h1>Global Transactions</h1>
          <p className="text-secondary">Monitor system-wide transaction activity</p>
        </div>
      </header>

      {error && <div className="alert alert-error mb-6">{error}</div>}

      <div className="card mb-6">
        <form className="flex gap-4 mb-4" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Filter by Account ID..."
            className="input flex-1"
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
          />
          <button type="submit" className="btn btn-primary">Filter</button>
        </form>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Tx ID</th>
                <th>Type</th>
                <th>Amount</th>
                <th>From Account</th>
                <th>To Account</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {data?.items.map(tx => (
                <tr key={tx.id}>
                  <td><code className="text-xs text-muted">{tx.id.substring(0, 8)}...</code></td>
                  <td>
                    <span className={`badge ${tx.type === 'DEPOSIT' ? 'badge-success' : tx.type === 'WITHDRAWAL' ? 'badge-error' : 'badge-warning'}`}>
                      {tx.type}
                    </span>
                  </td>
                  <td className="font-medium font-mono">${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td>{tx.fromAccountId ? <code className="text-xs text-muted">{tx.fromAccountId}</code> : '-'}</td>
                  <td>{tx.toAccountId ? <code className="text-xs text-muted">{tx.toAccountId}</code> : '-'}</td>
                  <td>
                    <span className={`badge ${tx.status === 'COMPLETED' ? 'badge-success' : tx.status === 'PENDING' ? 'badge-warning' : 'badge-error'}`}>
                      {tx.status}
                    </span>
                  </td>
                  <td className="text-sm text-secondary">{new Date(tx.createdAt).toLocaleString()}</td>
                </tr>
              ))}
              {data?.items.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center text-muted py-8">No transactions found.</td>
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
