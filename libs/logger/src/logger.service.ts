import { LoggerService as NestLoggerService, Injectable, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.TRANSIENT })
export class AppLogger implements NestLoggerService {
  private context?: string;

  setContext(context: string) {
    this.context = context;
  }

  log(message: any, ...optionalParams: any[]) {
    console.log(`[${this.context || 'App'}] [INFO]`, message, ...optionalParams);
  }

  error(message: any, ...optionalParams: any[]) {
    console.error(`[${this.context || 'App'}] [ERROR]`, message, ...optionalParams);
  }

  warn(message: any, ...optionalParams: any[]) {
    console.warn(`[${this.context || 'App'}] [WARN]`, message, ...optionalParams);
  }

  debug?(message: any, ...optionalParams: any[]) {
    console.debug(`[${this.context || 'App'}] [DEBUG]`, message, ...optionalParams);
  }

  verbose?(message: any, ...optionalParams: any[]) {
    console.log(`[${this.context || 'App'}] [VERBOSE]`, message, ...optionalParams);
  }
}
