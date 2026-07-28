export interface BaseEvent {
  eventId: string;
  eventType: string;
  aggregateId: string;
  aggregateType: string;
  timestamp: string;
  version: number;
  correlationId?: string;
  metadata?: Record<string, unknown>;
}

export interface TransactionCompletedEvent extends BaseEvent {
  eventType: 'transaction.completed';
  payload: {
    transactionId: string;
    referenceNumber: string;
    type: string;
    amount: number;
    currency: string;
    debitAccountId?: string;
    creditAccountId?: string;
  };
}

export interface TransactionFailedEvent extends BaseEvent {
  eventType: 'transaction.failed';
  payload: {
    transactionId: string;
    referenceNumber: string;
    type: string;
    amount: number;
    currency: string;
    reason: string;
  };
}

export interface AccountCreatedEvent extends BaseEvent {
  eventType: 'account.created';
  payload: {
    accountId: string;
    accountNumber: string;
    userId: string;
    type: string;
    currency: string;
  };
}

export interface AccountStatusChangedEvent extends BaseEvent {
  eventType: 'account.status_changed';
  payload: {
    accountId: string;
    previousStatus: string;
    newStatus: string;
    reason?: string;
  };
}

export interface NotificationRequestedEvent extends BaseEvent {
  eventType: 'notification.requested';
  payload: {
    userId: string;
    channel: string;
    type: string;
    subject?: string;
    body: string;
    metadata?: Record<string, unknown>;
  };
}

export type DomainEvent =
  | TransactionCompletedEvent
  | TransactionFailedEvent
  | AccountCreatedEvent
  | AccountStatusChangedEvent
  | NotificationRequestedEvent;
