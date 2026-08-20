'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { apiClient } from '../../../lib/apiClient';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface Transaction {
  id: string;
  amount: number;
  type: string;
  status: string;
  createdAt: string;
  description?: string;
}

interface Account {
  id: string;
  accountNumber: string;
  type: string;
  balance: number;
  status: string;
}

// Generate mock data for the chart based on current balance
const generateChartData = (currentBalance: number) => {
  const data = [];
  let bal = currentBalance * 0.8; // Start from 80% of current
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    data.push({
      name: date.toLocaleDateString('en-US', { weekday: 'short' }),
      balance: i === 0 ? currentBalance : bal
    });
    // Random walk towards current balance
    bal += (currentBalance - bal) / (i || 1) + (Math.random() - 0.2) * 500; 
  }
  return data;
};

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [accRes, txRes] = await Promise.all([
          apiClient.get('/accounts'),
          apiClient.get('/transactions')
        ]);
        const fetchedAccounts = accRes.data.data || accRes.data || [];
        const fetchedTxs = txRes.data.data || txRes.data || [];
        setAccounts(Array.isArray(fetchedAccounts) ? fetchedAccounts : []);
        setTransactions(Array.isArray(fetchedTxs) ? fetchedTxs.slice(0, 5) : []);
      } catch (err: any) {
        console.error("Failed to fetch dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalBalance = accounts.reduce((sum, acc) => sum + Number(acc.balance), 0);
  const chartData = generateChartData(totalBalance);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(amount);

  const statusColor = (status: string): "default" | "secondary" | "destructive" | "outline" | "success" | "warning" => {
    switch (status) {
      case 'COMPLETED': return 'success';
      case 'PENDING': return 'warning';
      case 'REJECTED': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between glass-card p-6 border-none shadow-sm bg-white/40">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 font-display">
            Portfolio Overview
          </h1>
          <p className="mt-1.5 text-sm text-slate-500 font-medium">
            Welcome back. Here&apos;s how your finances are looking today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="bg-white/50 backdrop-blur-sm border-white/60 hover:bg-white" asChild>
            <Link href="/accounts">
              <span className="material-symbols-outlined mr-1.5 text-[18px]">account_balance_wallet</span>
              Accounts
            </Link>
          </Button>
          <Button variant="primary" size="sm" className="shadow-lg shadow-blue-500/20" asChild>
            <Link href="/transactions/new">
              <span className="material-symbols-outlined mr-1.5 text-[18px]">send</span>
              Transfer
            </Link>
          </Button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3 stagger-children">
        
        {/* Balance & Chart Section (2 Columns) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6 sm:p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-sm font-semibold tracking-wider text-slate-500 uppercase">Total Liquidity</p>
                {loading ? (
                  <div className="mt-2 h-10 w-48 skeleton-shimmer rounded-xl" />
                ) : (
                  <h2 className="mt-2 text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 font-mono-data gradient-text">
                    {formatCurrency(totalBalance)}
                  </h2>
                )}
              </div>
              <div className="hidden sm:flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-xl shadow-blue-500/20">
                <span className="material-symbols-outlined text-3xl text-white">monitoring</span>
              </div>
            </div>

            <div className="h-[240px] w-full mt-4">
              {!loading && (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(226, 232, 240, 0.5)" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontSize: 12 }} 
                      dy={10}
                    />
                    <YAxis 
                      hide={true} 
                      domain={['dataMin - 1000', 'dataMax + 1000']} 
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      formatter={(value: any) => [formatCurrency(Number(value)), 'Balance']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="balance" 
                      stroke="#2563eb" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorBalance)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Quick Actions Array */}
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { label: 'Send Money', icon: 'send', href: '/transactions/new', color: 'text-blue-600', bg: 'bg-blue-500/10' },
              { label: 'Apply Loan', icon: 'real_estate_agent', href: '/loans', color: 'text-indigo-600', bg: 'bg-indigo-500/10' },
              { label: 'Statements', icon: 'description', href: '/accounts', color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
            ].map(action => (
              <Link
                key={action.label}
                href={action.href}
                className="group flex flex-col items-center justify-center gap-3 glass-card p-5 text-center hover:-translate-y-1 transition-all duration-300"
              >
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${action.bg} transition-transform group-hover:scale-110`}>
                  <span className={`material-symbols-outlined text-2xl ${action.color}`}>{action.icon}</span>
                </div>
                <p className="text-sm font-bold text-slate-800">{action.label}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Side Column (Transactions & Accounts) */}
        <div className="space-y-6">
          
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900">Your Accounts</h3>
              <Link href="/accounts" className="text-xs font-semibold text-blue-600 hover:text-blue-700">View All</Link>
            </div>
            
            <div className="space-y-3">
              {loading ? (
                Array.from({ length: 2 }).map((_, i) => <div key={i} className="h-16 skeleton-shimmer rounded-xl" />)
              ) : accounts.length === 0 ? (
                <div className="py-6 text-center text-sm text-slate-500">No accounts open</div>
              ) : (
                accounts.slice(0, 3).map(acc => (
                  <Link key={acc.id} href={`/accounts/${acc.id}`} className="group flex items-center justify-between p-3 rounded-xl bg-white/50 border border-white/60 hover:bg-white transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                        acc.type === 'SAVINGS' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                      }`}>
                        <span className="material-symbols-outlined">{acc.type === 'SAVINGS' ? 'savings' : 'credit_card'}</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{acc.type}</p>
                        <p className="text-xs text-slate-400 font-mono-data">•• {acc.accountNumber?.slice(-4) || '0000'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-900 font-mono-data">{formatCurrency(Number(acc.balance))}</p>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900">Recent Activity</h3>
              <Link href="/transactions" className="text-xs font-semibold text-blue-600 hover:text-blue-700">View All</Link>
            </div>
            
            <div className="space-y-3">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-14 skeleton-shimmer rounded-xl" />)
              ) : transactions.length === 0 ? (
                <div className="py-6 text-center text-sm text-slate-500">No recent activity</div>
              ) : (
                transactions.map((txn) => (
                  <div key={txn.id} className="flex items-center justify-between p-2">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                        txn.type === 'DEPOSIT' ? 'bg-emerald-50 text-emerald-600' :
                        txn.type === 'WITHDRAWAL' ? 'bg-red-50 text-red-500' : 'bg-slate-100 text-slate-600'
                      }`}>
                        <span className="material-symbols-outlined text-[18px]">
                          {txn.type === 'DEPOSIT' ? 'south_west' :
                           txn.type === 'WITHDRAWAL' ? 'north_east' : 'swap_horiz'}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">{txn.type}</p>
                        <p className="text-[10px] text-slate-400">
                          {new Date(txn.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-xs font-bold font-mono-data ${txn.amount > 0 ? 'text-emerald-600' : 'text-slate-900'}`}>
                        {txn.amount > 0 ? '+' : ''}{formatCurrency(Number(txn.amount))}
                      </p>
                      <Badge variant={statusColor(txn.status)} className="text-[9px] mt-0.5 px-1 py-0 h-4">
                        {txn.status}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
