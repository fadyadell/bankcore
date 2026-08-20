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
    <div className="mx-auto max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Transfer Money</h1>
        <p className="text-slate-500">Send money securely to another account.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transfer Details</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="debitAccountId" className="text-sm font-medium text-slate-700">From Account</label>
              <select
                id="debitAccountId"
                name="debitAccountId"
                value={formData.debitAccountId}
                onChange={handleChange}
                required
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>
                    {acc.type} (...{acc.accountNumber.slice(-4)}) - {Number(acc.balance).toLocaleString('en-US', { style: 'currency', currency: acc.currency || 'USD' })}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="creditAccountId" className="text-sm font-medium text-slate-700">To Account (Recipient ID)</label>
              <input
                id="creditAccountId"
                name="creditAccountId"
                type="text"
                placeholder="Enter recipient account ID"
                value={formData.creditAccountId}
                onChange={handleChange}
                required
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="amount" className="text-sm font-medium text-slate-700">Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
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
                  className="w-full rounded-md border border-slate-300 pl-8 pr-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium text-slate-700">Description (Optional)</label>
              <input
                id="description"
                name="description"
                type="text"
                placeholder="What is this for?"
                value={formData.description}
                onChange={handleChange}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => router.back()} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={submitting}>
                {submitting ? 'Processing...' : 'Send Transfer'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
