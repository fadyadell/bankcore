'use client';

  import { useState, useEffect, useCallback } from 'react';
import { getLoans, reviewLoan } from '@/lib/apiClient';
import type { LoanDto } from '@bankcore/contracts';

export default function AdminLoansPage() {
  const [data, setData] = useState<{ items: LoanDto[]; total: number; page: number; totalPages: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');

  // Review modal state
  const [reviewing, setReviewing] = useState<LoanDto | null>(null);
  const [interestRate, setInterestRate] = useState('5.0');
  const [actionLoading, setActionLoading] = useState(false);

  const load = useCallback(() => {
    let active = true;
    getLoans({ page, pageSize: 10, status }).then(res => {
      if (!active) return;
      if (res.data) setData(res.data);
      else setError(res.error?.message || 'Failed to load');
      setLoading(false);
    });
    return () => { active = false; };
  }, [page, status]);

  useEffect(() => {
    const cleanup = load();
    return cleanup;
  }, [load]);

  const handleReview = async (newStatus: 'APPROVED' | 'REJECTED') => {
    if (!reviewing) return;
    setActionLoading(true);
    const res = await reviewLoan(
      reviewing.id,
      newStatus,
      newStatus === 'APPROVED' ? parseFloat(interestRate) : undefined
    );
    setActionLoading(false);
    if (res.error) {
      alert(res.error.message || 'Failed to review loan');
    } else {
      setReviewing(null);
      setLoading(true);
      load();
    }
  };

  if (loading && !data) return <div className="loading-page"><div className="loading-spinner" /><p>Loading loans...</p></div>;

  return (
    <div className="fade-in">
      <header className="page-header">
        <div>
          <h1>Loan Applications (Admin)</h1>
          <p className="text-secondary">Review and approve customer loan requests</p>
        </div>
      </header>

      {error && <div className="alert alert-error mb-6">{error}</div>}

      <div className="card mb-6">
        <div className="flex gap-4 mb-4">
          <select className="input w-48" value={status} onChange={e => { setStatus(e.target.value); setLoading(true); setPage(1); }}>
            <option value="">All Statuses</option>
            <option value="PENDING">Pending (No Risk Data)</option>
            <option value="RISK_ASSESSED">Risk Assessed</option>
            <option value="EMPLOYEE_REVIEW">Employee Review</option>
            <option value="ADMIN_REVIEW">Admin Review</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Amount</th>
                <th>Term</th>
                <th>Interest Rate</th>
                <th>Status</th>
                <th>Risk Assessment</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data?.items.map(loan => (
                <tr key={loan.id}>
                  <td>
                    {loan.user ? (
                      <div>
                        <div className="font-medium">{loan.user.firstName} {loan.user.lastName}</div>
                        <div className="text-sm text-secondary">{loan.user.email}</div>
                      </div>
                    ) : (
                      <code className="text-xs text-muted">{loan.userId}</code>
                    )}
                  </td>
                  <td className="font-medium font-mono">${loan.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td>{loan.termMonths} mo</td>
                  <td>{loan.interestRate}%</td>
                  <td>
                    <span className={`badge ${loan.status === 'APPROVED' ? 'badge-success' : ['PENDING', 'EMPLOYEE_REVIEW', 'ADMIN_REVIEW', 'RISK_ASSESSED'].includes(loan.status) ? 'badge-warning' : 'badge-error'}`}>
                      {loan.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td>
                    {loan.riskLevel ? (
                      <div className="flex flex-col gap-1 text-sm">
                        <span className={`font-medium ${loan.riskLevel === 'HIGH' ? 'text-red-500' : loan.riskLevel === 'LOW' ? 'text-green-500' : 'text-yellow-500'}`}>
                          {loan.riskLevel} Risk ({loan.riskScore})
                        </span>
                        <span className="text-xs text-secondary">Engine: {loan.riskDecision}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted">N/A</span>
                    )}
                  </td>
                  <td className="text-sm text-secondary">{new Date(loan.createdAt).toLocaleDateString()}</td>
                  <td>
                    {['PENDING', 'EMPLOYEE_REVIEW', 'ADMIN_REVIEW', 'RISK_ASSESSED'].includes(loan.status) && (
                      <button className="btn btn-sm btn-primary" onClick={() => setReviewing(loan)}>Review</button>
                    )}
                  </td>
                </tr>
              ))}
              {data?.items.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center text-muted py-8">No loans found.</td>
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

      {reviewing && (
        <div className="modal show fade-in">
          <div className="modal-content">
            <h2>Review Loan</h2>
            <p className="text-secondary mb-4">
              Reviewing ${reviewing.amount.toLocaleString()} for {reviewing.termMonths} months.
            </p>

            <div className="form-group">
              <label>Approve with Interest Rate (%)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                className="input w-full"
                value={interestRate}
                onChange={e => setInterestRate(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button className="btn btn-ghost" onClick={() => setReviewing(null)} disabled={actionLoading}>Cancel</button>
              <button className="btn btn-error" onClick={() => handleReview('REJECTED')} disabled={actionLoading}>
                {actionLoading ? 'Processing...' : 'Reject'}
              </button>
              <button className="btn btn-success" onClick={() => handleReview('APPROVED')} disabled={actionLoading}>
                {actionLoading ? 'Processing...' : 'Approve'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
