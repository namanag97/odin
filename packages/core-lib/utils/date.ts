/**
 * Date Utilities
 * L0 Core Lib - Date/time helper functions
 */

// ============================================================================
// Formatting
// ============================================================================

/**
 * Format a date to ISO 8601 string
 */
export const toISOString = (date: Date | number | string): string => {
  const d = typeof date === 'string' || typeof date === 'number' 
    ? new Date(date) 
    : date;
  return d.toISOString();
};

/**
 * Parse an ISO 8601 string to Date
 */
export const fromISOString = (isoString: string): Date => {
  return new Date(isoString);
};

/**
 * Get current timestamp as ISO string
 */
export const now = (): string => {
  return new Date().toISOString();
};

/**
 * Get current timestamp as Unix milliseconds
 */
export const nowMs = (): number => {
  return Date.now();
};

/**
 * Get current timestamp as Unix seconds
 */
export const nowSec = (): number => {
  return Math.floor(Date.now() / 1000);
};

// ============================================================================
// Duration Formatting
// ============================================================================

/**
 * Format milliseconds to human-readable duration
 */
export const formatDuration = (ms: number): string => {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  if (ms < 3600000) return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
  
  const hours = Math.floor(ms / 3600000);
  const mins = Math.floor((ms % 3600000) / 60000);
  return `${hours}h ${mins}m`;
};

/**
 * Parse duration string to milliseconds
 * Supports: "1h", "30m", "45s", "100ms", "1h30m", "2d"
 */
export const parseDuration = (duration: string): number => {
  const regex = /(\d+)(d|h|m|s|ms)/g;
  let totalMs = 0;
  let match: RegExpExecArray | null;
  
  while ((match = regex.exec(duration)) !== null) {
    const value = parseInt(match[1] ?? '0', 10);
    const unit = match[2] ?? 's';
    
    switch (unit) {
      case 'd': totalMs += value * 86400000; break;
      case 'h': totalMs += value * 3600000; break;
      case 'm': totalMs += value * 60000; break;
      case 's': totalMs += value * 1000; break;
      case 'ms': totalMs += value; break;
    }
  }
  
  return totalMs;
};

// ============================================================================
// Date Arithmetic
// ============================================================================

/**
 * Add days to a date
 */
export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

/**
 * Add hours to a date
 */
export const addHours = (date: Date, hours: number): Date => {
  return new Date(date.getTime() + hours * 3600000);
};

/**
 * Add minutes to a date
 */
export const addMinutes = (date: Date, minutes: number): Date => {
  return new Date(date.getTime() + minutes * 60000);
};

/**
 * Add seconds to a date
 */
export const addSeconds = (date: Date, seconds: number): Date => {
  return new Date(date.getTime() + seconds * 1000);
};

/**
 * Subtract dates and return difference in milliseconds
 */
export const diffMs = (date1: Date, date2: Date): number => {
  return date1.getTime() - date2.getTime();
};

// ============================================================================
// Date Comparison
// ============================================================================

/**
 * Check if a date is in the past
 */
export const isPast = (date: Date): boolean => {
  return date.getTime() < Date.now();
};

/**
 * Check if a date is in the future
 */
export const isFuture = (date: Date): boolean => {
  return date.getTime() > Date.now();
};

/**
 * Check if a timestamp has expired
 */
export const isExpired = (expiresAt: string | Date | number): boolean => {
  const expiry = typeof expiresAt === 'string' || typeof expiresAt === 'number'
    ? new Date(expiresAt)
    : expiresAt;
  return isPast(expiry);
};

// ============================================================================
// Date Ranges
// ============================================================================

/**
 * Get start of day
 */
export const startOfDay = (date: Date): Date => {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
};

/**
 * Get end of day
 */
export const endOfDay = (date: Date): Date => {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
};

/**
 * Get start of month
 */
export const startOfMonth = (date: Date): Date => {
  const result = new Date(date);
  result.setDate(1);
  result.setHours(0, 0, 0, 0);
  return result;
};

/**
 * Get end of month
 */
export const endOfMonth = (date: Date): Date => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + 1);
  result.setDate(0);
  result.setHours(23, 59, 59, 999);
  return result;
};
