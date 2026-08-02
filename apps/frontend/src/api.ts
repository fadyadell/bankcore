// Global API Client and Authentication Logic

const API_BASE = 'http://localhost:3000/api/v1';

export const Auth = {
  getToken: () => localStorage.getItem('bankcore_token'),
  setToken: (token: string) => localStorage.setItem('bankcore_token', token),
  clearToken: () => localStorage.removeItem('bankcore_token'),
  
  isAuthenticated: () => !!localStorage.getItem('bankcore_token'),

  login: () => {
    // Basic redirect for implicit flow / mock logic
    // In a real Keycloak setup, this redirects to Keycloak login URL
    console.log('Redirecting to login...');
    window.location.href = '#login';
  },

  logout: () => {
    Auth.clearToken();
    window.location.href = '/index.html';
  }
};

export const ApiClient = {
  async fetch(endpoint: string, options: RequestInit = {}) {
    const token = Auth.getToken();
    
    const headers = new Headers(options.headers);
    headers.set('Content-Type', 'application/json');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });

    if (response.status === 401) {
      Auth.clearToken();
      window.location.href = '/index.html';
      throw new Error('Unauthorized');
    }

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.message || 'API Error');
    }
    return data.data;
  },

  async get(endpoint: string) {
    return this.fetch(endpoint, { method: 'GET' });
  },

  async post(endpoint: string, body: any) {
    return this.fetch(endpoint, { method: 'POST', body: JSON.stringify(body) });
  },

  async put(endpoint: string, body: any) {
    return this.fetch(endpoint, { method: 'PUT', body: JSON.stringify(body) });
  }
};
