'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { apiClient } from '../../../lib/apiClient';

interface Loan {
  id: string;
  amount: number;
  type: string;
  interestRate: number;
  termMonths: number;
  status: string;
  createdAt: string;
}

export default function LoansPage() {
  const [loading, setLoading] = useState(true);
  const [loans, setLoans] = useState<Loan[]>([]);

  useEffect(() => {
    apiClient.get('/loans')
      .then(res => {
        const data = res.data.data || res.data || [];
        setLoans(Array.isArray(data) ? data : []);
      })
      .catch(err => console.error("Failed to fetch loans", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Loans</h1>
          <p className="text-slate-500">Manage your loan applications and active loans.</p>
        </div>
        <Button variant="primary" asChild>
          <Link href="/loans/new">
            <span className="material-symbols-outlined mr-2 text-sm">post_add</span>
            Apply for Loan
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          Array.from({length: 2}).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="mb-4 h-6 w-32" />
                <Skeleton className="mb-2 h-10 w-48" />
                <Skeleton className="h-4 w-40" />
              </CardContent>
            </Card>
          ))
        ) : loans.length === 0 ? (
          <div className="col-span-full rounded-xl border border-dashed border-slate-300 bg-slate-50 py-12 text-center text-slate-500">
            <span className="material-symbols-outlined mx-auto mb-4 text-4xl text-slate-400">real_estate_agent</span>
            <h3 className="mb-2 text-lg font-medium text-slate-900">No Loans Found</h3>
            <p className="mb-6 max-w-sm mx-auto text-sm">You have no active loans or pending applications. Need funding? Apply today with competitive rates.</p>
            <Button variant="outline">View Loan Options</Button>
          </div>
        ) : (
          loans.map((loan) => (
            <Card key={loan.id} className="flex flex-col transition-shadow hover:shadow-md">
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div>
                  <CardTitle className="text-lg">{loan.type}</CardTitle>
                  <p className="text-sm text-slate-500 mt-1">
                    Applied: {new Date(loan.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <Badge 
                  variant={
                    loan.status === 'APPROVED' ? 'success' : 
                    loan.status === 'PENDING' ? 'warning' : 
                    loan.status === 'REJECTED' ? 'destructive' : 'secondary'
                  }
                >
                  {loan.status}
                </Badge>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="mt-4 flex flex-col gap-2">
                  <div className="flex justify-between items-end">
                    <span className="text-sm text-slate-500">Principal</span>
                    <span className="text-2xl font-bold tracking-tight text-slate-900">
                      {Number(loan.amount).toLocaleString('en-US', {style: 'currency', currency: 'USD'})}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">Term</span>
                    <span className="font-medium text-slate-900">{loan.termMonths} Months</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">Interest Rate</span>
                    <span className="font-medium text-slate-900">{loan.interestRate}% APR</span>
                  </div>
                </div>
                <div className="mt-6 flex gap-3">
                  <Button variant="outline" className="w-full">Details</Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
