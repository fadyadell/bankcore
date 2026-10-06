import type { ApiResponse, AuthTokens, UserDto, AccountDto, TransactionDto, LoanDto, NotificationDto, PaginatedResponse, DashboardStats, CustomerDashboard } from '@bankcore/contracts';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('bankcore_token');
}

export function setToken(token: string) {
  localStorage.setItem('bankcore_token', token);
}

export function clearToken() {
  localStorage.removeItem('bankcore_token');
  localStorage.removeItem('bankcore_user');
}

export function getStoredUser(): UserDto | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('bankcore_user');
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export function setStoredUser(user: UserDto) {
  localStorage.setItem('bankcore_user', JSON.stringify(user));
}

export async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  try {
    const token = getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      try {
        const errorData = await response.json();
        return errorData;
      } catch {
        return {
          data: null,
          error: {
            message: `HTTP Error: ${response.status} ${response.statusText}`,
            code: 'HTTP_ERROR',
          },
        };
      }
    }

    const data = await response.json();
    return data;
  } catch (error: unknown) {
    return {
      data: null,
      error: {
        message: error instanceof Error ? error.message : 'Network error',
        code: 'NETWORK_ERROR',
      },
    };
  }
}

// ─── Auth ────────────────────────────────────────────────────────────
export async function login(email: string, password: string) {
  return fetchApi<AuthTokens>('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function register(email: string, password: string, firstName: string, lastName: string) {
  return fetchApi<AuthTokens>('/api/v1/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, firstName, lastName }),
  });
}

export async function getMe() {
  return fetchApi<UserDto>('/api/v1/auth/me');
}

// ─── Dashboard ───────────────────────────────────────────────────────
export async function getAdminDashboard() {
  return fetchApi<DashboardStats>('/api/v1/dashboard/admin');
}

export async function getCustomerDashboard() {
  return fetchApi<CustomerDashboard>('/api/v1/dashboard/customer');
}

// ─── Users ───────────────────────────────────────────────────────────
export async function getUsers(params?: { page?: number; pageSize?: number; search?: string; role?: string }) {
  const qs = new URLSearchParams();
  if (params?.page) qs.set('page', String(params.page));
  if (params?.pageSize) qs.set('pageSize', String(params.pageSize));
  if (params?.search) qs.set('search', params.search);
  if (params?.role) qs.set('role', params.role);
  return fetchApi<PaginatedResponse<UserDto>>(`/api/v1/users?${qs.toString()}`);
}

export async function getUser(id: string) {
  return fetchApi<UserDto>(`/api/v1/users/${id}`);
}

