'use client';

import Sidebar from '../components/ui/Sidebar';
import { Header } from '../components/ui/Header';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-transparent">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden relative">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
