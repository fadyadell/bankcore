// ─── Generic API Envelope ────────────────────────────────────────────
export interface ApiResponse<T = any> {
  data: T | null;
  error: {
    message: string;
    code: string;
    details?: any;
  } | null;
  meta?: Record<string, any>;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ─── Health ──────────────────────────────────────────────────────────
export interface HealthStatus {
  status: 'ok' | 'error';
  uptime: number;
  timestamp: string;
}

// ─── Enums ───────────────────────────────────────────────────────────
export type UserRole = 'CUSTOMER' | 'EMPLOYEE' | 'ADMIN';
export type AccountType = 'CHECKING' | 'SAVINGS';
export type AccountStatus = 'ACTIVE' | 'SUSPENDED' | 'CLOSED';
export type TransactionType = 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER';
export type TransactionStatus = 'PENDING' | 'COMPLETED' | 'FAILED';
export type LoanStatus = 'PENDING' | 'RISK_ASSESSED' | 'EMPLOYEE_REVIEW' | 'ADMIN_REVIEW' | 'APPROVED' | 'REJECTED' | 'ACTIVE' | 'PAID';
export type NotificationType = 'EMAIL' | 'SMS' | 'PUSH';
export type NotificationStatus = 'UNREAD' | 'READ';

// ─── Auth ────────────────────────────────────────────────────────────
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthTokens {
  accessToken: string;
  user: UserDto;
}

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

// ─── User ────────────────────────────────────────────────────────────
export interface UserDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  role?: UserRole;
}

// ─── Account ─────────────────────────────────────────────────────────
export interface AccountDto {
  id: string;
  userId: string;
  type: AccountType;
  balance: number;
  currency: string;
  status: AccountStatus;
  createdAt: string;
  updatedAt: string;
  user?: UserDto;
}

export interface CreateAccountRequest {
  userId: string;
  type: AccountType;
  currency?: string;
  initialDeposit?: number;
}

export interface UpdateAccountRequest {
  status?: AccountStatus;
}

// ─── Transaction ─────────────────────────────────────────────────────
export interface TransactionDto {
  id: string;
  fromAccountId: string | null;
  toAccountId: string | null;
  amount: number;
  currency: string;
  type: TransactionType;
  status: TransactionStatus;
  reference: string | null;
  createdAt: string;
  updatedAt: string;
  fromAccount?: AccountDto;
  toAccount?: AccountDto;
}

export interface DepositRequest {
  accountId: string;
  amount: number;
  reference?: string;
}

export interface WithdrawRequest {
  accountId: string;
  amount: number;
  reference?: string;
}

export interface TransferRequest {
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  reference?: string;
}

// ─── Loan ────────────────────────────────────────────────────────────
export interface LoanDto {
  id: string;
  userId: string;
  amount: number;
  interestRate: number;
  termMonths: number;
  status: LoanStatus;
  riskScore?: number | null;
  riskLevel?: string | null;
  riskDecision?: string | null;
  processId?: string | null;
  employeeId?: string | null;
  adminId?: string | null;
  rejectionReason?: string | null;
  createdAt: string;
  updatedAt: string;
  user?: UserDto;
}

export interface CreateLoanRequest {
  amount: number;
  termMonths: number;
}

export interface ReviewLoanRequest {
  status: 'APPROVED' | 'REJECTED';
  interestRate?: number;
}

// ─── Notification ────────────────────────────────────────────────────
export interface NotificationDto {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  status: NotificationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNotificationRequest {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
}

// ─── Dashboard ───────────────────────────────────────────────────────
export interface DashboardStats {
  totalUsers: number;
  totalAccounts: number;
  totalTransactions: number;
  totalLoans: number;
  pendingLoans: number;
  totalBalance: number;
}

export interface CustomerDashboard {
  accounts: AccountDto[];
  recentTransactions: TransactionDto[];
  activeLoans: LoanDto[];
  unreadNotifications: number;
}
