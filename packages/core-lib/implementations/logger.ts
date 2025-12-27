/**
 * Console Logger Implementation
 * L0 Core Lib - Default logger that writes to console
 */

import type { 
  Logger, 
  LogContext, 
  LogLevel, 
  LogEntry,
  LogLevelPriority 
} from '@odin/core-contracts';

// ============================================================================
// Console Logger Implementation
// ============================================================================

/**
 * Console-based logger implementation
 * Suitable for development and simple use cases
 */
export class ConsoleLogger implements Logger {
  private context: LogContext;
  private minLevel: LogLevel;
  
  constructor(
    context: LogContext = {},
    minLevel: LogLevel = 'info'
  ) {
    this.context = context;
    this.minLevel = minLevel;
  }
  
  private shouldLog(level: LogLevel): boolean {
    const priority: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3,
      fatal: 4,
    };
    return priority[level] >= priority[this.minLevel];
  }
  
  private formatEntry(level: LogLevel, message: string, context?: LogContext): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      context: { ...this.context, ...context },
    };
  }
  
  private log(level: LogLevel, message: string, context?: LogContext): void {
    if (!this.shouldLog(level)) return;
    
    const entry = this.formatEntry(level, message, context);
    const logFn = level === 'error' || level === 'fatal' 
      ? console.error 
      : level === 'warn' 
        ? console.warn 
        : console.log;
    
    // In production, output JSON for log aggregators
    if (process.env.NODE_ENV === 'production') {
      logFn(JSON.stringify(entry));
    } else {
      // In development, use pretty formatting
      const prefix = `[${entry.timestamp}] ${level.toUpperCase().padEnd(5)}`;
      const contextStr = entry.context && Object.keys(entry.context).length > 0
        ? ` ${JSON.stringify(entry.context)}`
        : '';
      logFn(`${prefix} ${message}${contextStr}`);
    }
  }
  
  debug(message: string, context?: LogContext): void {
    this.log('debug', message, context);
  }
  
  info(message: string, context?: LogContext): void {
    this.log('info', message, context);
  }
  
  warn(message: string, context?: LogContext): void {
    this.log('warn', message, context);
  }
  
  error(message: string, context?: LogContext): void {
    this.log('error', message, context);
  }
  
  fatal(message: string, context?: LogContext): void {
    this.log('fatal', message, context);
  }
  
  child(context: LogContext): Logger {
    return new ConsoleLogger(
      { ...this.context, ...context },
      this.minLevel
    );
  }
  
  setLevel(level: LogLevel): void {
    this.minLevel = level;
  }
  
  async flush(): Promise<void> {
    // Console logger doesn't buffer, nothing to flush
  }
}

// ============================================================================
// Factory Functions
// ============================================================================

/**
 * Create a new console logger
 */
export const createLogger = (
  context: LogContext = {},
  minLevel: LogLevel = 'info'
): Logger => {
  return new ConsoleLogger(context, minLevel);
};

/**
 * Create a request-scoped logger
 */
export const createRequestLogger = (
  requestId: string,
  tenantId: string,
  userId?: string
): Logger => {
  return new ConsoleLogger({
    requestId,
    tenantId,
    userId,
  });
};

/**
 * Create a service logger
 */
export const createServiceLogger = (serviceName: string): Logger => {
  return new ConsoleLogger({
    service: serviceName,
  });
};

// ============================================================================
// No-op Logger (for testing)
// ============================================================================

/**
 * No-op logger that discards all output
 * Useful for testing
 */
export class NoopLogger implements Logger {
  debug(): void {}
  info(): void {}
  warn(): void {}
  error(): void {}
  fatal(): void {}
  child(): Logger {
    return this;
  }
  setLevel(): void {}
  async flush(): Promise<void> {}
}

export const noopLogger = new NoopLogger();
