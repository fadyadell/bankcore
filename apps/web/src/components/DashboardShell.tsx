'use client';

import { useAuth } from '@/lib/auth';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getUnreadCount } from '@/lib/apiClient';
import Link from 'next/link';

const ICONS = {
  dashboard: '📊',
  accounts: '🏦',
  transactions: '💸',
  loans: '📋',
  notifications: '🔔',
  users: '👥',
  profile: '👤',
  logout: '🚪',
  settings: '⚙️',
};

function getNavItems(role: string) {
  if (role === 'CUSTOMER') {
    return [
      { href: '/dashboard', label: 'Dashboard', icon: ICONS.dashboard },
      { href: '/dashboard/accounts', label: 'Accounts', icon: ICONS.accounts },
      { href: '/dashboard/transactions', label: 'Transactions', icon: ICONS.transactions },
      { href: '/dashboard/loans', label: 'Loans', icon: ICONS.loans },
      { href: '/dashboard/notifications', label: 'Notifications', icon: ICONS.notifications },
      { href: '/dashboard/profile', label: 'Profile', icon: ICONS.profile },
    ];
  }
  if (role === 'EMPLOYEE') {
    return [
      { href: '/employee', label: 'Dashboard', icon: ICONS.dashboard },
      { href: '/employee/customers', label: 'Customers', icon: ICONS.users },
      { href: '/employee/accounts', label: 'Accounts', icon: ICONS.accounts },
      { href: '/employee/transactions', label: 'Transactions', icon: ICONS.transactions },
      { href: '/employee/loans', label: 'Loan Reviews', icon: ICONS.loans },
      { href: '/employee/notifications', label: 'Notifications', icon: ICONS.notifications },
    ];
  }
  // ADMIN
  return [
    { href: '/admin', label: 'Dashboard', icon: ICONS.dashboard },
    { href: '/admin/users', label: 'Users', icon: ICONS.users },
    { href: '/admin/accounts', label: 'Accounts', icon: ICONS.accounts },
    { href: '/admin/transactions', label: 'Transactions', icon: ICONS.transactions },
    { href: '/admin/loans', label: 'Loans', icon: ICONS.loans },
    { href: '/admin/notifications', label: 'Notifications', icon: ICONS.notifications },
  ];
}

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      getUnreadCount().then(res => {
        if (res.data) setUnread(res.data.count);
      });
    }
  }, [user, pathname]);

  if (loading || !user) {
    return (
      <div className="loading-page">
        <div className="loading-spinner" />
        <p>Loading...</p>
      </div>
    );
  }

  const navItems = getNavItems(user.role);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <h1>BankCore</h1>
          <p>{user.role.charAt(0) + user.role.slice(1).toLowerCase()} Portal</p>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={pathname === item.href ? 'active' : ''}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
              {item.label === 'Notifications' && unread > 0 && (
                <span className="badge badge-red" style={{ marginLeft: 'auto', fontSize: '0.625rem' }}>{unread}</span>
              )}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
            {user.firstName} {user.lastName}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            {user.email}
          </div>
          <button className="btn btn-ghost btn-sm" style={{ width: '100%' }} onClick={logout}>
            {ICONS.logout} Sign out
          </button>
        </div>
      </aside>

      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
