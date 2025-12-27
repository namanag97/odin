/**
 * Validation Utilities
 * L0 Core Lib - Common validation functions
 */

// ============================================================================
// Email Validation
// ============================================================================

/**
 * Email regex pattern (RFC 5322 simplified)
 */
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

/**
 * Check if a string is a valid email address
 */
export const isEmail = (value: string): boolean => {
  return EMAIL_REGEX.test(value);
};

// ============================================================================
// URL Validation
// ============================================================================

/**
 * Check if a string is a valid URL
 */
export const isUrl = (value: string): boolean => {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
};

/**
 * Check if a string is a valid HTTP(S) URL
 */
export const isHttpUrl = (value: string): boolean => {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

// ============================================================================
// UUID Validation
// ============================================================================

/**
 * UUID v4 regex pattern
 */
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Check if a string is a valid UUID
 */
export const isUuid = (value: string): boolean => {
  return UUID_REGEX.test(value);
};

// ============================================================================
// String Validation
// ============================================================================

/**
 * Check if a string is non-empty (after trimming)
 */
export const isNonEmpty = (value: string): boolean => {
  return value.trim().length > 0;
};

/**
 * Check if a string has minimum length
 */
export const hasMinLength = (value: string, min: number): boolean => {
  return value.length >= min;
};

/**
 * Check if a string has maximum length
 */
export const hasMaxLength = (value: string, max: number): boolean => {
  return value.length <= max;
};

/**
 * Check if a string is within length bounds
 */
export const hasLengthBetween = (value: string, min: number, max: number): boolean => {
  return value.length >= min && value.length <= max;
};

/**
 * Check if a string matches a pattern
 */
export const matchesPattern = (value: string, pattern: RegExp): boolean => {
  return pattern.test(value);
};

// ============================================================================
// Number Validation
// ============================================================================

/**
 * Check if a value is a valid number (not NaN, not Infinity)
 */
export const isValidNumber = (value: unknown): value is number => {
  return typeof value === 'number' && !Number.isNaN(value) && Number.isFinite(value);
};

/**
 * Check if a value is a positive number
 */
export const isPositive = (value: number): boolean => {
  return isValidNumber(value) && value > 0;
};

/**
 * Check if a value is a non-negative number
 */
export const isNonNegative = (value: number): boolean => {
  return isValidNumber(value) && value >= 0;
};

/**
 * Check if a value is an integer
 */
export const isInteger = (value: number): boolean => {
  return isValidNumber(value) && Number.isInteger(value);
};

/**
 * Check if a value is within a range (inclusive)
 */
export const isInRange = (value: number, min: number, max: number): boolean => {
  return isValidNumber(value) && value >= min && value <= max;
};

// ============================================================================
// Slug Validation
// ============================================================================

/**
 * Slug pattern (lowercase, alphanumeric, hyphens)
 */
const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Check if a string is a valid slug
 */
export const isSlug = (value: string): boolean => {
  return SLUG_REGEX.test(value);
};

// ============================================================================
// Phone Validation
// ============================================================================

/**
 * Check if a string looks like a phone number
 * (Basic check - for full validation use a library like libphonenumber)
 */
export const isPhoneNumber = (value: string): boolean => {
  const cleaned = value.replace(/[\s\-\(\)]/g, '');
  return /^\+?[0-9]{10,15}$/.test(cleaned);
};

// ============================================================================
// Date Validation
// ============================================================================

/**
 * Check if a string is a valid ISO 8601 date
 */
export const isIsoDate = (value: string): boolean => {
  const date = new Date(value);
  return !Number.isNaN(date.getTime()) && value === date.toISOString();
};

/**
 * Check if a string can be parsed as a date
 */
export const isDateString = (value: string): boolean => {
  const date = new Date(value);
  return !Number.isNaN(date.getTime());
};

// ============================================================================
// JSON Validation
// ============================================================================

/**
 * Check if a string is valid JSON
 */
export const isValidJson = (value: string): boolean => {
  try {
    JSON.parse(value);
    return true;
  } catch {
    return false;
  }
};

/**
 * Try to parse JSON, return null on failure
 */
export const tryParseJson = <T>(value: string): T | null => {
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
};
