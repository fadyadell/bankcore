'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { apiClient } from '../../../../lib/apiClient';

export default function NewLoanPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    amount: '',
    purpose: '',
    termMonths: '12'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await apiClient.post('/loans', {
        amount: parseFloat(formData.amount),
        purpose: formData.purpose,
        termMonths: parseInt(formData.termMonths, 10)
      });
      // Redirect to loans page on success
      router.push('/loans');
    } catch (err: any) {
      console.error("Loan application failed", err);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setError((err as any).response?.data?.message || "Loan application failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Apply for a Loan</h1>
        <p className="text-slate-500">Get the funds you need quickly and securely.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Loan Application</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="amount" className="text-sm font-medium text-slate-700">Loan Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                <input
                  id="amount"
                  name="amount"
                  type="number"
                  min="100"
                  step="100"
                  placeholder="5000.00"
                  value={formData.amount}
                  onChange={handleChange}
                  required
                  className="w-full rounded-md border border-slate-300 pl-8 pr-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="termMonths" className="text-sm font-medium text-slate-700">Loan Term</label>
              <select
                id="termMonths"
                name="termMonths"
                value={formData.termMonths}
                onChange={handleChange}
                required
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                <option value="6">6 Months</option>
                <option value="12">12 Months</option>
                <option value="24">24 Months</option>
                <option value="36">36 Months</option>
                <option value="48">48 Months</option>
                <option value="60">60 Months</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="purpose" className="text-sm font-medium text-slate-700">Purpose</label>
              <input
                id="purpose"
                name="purpose"
                type="text"
                placeholder="e.g., Home Renovation, Auto, Personal"
                value={formData.purpose}
                onChange={handleChange}
                required
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => router.back()} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Application'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
