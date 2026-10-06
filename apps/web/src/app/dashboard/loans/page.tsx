'use client';

import { useEffect, useState } from 'react';
import { getMyLoans, createLoan } from '@/lib/apiClient';
import type { LoanDto } from '@bankcore/contracts';

export default function CustomerLoansPage() {
  const [loans, setLoans] = useState<LoanDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showApply, setShowApply] = useState(false);
  const [amount, setAmount] = useState('');
  const [termMonths, setTermMonths] = useState('12');
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    getMyLoans().then(res => {
      if (res.data) setLoans(res.data);
      else setError(res.error?.message || 'Failed to load loans');
      setLoading(false);
    });
  };

  useEffect(() => { load(); }, []);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);
    setActionSuccess(null);
    setSubmitting(true);
    const amt = parseFloat(amount);
    const term = parseInt(termMonths, 10);
    
    if (isNaN(amt) || amt <= 0 || isNaN(term) || term <= 0) { 
      setActionError('Invalid loan parameters'); 
      setSubmitting(false); 
      return; 
    }

    const res = await createLoan(amt, term);
    setSubmitting(false);
    
    if (res.error) { 
      setActionError(res.error.message); 
      return; 
    }
    
    setActionSuccess('Loan application submitted successfully!');
    setAmount(''); 
    setTermMonths('12');
    setShowApply(false);
    setLoading(true);
    load();
  };

  if (loading) return <div className="loading-page"><div className="loading-spinner" /><p>Loading loans...</p></div>;
  if (error) return <div className="alert alert-error">{error}</div>;

  const statusBadge = (status: string) => {
    if (status === 'APPROVED' || status === 'ACTIVE') return 'badge-green';
    if (status === 'REJECTED') return 'badge-red';
    if (status === 'PAID') return 'badge-blue';
    return 'badge-amber';
  };

  return (
    <div>
      <div className="page-header">
        <div><h1>My Loans</h1><p>View your active loans and apply for new ones.</p></div>
        <button className="btn btn-primary" onClick={() => setShowApply(true)}>+ Apply for Loan</button>
      </div>

      {actionSuccess && <div className="alert alert-success">{actionSuccess}</div>}

      {loans.length === 0 ? (
        <div className="empty-state"><p>No loans found</p><span>You have no active or past loans.</span></div>
      ) : (
        <div className="table-container">
          <table>
            <thead><tr>
              <th>Date</th><th>Amount</th><th>Term</th><th>Interest</th><th>Status</th>
            </tr></thead>
            <tbody>
              {loans.map(loan => (
                <tr key={loan.id}>
                  <td>{new Date(loan.createdAt).toLocaleDateString()}</td>
                  <td style={{ fontWeight: 600 }}>${loan.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  <td>{loan.termMonths} months</td>
                  <td>{loan.interestRate ? `${loan.interestRate}%` : 'TBD'}</td>
                  <td><span className={`badge ${statusBadge(loan.status)}`}>{loan.status.replace('_', ' ')}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showApply && (
        <div className="modal-overlay" onClick={() => setShowApply(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Apply for a Loan</h2>
            {actionError && <div className="alert alert-error">{actionError}</div>}
            <form onSubmit={handleApply}>
              <div className="form-group">
                <label className="form-label">Loan Amount ($)</label>
                <input className="form-input" type="number" step="100" min="500" value={amount} onChange={e => setAmount(e.target.value)} placeholder="5000" required />
              </div>
              <div className="form-group">
                <label className="form-label">Term (Months)</label>
                <select className="form-select" value={termMonths} onChange={e => setTermMonths(e.target.value)} required>
                  <option value="6">6 Months</option>
                  <option value="12">12 Months</option>
                  <option value="24">24 Months</option>
                  <option value="36">36 Months</option>
                  <option value="48">48 Months</option>
                  <option value="60">60 Months</option>
                </select>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                Note: Interest rate will be determined during the review process based on your account history and credit score.
              </p>
              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setShowApply(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit Application'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
