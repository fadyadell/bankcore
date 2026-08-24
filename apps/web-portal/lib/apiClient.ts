import axios from 'axios';
import { getSession } from 'next-auth/react';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(async (config) => {
  if (typeof window !== 'undefined') {
    const session = await getSession();
    // @ts-expect-error - accessToken is added to session via NextAuth callback
    if (session?.accessToken) {
      // @ts-expect-error - accessToken is added to session via NextAuth callback
      config.headers.Authorization = `Bearer ${session.accessToken}`;
    }
  }
  return config;
});

export default apiClient;
