export interface ApiResponse<T = any> {
  data: T | null;
  error: {
    message: string;
    code: string;
    details?: any;
  } | null;
  meta?: Record<string, any>;
}

export interface HealthStatus {
  status: 'ok' | 'error';
  uptime: number;
  timestamp: string;
}
