'use client';

import { useEffect, useState } from 'react';
import { getMyTransactions } from '@/lib/apiClient';
import type { TransactionDto, PaginatedResponse } from '@bankcore/contracts';

export default function CustomerTransactionsPage() {
  const [data, setData] = useState<PaginatedResponse<TransactionDto> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    let active = true;
    getMyTransactions({ page, pageSize: 15 }).then(res => {
      if (!active) return;
      if (res.data) setData(res.data);
      else setError(res.error?.message || 'Failed to load');
      setLoading(false);
    });
    return () => { active = false; };
  }, [page]);

  if (loading) return <div className="loading-page"><div className="loading-spinner" /><p>Loading transactions...</p></div>;
  if (error) return <div className="alert alert-error">{error}</div>;
  if (!data) return null;

  const typeBadge = (type: string) => {
    if (type === 'DEPOSIT') return 'badge-green';
    if (type === 'WITHDRAWAL') return 'badge-red';
    return 'badge-blue';
  };

  return (
    <div>
      <div className="page-header">
        <div><h1>Transaction History</h1><p>View all your past transactions.</p></div>
      </div>

      {data.items.length === 0 ? (
        <div className="empty-state"><p>No transactions found</p><span>Perform a deposit, withdrawal, or transfer to see transactions here.</span></div>
      ) : (
        <>
          <div className="table-container">
            <table>
              <thead><tr>
                <th>Date</th><th>Type</th><th>Amount</th><th>Status</th><th>Reference</th>
              </tr></thead>
              <tbody>
                {data.items.map(tx => (
                  <tr key={tx.id}>
                    <td>{new Date(tx.createdAt).toLocaleString()}</td>
                    <td><span className={`badge ${typeBadge(tx.type)}`}>{tx.type}</span></td>
                    <td style={{
                      fontWeight: 600,
                      color: tx.type === 'DEPOSIT' ? 'var(--accent-green)' : tx.type === 'WITHDRAWAL' ? 'var(--accent-red)' : 'var(--accent-blue)'
                    }}>
                      {tx.type === 'DEPOSIT' ? '+' : '-'}${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td><span className={`badge ${tx.status === 'COMPLETED' ? 'badge-green' : tx.status === 'FAILED' ? 'badge-red' : 'badge-amber'}`}>{tx.status}</span></td>
                    <td style={{ color: 'var(--text-muted)' }}>{tx.reference || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="pagination">
            <span>Page {data.page} of {data.totalPages} ({data.total} total)</span>
            <div className="pagination-buttons">
              <button className="btn btn-ghost btn-sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</button>
              <button className="btn btn-ghost btn-sm" disabled={page >= data.totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
