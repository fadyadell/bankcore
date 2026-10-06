'use client';

import { useEffect, useState } from 'react';
import { getMyAccounts, deposit, withdraw, transfer } from '@/lib/apiClient';
import type { AccountDto } from '@bankcore/contracts';

export default function CustomerAccountsPage() {
  const [accounts, setAccounts] = useState<AccountDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<'deposit' | 'withdraw' | 'transfer' | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [amount, setAmount] = useState('');
  const [reference, setReference] = useState('');
  const [toAccountId, setToAccountId] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    getMyAccounts().then(res => {
      if (res.data) setAccounts(res.data);
      else setError(res.error?.message || 'Failed to load accounts');
      setLoading(false);
    });
  };

  useEffect(() => { load(); }, []);

  const handleAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);
    setActionSuccess(null);
    setSubmitting(true);
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) { setActionError('Enter a valid amount'); setSubmitting(false); return; }

    let res;
    if (modal === 'deposit') res = await deposit(selectedAccount, amt, reference || undefined);
    else if (modal === 'withdraw') res = await withdraw(selectedAccount, amt, reference || undefined);
    else if (modal === 'transfer') res = await transfer(selectedAccount, toAccountId, amt, reference || undefined);

    setSubmitting(false);
    if (res?.error) { setActionError(res.error.message); return; }
    setActionSuccess(`${modal!.charAt(0).toUpperCase() + modal!.slice(1)} successful!`);
    setAmount(''); setReference(''); setToAccountId('');
    setModal(null);
    setLoading(true);
    load();
  };

  const openModal = (type: 'deposit' | 'withdraw' | 'transfer', accId: string) => {
    setSelectedAccount(accId);
    setModal(type);
    setActionError(null);
    setActionSuccess(null);
    setAmount('');
    setReference('');
    setToAccountId('');
  };

  if (loading) return <div className="loading-page"><div className="loading-spinner" /><p>Loading accounts...</p></div>;
  if (error) return <div className="alert alert-error">{error}</div>;

  return (
    <div>
      <div className="page-header">
        <div><h1>My Accounts</h1><p>Manage your bank accounts and perform transactions.</p></div>
      </div>

      {actionSuccess && <div className="alert alert-success">{actionSuccess}</div>}

      {accounts.length === 0 ? (
        <div className="empty-state"><p>No accounts found</p><span>Contact your bank to open an account.</span></div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {accounts.map(acc => (
            <div key={acc.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: '1.125rem', fontWeight: 700 }}>{acc.type} Account</span>
                    <span className={`badge ${acc.status === 'ACTIVE' ? 'badge-green' : acc.status === 'SUSPENDED' ? 'badge-amber' : 'badge-red'}`}>{acc.status}</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>ID: {acc.id.slice(0, 8)}...</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-green)' }}>
                    ${acc.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{acc.currency}</div>
                </div>
              </div>
              {acc.status === 'ACTIVE' && (
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                  <button className="btn btn-success btn-sm" onClick={() => openModal('deposit', acc.id)}>💰 Deposit</button>
                  <button className="btn btn-danger btn-sm" onClick={() => openModal('withdraw', acc.id)}>💳 Withdraw</button>
                  <button className="btn btn-primary btn-sm" onClick={() => openModal('transfer', acc.id)}>🔄 Transfer</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{modal.charAt(0).toUpperCase() + modal.slice(1)}</h2>
            {actionError && <div className="alert alert-error">{actionError}</div>}
            <form onSubmit={handleAction}>
              {modal === 'transfer' && (
                <div className="form-group">
                  <label className="form-label">To Account ID</label>
                  <input className="form-input" value={toAccountId} onChange={e => setToAccountId(e.target.value)} placeholder="Destination account ID" required />
                </div>
              )}
              <div className="form-group">
                <label className="form-label">Amount ($)</label>
                <input className="form-input" type="number" step="0.01" min="0.01" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" required />
              </div>
              <div className="form-group">
                <label className="form-label">Reference (optional)</label>
                <input className="form-input" value={reference} onChange={e => setReference(e.target.value)} placeholder="Description" />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Processing...' : 'Confirm'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
