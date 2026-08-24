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
    <div className="mx-auto max-w-2xl animate-fade-in pb-10">
      <div className="mb-8 glass-card p-6 border-none shadow-sm bg-white/40">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 font-display gradient-text">Apply for a Loan</h1>
        <p className="mt-1.5 text-sm text-slate-500 font-medium">Get the funds you need quickly and securely.</p>
      </div>

      <div className="glass-card p-8">
        <h2 className="text-xl font-bold mb-6 text-slate-800">Loan Details</h2>
        
        {error && (
          <div className="mb-6 rounded-xl bg-red-50/80 backdrop-blur-md p-4 text-sm font-semibold text-red-600 border border-red-200 shadow-sm">
            <span className="material-symbols-outlined align-middle mr-2">error</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 stagger-children">
          <div className="space-y-2">
            <label htmlFor="amount" className="text-sm font-bold tracking-wide text-slate-700 uppercase">Loan Amount</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="text-slate-400 font-mono-data font-bold text-lg group-focus-within:text-blue-500 transition-colors">$</span>
              </div>
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
                className="block w-full pl-10 pr-4 py-4 bg-white/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:bg-white text-lg font-mono-data font-bold shadow-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="termMonths" className="text-sm font-bold tracking-wide text-slate-700 uppercase">Loan Term</label>
            <select
              id="termMonths"
              name="termMonths"
              value={formData.termMonths}
              onChange={handleChange}
              required
              className="block w-full px-4 py-4 bg-white/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:bg-white text-md font-bold shadow-sm appearance-none"
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
            <label htmlFor="purpose" className="text-sm font-bold tracking-wide text-slate-700 uppercase">Purpose</label>
            <input
              id="purpose"
              name="purpose"
              type="text"
              placeholder="e.g., Home Renovation, Auto, Personal"
              value={formData.purpose}
              onChange={handleChange}
              required
              className="block w-full px-4 py-4 bg-white/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:bg-white text-md shadow-sm"
            />
          </div>

          <div className="pt-8 mt-8 border-t border-slate-100 flex gap-4 justify-end">
            <Button type="button" variant="outline" className="px-6 py-6 rounded-xl font-bold" onClick={() => router.back()} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="px-8 py-6 rounded-xl font-bold shadow-lg shadow-blue-500/20 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700" disabled={submitting}>
              {submitting ? 'Processing...' : 'Submit Application'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
