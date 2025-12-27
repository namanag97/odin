/**
 * DateTime Provider Contract
 * L0 Core Contract - Interface for datetime operations
 */

import type { Timestamp, Duration } from '../types/common';

// ============================================================================
// DateTime Formats
// ============================================================================

/**
 * Supported datetime format presets
 */
export type DateTimeFormat = 
  | 'iso'           // ISO 8601: 2024-01-15T10:30:00.000Z
  | 'date'          // Date only: 2024-01-15
  | 'time'          // Time only: 10:30:00
  | 'datetime'      // Date and time: 2024-01-15 10:30:00
  | 'relative'      // Relative: 5 minutes ago
  | 'short'         // Short: Jan 15, 2024
  | 'long'          // Long: January 15, 2024 at 10:30 AM
  | 'unix'          // Unix timestamp: 1705315800
  | 'custom';       // Custom format

// ============================================================================
// DateTime Provider Interface
// ============================================================================

/**
 * DateTime provider interface for time-related operations
 * Abstracted for testability (allows mocking time in tests)
 */
export interface DateTimeProvider {
  /**
   * Get the current datetime as ISO 8601 string
   */
  now(): Timestamp;
  
  /**
   * Get the current datetime as Unix timestamp in milliseconds
   */
  nowMs(): number;
  
  /**
   * Parse a datetime string into a Date object
   * @param input Datetime string to parse
   * @returns Parsed Date or null if invalid
   */
  parse(input: string): Date | null;
  
  /**
   * Format a datetime to a string
   * @param date Date to format
   * @param format Format preset or custom format string
   * @param locale Optional locale for formatting
   */
  format(date: Date | Timestamp | number, format: DateTimeFormat, locale?: string): string;
  
  /**
   * Add duration to a datetime
   * @param date Base datetime
   * @param duration Duration to add in milliseconds
   */
  add(date: Date | Timestamp, duration: Duration): Date;
  
  /**
   * Subtract duration from a datetime
   * @param date Base datetime
   * @param duration Duration to subtract in milliseconds
   */
  subtract(date: Date | Timestamp, duration: Duration): Date;
  
  /**
   * Calculate difference between two datetimes in milliseconds
   * @param start Start datetime
   * @param end End datetime
   */
  diff(start: Date | Timestamp, end: Date | Timestamp): Duration;
  
  /**
   * Check if a datetime is before another
   */
  isBefore(date1: Date | Timestamp, date2: Date | Timestamp): boolean;
  
  /**
   * Check if a datetime is after another
   */
  isAfter(date1: Date | Timestamp, date2: Date | Timestamp): boolean;
  
  /**
   * Check if a datetime is between two others
   */
  isBetween(date: Date | Timestamp, start: Date | Timestamp, end: Date | Timestamp): boolean;
  
  /**
   * Get start of a time period
   * @param date Datetime
   * @param unit Time unit (day, week, month, year)
   */
  startOf(date: Date | Timestamp, unit: 'day' | 'week' | 'month' | 'year'): Date;
  
  /**
   * Get end of a time period
   * @param date Datetime
   * @param unit Time unit (day, week, month, year)
   */
  endOf(date: Date | Timestamp, unit: 'day' | 'week' | 'month' | 'year'): Date;
}

// ============================================================================
// Duration Constants
// ============================================================================

/** Duration constants in milliseconds */
export const DurationMs = {
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
  WEEK: 7 * 24 * 60 * 60 * 1000,
} as const;

// ============================================================================
// Duration Utilities
// ============================================================================

/**
 * Convert seconds to milliseconds
 */
export const seconds = (n: number): Duration => n * DurationMs.SECOND;

/**
 * Convert minutes to milliseconds
 */
export const minutes = (n: number): Duration => n * DurationMs.MINUTE;

/**
 * Convert hours to milliseconds
 */
export const hours = (n: number): Duration => n * DurationMs.HOUR;

/**
 * Convert days to milliseconds
 */
export const days = (n: number): Duration => n * DurationMs.DAY;

/**
 * Convert weeks to milliseconds
 */
export const weeks = (n: number): Duration => n * DurationMs.WEEK;
