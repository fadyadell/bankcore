'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { apiClient } from '../../../../lib/apiClient';

interface Account {
  id: string;
  accountNumber: string;
  type: string;
  balance: number;
  currency: string;
}

export default function NewTransactionPage() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    debitAccountId: '',
    creditAccountId: '',
    amount: '',
    description: ''
  });

  useEffect(() => {
    apiClient.get('/accounts')
      .then(res => {
        const data = res.data.data || res.data || [];
        setAccounts(Array.isArray(data) ? data : []);
        if (data.length > 0) {
          setFormData(prev => ({ ...prev, debitAccountId: data[0].id }));
        }
      })
      .catch(err => {
        console.error("Failed to fetch accounts", err);
        setError("Failed to load your accounts.");
      })
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const idempotencyKey = crypto.randomUUID();
      await apiClient.post('/transactions', {
        type: 'TRANSFER',
        fromAccountId: formData.debitAccountId,
        toAccountId: formData.creditAccountId,
        amount: parseFloat(formData.amount),
        description: formData.description,
        idempotencyKey
      }, {
        headers: {
          'Idempotency-Key': idempotencyKey
        }
      });
      // Redirect to transactions page on success
      router.push('/transactions');
    } catch (err: any) {
      console.error("Transfer failed", err);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setError((err as any).response?.data?.message || "Transfer failed. Please check the details and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl animate-fade-in pb-10">
      <div className="mb-8 glass-card p-6 border-none shadow-sm bg-white/40">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 font-display gradient-text">Transfer Money</h1>
        <p className="mt-1.5 text-sm text-slate-500 font-medium">Send money securely to another account.</p>
      </div>

      <div className="glass-card p-8">
        <h2 className="text-xl font-bold mb-6 text-slate-800">Transfer Details</h2>
        
        {error && (
          <div className="mb-6 rounded-xl bg-red-50/80 backdrop-blur-md p-4 text-sm font-semibold text-red-600 border border-red-200 shadow-sm">
            <span className="material-symbols-outlined align-middle mr-2">error</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 stagger-children">
          <div className="space-y-2">
            <label htmlFor="debitAccountId" className="text-sm font-bold tracking-wide text-slate-700 uppercase">From Account</label>
            <select
              id="debitAccountId"
              name="debitAccountId"
              value={formData.debitAccountId}
              onChange={handleChange}
              required
              className="block w-full px-4 py-4 bg-white/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:bg-white text-md font-bold shadow-sm appearance-none"
            >
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>
                  {acc.type} (...{acc.accountNumber.slice(-4)}) - {Number(acc.balance).toLocaleString('en-US', { style: 'currency', currency: acc.currency || 'USD' })}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="creditAccountId" className="text-sm font-bold tracking-wide text-slate-700 uppercase">To Account (Recipient ID)</label>
            <input
              id="creditAccountId"
              name="creditAccountId"
              type="text"
              placeholder="Enter recipient account ID"
              value={formData.creditAccountId}
              onChange={handleChange}
              required
              className="block w-full px-4 py-4 bg-white/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:bg-white text-md shadow-sm"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="amount" className="text-sm font-bold tracking-wide text-slate-700 uppercase">Amount</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="text-slate-400 font-mono-data font-bold text-lg group-focus-within:text-blue-500 transition-colors">$</span>
              </div>
              <input
                id="amount"
                name="amount"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0.00"
                value={formData.amount}
                onChange={handleChange}
                required
                className="block w-full pl-10 pr-4 py-4 bg-white/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:bg-white text-lg font-mono-data font-bold shadow-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-bold tracking-wide text-slate-700 uppercase">Description (Optional)</label>
            <input
              id="description"
              name="description"
              type="text"
              placeholder="What is this for?"
              value={formData.description}
              onChange={handleChange}
              className="block w-full px-4 py-4 bg-white/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:bg-white text-md shadow-sm"
            />
          </div>

          <div className="pt-8 mt-8 border-t border-slate-100 flex gap-4 justify-end">
            <Button type="button" variant="outline" className="px-6 py-6 rounded-xl font-bold" onClick={() => router.back()} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="px-8 py-6 rounded-xl font-bold shadow-lg shadow-blue-500/20 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700" disabled={submitting}>
              {submitting ? 'Processing...' : 'Send Transfer'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
