export const ERROR_CODES = {
  // General
  INTERNAL_ERROR: 'ERR_INTERNAL',
  VALIDATION_ERROR: 'ERR_VALIDATION',
  NOT_FOUND: 'ERR_NOT_FOUND',
  CONFLICT: 'ERR_CONFLICT',
  UNAUTHORIZED: 'ERR_UNAUTHORIZED',
  FORBIDDEN: 'ERR_FORBIDDEN',
  RATE_LIMITED: 'ERR_RATE_LIMITED',

  // Account
  ACCOUNT_NOT_FOUND: 'ERR_ACCOUNT_NOT_FOUND',
  ACCOUNT_FROZEN: 'ERR_ACCOUNT_FROZEN',
  ACCOUNT_CLOSED: 'ERR_ACCOUNT_CLOSED',
  INSUFFICIENT_BALANCE: 'ERR_INSUFFICIENT_BALANCE',
  DUPLICATE_ACCOUNT: 'ERR_DUPLICATE_ACCOUNT',

  // Transaction
  TRANSACTION_NOT_FOUND: 'ERR_TRANSACTION_NOT_FOUND',
  TRANSACTION_FAILED: 'ERR_TRANSACTION_FAILED',
  IDEMPOTENCY_CONFLICT: 'ERR_IDEMPOTENCY_CONFLICT',
  INVALID_AMOUNT: 'ERR_INVALID_AMOUNT',
  SAME_ACCOUNT_TRANSFER: 'ERR_SAME_ACCOUNT_TRANSFER',
  CURRENCY_MISMATCH: 'ERR_CURRENCY_MISMATCH',

  // User / IAM
  USER_NOT_FOUND: 'ERR_USER_NOT_FOUND',
  USER_SUSPENDED: 'ERR_USER_SUSPENDED',
  USER_DEACTIVATED: 'ERR_USER_DEACTIVATED',
  KYC_NOT_VERIFIED: 'ERR_KYC_NOT_VERIFIED',
  INVALID_CREDENTIALS: 'ERR_INVALID_CREDENTIALS',
  TOKEN_EXPIRED: 'ERR_TOKEN_EXPIRED',

  // Notification
  NOTIFICATION_FAILED: 'ERR_NOTIFICATION_FAILED',
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

export const KAFKA_TOPICS = {
  TRANSACTION_COMPLETED: 'bankcore.transaction.completed',
  TRANSACTION_FAILED: 'bankcore.transaction.failed',
  ACCOUNT_CREATED: 'bankcore.account.created',
  ACCOUNT_STATUS_CHANGED: 'bankcore.account.status_changed',
} as const;

export const RABBITMQ_QUEUES = {
  NOTIFICATIONS: 'bankcore.notifications',
  NOTIFICATIONS_DLQ: 'bankcore.notifications.dlq',
} as const;

export const RABBITMQ_EXCHANGES = {
  NOTIFICATIONS: 'bankcore.notifications.exchange',
  NOTIFICATIONS_DLQ: 'bankcore.notifications.dlq.exchange',
} as const;

export const CACHE_KEYS = {
  ACCOUNT_BALANCE: (accountId: string) => `account:${accountId}:balance`,
  ACCOUNT_DETAIL: (accountId: string) => `account:${accountId}:detail`,
  USER_PROFILE: (userId: string) => `user:${userId}:profile`,
  RATE_LIMIT: (ip: string) => `rate_limit:${ip}`,
} as const;

export const CACHE_TTL = {
  ACCOUNT_BALANCE: 30,
  ACCOUNT_DETAIL: 60,
  USER_PROFILE: 300,
  RATE_LIMIT: 60,
} as const;

export const CORRELATION_ID_HEADER = 'x-correlation-id';
