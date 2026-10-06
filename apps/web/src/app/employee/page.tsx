'use client';

import { useEffect, useState } from 'react';
import { fetchApi } from '@/lib/apiClient';

interface EmployeeDashboardData {
  totalCustomers: number;
  totalAccounts: number;
  pendingLoans: number;
}

export default function EmployeeDashboardPage() {
  const [data, setData] = useState<EmployeeDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // For now we will fetch just the data we need using separate endpoints since we don't have an employee dashboard endpoint.
    // Or we could mock it if needed. Let's assume we have it or use a combination of endpoints.
    // Actually we didn't add /api/v1/dashboard/employee in backend. Let's fetch from basic endpoints:
    Promise.all([
      fetchApi<{total: number}>('/api/v1/users?role=CUSTOMER&pageSize=1'),
      fetchApi<{total: number}>('/api/v1/accounts?pageSize=1'),
      fetchApi<{total: number}>('/api/v1/loans?status=PENDING&pageSize=1')
    ]).then(([users, accounts, loans]) => {
      setData({
        totalCustomers: users.data?.total || 0,
        totalAccounts: accounts.data?.total || 0,
        pendingLoans: loans.data?.total || 0,
      });
      setLoading(false);
    }).catch(err => {
      setError(err.message);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="loading-page"><div className="loading-spinner" /><p>Loading dashboard...</p></div>;
  if (error) return <div className="alert alert-error">{error}</div>;
  if (!data) return null;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Employee Dashboard</h1>
          <p>Overview of customers, accounts, and pending actions.</p>
        </div>
      </div>

      <div className="grid-stats">
        <div className="stat-card">
          <div className="stat-label">Total Customers</div>
          <div className="stat-value" style={{ color: 'var(--accent-blue)' }}>{data.totalCustomers}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Accounts</div>
          <div className="stat-value">{data.totalAccounts}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Pending Loan Reviews</div>
          <div className="stat-value" style={{ color: 'var(--accent-amber)' }}>{data.pendingLoans}</div>
        </div>
      </div>
    </div>
  );
}
