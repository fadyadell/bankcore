'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface NavItem {
  name: string;
  href: string;
  icon: string;
}

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const roles = (session as unknown as { user?: { roles?: string[] } })?.user?.roles || [];

  const customerNav: NavItem[] = [
    { name: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
    { name: 'Accounts', href: '/accounts', icon: 'account_balance_wallet' },
    { name: 'Transactions', href: '/transactions', icon: 'receipt_long' },
    { name: 'Loans', href: '/loans', icon: 'real_estate_agent' },
  ];

  const employeeNav: NavItem[] = [
    { name: 'Operations', href: '/employee/dashboard', icon: 'admin_panel_settings' },
    { name: 'Txn Queue', href: '/employee/transactions', icon: 'fact_check' },
    { name: 'Loan Queue', href: '/employee/loans', icon: 'rule' },
  ];

  const adminNav: NavItem[] = [
    { name: 'Executive', href: '/admin/dashboard', icon: 'bar_chart' },
    { name: 'Approvals', href: '/admin/transactions', icon: 'gavel' },
    { name: 'Loan Review', href: '/admin/loans', icon: 'verified' },
    { name: 'Audit Logs', href: '/admin/audit', icon: 'history' },
  ];

  let navItems = customerNav;
  let sectionLabel = 'Banking';
  if (roles.includes('ADMIN')) {
    navItems = adminNav;
    sectionLabel = 'Administration';
  } else if (roles.includes('EMPLOYEE')) {
    navItems = employeeNav;
    sectionLabel = 'Operations';
  }

  return (
    <aside className="flex w-[260px] flex-col border-r border-white/20 glass-card m-3 mr-0 h-[calc(100vh-24px)] rounded-2xl overflow-hidden z-20">
      {/* Logo */}
      <div className="flex h-20 items-center gap-3 border-b border-white/30 px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/30">
          <span className="material-symbols-outlined text-[20px] text-white">account_balance</span>
        </div>
        <div>
          <span className="text-xl font-bold tracking-tight text-slate-800 font-display">BankCore</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-5">
        <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">
          {sectionLabel}
        </p>
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (pathname?.startsWith(`${item.href}/`) ?? false);
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`nav-link ${isActive ? 'nav-link-active' : ''}`}
                >
                  <span className={`material-symbols-outlined text-xl nav-icon ${
                    isActive ? '' : 'text-slate-400'
                  }`}>
                    {item.icon}
                  </span>
                  {item.name}
                  {isActive && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary-500" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Additional links for non-admin */}
        {!roles.includes('ADMIN') && !roles.includes('EMPLOYEE') && (
          <>
            <div className="my-5 h-px bg-slate-100" />
            <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Support
            </p>
            <ul className="space-y-1">
              <li>
                <Link href="/dashboard" className="nav-link">
                  <span className="material-symbols-outlined text-xl text-slate-400">help</span>
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="nav-link">
                  <span className="material-symbols-outlined text-xl text-slate-400">settings</span>
                  Settings
                </Link>
              </li>
            </ul>
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="border-t border-white/30 p-4">
        <div className="rounded-xl bg-white/40 p-4 shadow-sm border border-white/50 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-500/10 border border-green-500/20">
              <span className="material-symbols-outlined text-base text-green-600">shield_lock</span>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-800">BankCore Secure</p>
              <p className="text-[10px] text-slate-500">256-bit AES encryption</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
