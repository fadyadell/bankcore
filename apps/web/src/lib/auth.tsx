'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { UserDto } from '@bankcore/contracts';
import { login as apiLogin, register as apiRegister, getMe, setToken, clearToken, getStoredUser, setStoredUser } from '@/lib/apiClient';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: UserDto | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<string | null>;
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<string | null>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => null,
  register: async () => null,
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserDto | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Try to restore session from localStorage
    const stored = getStoredUser();
    if (stored) {
      // Verify token is still valid
      getMe().then(res => {
        if (res.data) {
          setUser(res.data);
          setStoredUser(res.data);
        } else {
          // Token expired
          clearToken();
          setUser(null);
        }
      }).finally(() => setLoading(false));
    } else {
      Promise.resolve().then(() => setLoading(false));
    }
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<string | null> => {
    const res = await apiLogin(email, password);
    if (res.error) return res.error.message;
    if (res.data) {
      setToken(res.data.accessToken);
      setStoredUser(res.data.user);
      setUser(res.data.user);
    }
    return null;
  }, []);

  const register = useCallback(async (email: string, password: string, firstName: string, lastName: string): Promise<string | null> => {
    const res = await apiRegister(email, password, firstName, lastName);
    if (res.error) return res.error.message;
    if (res.data) {
      setToken(res.data.accessToken);
      setStoredUser(res.data.user);
      setUser(res.data.user);
    }
    return null;
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
    router.push('/login');
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
