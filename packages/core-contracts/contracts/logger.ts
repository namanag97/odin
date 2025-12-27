/**
 * Logger Contract
 * L0 Core Contract - Logging interface for observability
 */

// ============================================================================
// Log Levels
// ============================================================================

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export const LogLevelPriority: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  fatal: 4,
};

// ============================================================================
// Log Context
// ============================================================================

/**
 * Structured log context
 */
export interface LogContext {
  /** Correlation/trace ID for request tracing */
  correlationId?: string;
  /** Request ID */
  requestId?: string;
  /** User ID (if authenticated) */
  userId?: string;
  /** Tenant ID */
  tenantId?: string;
  /** Service name */
  service?: string;
  /** Additional context */
  [key: string]: unknown;
}

// ============================================================================
// Logger Interface
// ============================================================================

/**
 * Logger interface - implemented by concrete loggers
 * All services should use this interface for logging
 */
export interface Logger {
  /**
   * Log a debug message
   */
  debug(message: string, context?: LogContext): void;
  
  /**
   * Log an info message
   */
  info(message: string, context?: LogContext): void;
  
  /**
   * Log a warning message
   */
  warn(message: string, context?: LogContext): void;
  
  /**
   * Log an error message
   */
  error(message: string, context?: LogContext): void;
  
  /**
   * Log a fatal error message
   */
  fatal(message: string, context?: LogContext): void;
  
  /**
   * Create a child logger with additional context
   */
  child(context: LogContext): Logger;
  
  /**
   * Set the minimum log level
   */
  setLevel?(level: LogLevel): void;
  
  /**
   * Flush any buffered logs
   */
  flush?(): Promise<void>;
}

// ============================================================================
// Log Entry
// ============================================================================

/**
 * Structured log entry format
 */
export interface LogEntry {
  /** Log level */
  level: LogLevel;
  /** Log message */
  message: string;
  /** Timestamp (ISO 8601) */
  timestamp: string;
  /** Additional context */
  context?: LogContext;
  /** Error details if applicable */
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

// ============================================================================
// Log Transport
// ============================================================================

/**
 * Log transport interface for custom destinations
 */
export interface LogTransport {
  /** Transport name */
  name: string;
  /** Minimum level for this transport */
  level: LogLevel;
  /** Write a log entry */
  write(entry: LogEntry): void | Promise<void>;
  /** Flush buffered entries */
  flush?(): Promise<void>;
}
