export interface AuditEntryInput {
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  oldValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

export interface AuditWriterPort {
  log(entry: AuditEntryInput): Promise<void>;
}
