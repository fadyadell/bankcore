'use client';

import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        if (user.role === 'ADMIN') router.replace('/admin');
        else if (user.role === 'EMPLOYEE') router.replace('/employee');
        else router.replace('/dashboard');
      } else {
        router.replace('/login');
      }
    }
  }, [user, loading, router]);

  return (
    <div className="loading-page">
      <div className="loading-spinner" />
      <p>Loading BankCore...</p>
    </div>
  );
}