export async function createUser(data: { email: string; password: string; firstName: string; lastName: string; role: string }) {
  return fetchApi<UserDto>('/api/v1/users', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateUser(id: string, data: { firstName?: string; lastName?: string; role?: string }) {
  return fetchApi<UserDto>(`/api/v1/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteUser(id: string) {
  return fetchApi<{ success: boolean }>(`/api/v1/users/${id}`, { method: 'DELETE' });
}

// ─── Accounts ────────────────────────────────────────────────────────
export async function getAccounts(params?: { page?: number; pageSize?: number; userId?: string; type?: string; status?: string }) {
  const qs = new URLSearchParams();
  if (params?.page) qs.set('page', String(params.page));
  if (params?.pageSize) qs.set('pageSize', String(params.pageSize));
  if (params?.userId) qs.set('userId', params.userId);
  if (params?.type) qs.set('type', params.type);
  if (params?.status) qs.set('status', params.status);
  return fetchApi<PaginatedResponse<AccountDto>>(`/api/v1/accounts?${qs.toString()}`);
}

export async function getMyAccounts() {
  return fetchApi<AccountDto[]>('/api/v1/accounts/my');
}

export async function getAccount(id: string) {
  return fetchApi<AccountDto>(`/api/v1/accounts/${id}`);
}

export async function createAccount(data: { userId: string; type: string; currency?: string; initialDeposit?: number }) {
  return fetchApi<AccountDto>('/api/v1/accounts', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateAccountStatus(id: string, status: string) {
  return fetchApi<AccountDto>(`/api/v1/accounts/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
}

// ─── Transactions ────────────────────────────────────────────────────
export async function getTransactions(params?: { page?: number; pageSize?: number; accountId?: string; type?: string; status?: string }) {
  const qs = new URLSearchParams();
  if (params?.page) qs.set('page', String(params.page));
  if (params?.pageSize) qs.set('pageSize', String(params.pageSize));
  if (params?.accountId) qs.set('accountId', params.accountId);
  if (params?.type) qs.set('type', params.type);
  if (params?.status) qs.set('status', params.status);
  return fetchApi<PaginatedResponse<TransactionDto>>(`/api/v1/transactions?${qs.toString()}`);
}

export async function getMyTransactions(params?: { page?: number; pageSize?: number }) {
  const qs = new URLSearchParams();
  if (params?.page) qs.set('page', String(params.page));
  if (params?.pageSize) qs.set('pageSize', String(params.pageSize));
  return fetchApi<PaginatedResponse<TransactionDto>>(`/api/v1/transactions/my?${qs.toString()}`);
}

export async function deposit(accountId: string, amount: number, reference?: string) {
  return fetchApi<TransactionDto>('/api/v1/transactions/deposit', {
    method: 'POST',
    body: JSON.stringify({ accountId, amount, reference }),
  });
}

export async function withdraw(accountId: string, amount: number, reference?: string) {
  return fetchApi<TransactionDto>('/api/v1/transactions/withdraw', {
    method: 'POST',
    body: JSON.stringify({ accountId, amount, reference }),
  });
}

export async function transfer(fromAccountId: string, toAccountId: string, amount: number, reference?: string) {
  return fetchApi<TransactionDto>('/api/v1/transactions/transfer', {
    method: 'POST',
    body: JSON.stringify({ fromAccountId, toAccountId, amount, reference }),
  });
}

// ─── Loans ───────────────────────────────────────────────────────────
export async function getLoans(params?: { page?: number; pageSize?: number; userId?: string; status?: string }) {
  const qs = new URLSearchParams();
  if (params?.page) qs.set('page', String(params.page));
  if (params?.pageSize) qs.set('pageSize', String(params.pageSize));
  if (params?.userId) qs.set('userId', params.userId);
  if (params?.status) qs.set('status', params.status);
  return fetchApi<PaginatedResponse<LoanDto>>(`/api/v1/loans?${qs.toString()}`);
}

export async function getMyLoans() {
  return fetchApi<LoanDto[]>('/api/v1/loans/my');
}

export async function getLoan(id: string) {
  return fetchApi<LoanDto>(`/api/v1/loans/${id}`);
}

export async function createLoan(amount: number, termMonths: number) {
  return fetchApi<LoanDto>('/api/v1/loans', {
    method: 'POST',
    body: JSON.stringify({ amount, termMonths }),
  });
}

export async function reviewLoan(id: string, status: 'APPROVED' | 'REJECTED', interestRate?: number) {
  return fetchApi<LoanDto>(`/api/v1/loans/${id}/review`, {
    method: 'PUT',
    body: JSON.stringify({ status, interestRate }),
  });
}

// ─── Notifications ───────────────────────────────────────────────────
export async function getNotifications(params?: { page?: number; pageSize?: number; userId?: string; status?: string }) {
  const qs = new URLSearchParams();
  if (params?.page) qs.set('page', String(params.page));
  if (params?.pageSize) qs.set('pageSize', String(params.pageSize));
  if (params?.userId) qs.set('userId', params.userId);
  if (params?.status) qs.set('status', params.status);
  return fetchApi<PaginatedResponse<NotificationDto>>(`/api/v1/notifications?${qs.toString()}`);
}

export async function getMyNotifications() {
  return fetchApi<NotificationDto[]>('/api/v1/notifications/my');
}

// ─── Dashboard ───────────────────────────────────────────────────────
export async function getDashboardStats() {
  return fetchApi<DashboardStats>('/api/v1/dashboard/admin');
}

export async function getUnreadCount() {
  return fetchApi<{ count: number }>('/api/v1/notifications/my/unread-count');
}

export async function markNotificationRead(id: string) {
  return fetchApi<NotificationDto>(`/api/v1/notifications/${id}/read`, { method: 'PUT' });
}

export async function markAllNotificationsRead() {
  return fetchApi<{ count: number }>('/api/v1/notifications/read-all', { method: 'PUT' });
}

export async function createNotification(data: { userId: string; type: string; title: string; message: string }) {
  return fetchApi<NotificationDto>('/api/v1/notifications', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function deleteNotification(id: string) {
  return fetchApi<{ success: boolean }>(`/api/v1/notifications/${id}`, { method: 'DELETE' });
}
