export interface DomainEvent {
  eventId: string;
  eventType: string;
  timestamp: Date;
  payload: any;
}

export interface IntegrationEvent extends DomainEvent {
  sourceService: string;
}
