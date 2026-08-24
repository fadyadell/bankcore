'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { useSocket } from '../../providers/SocketProvider';
import Link from 'next/link';

export function Header() {
  const { data: session, status } = useSession();
  const { connected: isConnected } = useSocket();

  return (
    <header className="flex h-20 items-center justify-between border-b border-white/20 glass-card mx-6 mt-3 px-6 z-10 sticky top-3">
      {/* Search */}
      <div className="flex flex-1 items-center gap-4">
        <div className="relative flex w-full max-w-md items-center">
          <span className="material-symbols-outlined absolute left-3.5 text-slate-400 text-lg">search</span>
          <input
            type="text"
            placeholder="Search accounts, transactions..."
            className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/80 pl-11 pr-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-200 focus:border-primary-300 focus:bg-white focus:ring-2 focus:ring-primary-100"
          />
          <kbd className="absolute right-3 hidden rounded-md border border-slate-200 bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-400 sm:inline-block">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Connection status */}
        {isConnected ? (
          <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            Live
          </div>
        ) : (
          <div className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-500">
            <span className="h-2 w-2 rounded-full bg-slate-400" />
            Offline
          </div>
        )}

        {/* Divider */}
        <div className="h-8 w-px bg-slate-200" />

        {/* Notification bell */}
        <Link
          href="/notifications"
          className="relative flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition-all duration-200 hover:bg-slate-100 hover:text-slate-700"
          aria-label="Notifications"
        >
          <span className="material-symbols-outlined text-xl">notifications</span>
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
            !
          </span>
        </Link>

        {/* Settings */}
        <Link
          href="/profile"
          className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition-all duration-200 hover:bg-slate-100 hover:text-slate-700"
          aria-label="Settings"
        >
          <span className="material-symbols-outlined text-xl">settings</span>
        </Link>

        {/* Divider */}
        <div className="h-8 w-px bg-slate-200" />

        {/* User area */}
        {status === 'loading' ? (
          <div className="h-9 w-32 skeleton-shimmer rounded-xl" />
        ) : session?.user ? (
          <button
            onClick={() => signOut()}
            className="group flex items-center gap-3 rounded-xl p-1.5 pr-3 transition-all duration-200 hover:bg-slate-50"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 text-xs font-bold text-white shadow-sm">
              {session.user.name?.charAt(0).toUpperCase() || session.user.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="hidden flex-col items-start sm:flex">
              <span className="text-sm font-semibold text-slate-900">
                {session.user.name || session.user.email}
              </span>
              <span className="text-[10px] text-slate-400 group-hover:text-red-500 transition-colors">
                Sign out
              </span>
            </div>
          </button>
        ) : (
          <button
            onClick={() => signIn('keycloak')}
            className="flex items-center gap-3 rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-primary-700 hover:shadow-glow"
          >
            <span className="material-symbols-outlined text-sm">login</span>
            Sign In
          </button>
        )}
      </div>
    </header>
  );
}
