export const TOPICS = {
  TRANSACTION_CREATED: 'bankcore.transaction.created',
  TRANSACTION_APPROVED: 'bankcore.transaction.approved',
  TRANSACTION_COMPLETED: 'bankcore.transaction.completed',
  TRANSACTION_REJECTED: 'bankcore.transaction.rejected',
  LOAN_APPLIED: 'bankcore.loan.applied',
  LOAN_APPROVED: 'bankcore.loan.approved',
  LOAN_REJECTED: 'bankcore.loan.rejected',
  NOTIFICATIONS_EMPLOYEE: 'bankcore.notifications.employee',
  NOTIFICATIONS_ADMIN: 'bankcore.notifications.admin',
  DOMAIN_EVENTS: 'bankcore.domain.events',
  notificationsCustomer: (customerId: string) => `bankcore.notifications.customer.${customerId}`
} as const;
