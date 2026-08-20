'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { apiClient } from '../../../lib/apiClient';

interface Transaction {
  id: string;
  amount: number;
  type: string;
  status: string;
  createdAt: string;
  description?: string;
  accountId?: string;
}

export default function TransactionsPage() {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    apiClient.get('/transactions')
      .then(res => {
        const data = res.data.data || res.data || [];
        setTransactions(Array.isArray(data) ? data : []);
      })
      .catch(err => console.error("Failed to fetch transactions", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Transactions</h1>
          <p className="text-slate-500">View and search your transaction history across all accounts.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <span className="material-symbols-outlined mr-2 text-sm">filter_list</span>
            Filter
          </Button>
          <Button variant="primary" asChild>
            <Link href="/transactions/new">
              <span className="material-symbols-outlined mr-2 text-sm">add</span>
              New Transfer
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>All Transactions</CardTitle>
            <div className="relative w-full max-w-sm">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
              <input 
                type="text" 
                placeholder="Search description or amount..." 
                className="h-9 w-full rounded-md border border-slate-200 bg-white pl-9 pr-4 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date & Time</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Account ID</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({length: 6}).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="ml-auto h-4 w-24" /></TableCell>
                    <TableCell className="text-center"><Skeleton className="mx-auto h-6 w-20 rounded-full" /></TableCell>
                  </TableRow>
                ))
              ) : transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-12 text-center text-slate-500">
                    <span className="material-symbols-outlined mx-auto mb-2 text-3xl text-slate-400">receipt_long</span>
                    <p>No transactions found.</p>
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((txn) => (
                  <TableRow key={txn.id}>
                    <TableCell className="whitespace-nowrap text-slate-500">
                      {new Date(txn.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell className="font-medium text-slate-900">
                      {txn.description || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{txn.type}</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-slate-400">
                      {txn.accountId?.slice(0, 8) || '---'}
                    </TableCell>
                    <TableCell className={`text-right font-medium whitespace-nowrap ${txn.amount > 0 ? 'text-emerald-600' : 'text-slate-900'}`}>
                      {txn.amount > 0 ? '+' : ''}{Number(txn.amount).toLocaleString('en-US', {style: 'currency', currency: 'USD'})}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge 
                        variant={
                          txn.status === 'COMPLETED' ? 'success' : 
                          txn.status === 'PENDING' ? 'warning' : 
                          txn.status === 'REJECTED' ? 'destructive' : 'secondary'
                        }
                      >
                        {txn.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
