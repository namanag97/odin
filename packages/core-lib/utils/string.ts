/**
 * String Utilities
 * L0 Core Lib - String manipulation helper functions
 */

// ============================================================================
// Case Conversions
// ============================================================================

/**
 * Convert string to PascalCase
 */
export const toPascalCase = (str: string): string => {
  return str
    .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
    .replace(/^(.)/, (c) => c.toUpperCase());
};

/**
 * Convert string to camelCase
 */
export const toCamelCase = (str: string): string => {
  const pascal = toPascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
};

/**
 * Convert string to snake_case
 */
export const toSnakeCase = (str: string): string => {
  return str
    .replace(/([A-Z])/g, '_$1')
    .replace(/[-\s]+/g, '_')
    .toLowerCase()
    .replace(/^_/, '');
};

/**
 * Convert string to kebab-case
 */
export const toKebabCase = (str: string): string => {
  return str
    .replace(/([A-Z])/g, '-$1')
    .replace(/[_\s]+/g, '-')
    .toLowerCase()
    .replace(/^-/, '');
};

/**
 * Convert string to CONSTANT_CASE
 */
export const toConstantCase = (str: string): string => {
  return toSnakeCase(str).toUpperCase();
};

// ============================================================================
// Slugify
// ============================================================================

/**
 * Convert string to URL-friendly slug
 */
export const slugify = (str: string): string => {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove non-word chars
    .replace(/[\s_-]+/g, '-') // Replace spaces/underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

/**
 * Generate a unique slug with suffix
 */
export const slugifyWithSuffix = (str: string, suffix?: string): string => {
  const base = slugify(str);
  const uniqueSuffix = suffix ?? Math.random().toString(36).substring(2, 8);
  return `${base}-${uniqueSuffix}`;
};

// ============================================================================
// Truncation
// ============================================================================

/**
 * Truncate string to a maximum length with ellipsis
 */
export const truncate = (str: string, maxLength: number, suffix = '...'): string => {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - suffix.length) + suffix;
};

/**
 * Truncate string at word boundary
 */
export const truncateWords = (str: string, maxLength: number, suffix = '...'): string => {
  if (str.length <= maxLength) return str;
  
  const truncated = str.slice(0, maxLength - suffix.length);
  const lastSpace = truncated.lastIndexOf(' ');
  
  if (lastSpace > 0) {
    return truncated.slice(0, lastSpace) + suffix;
  }
  return truncated + suffix;
};

// ============================================================================
// Padding
// ============================================================================

/**
 * Pad string with leading zeros
 */
export const padZeros = (num: number | string, length: number): string => {
  return String(num).padStart(length, '0');
};

/**
 * Pad string to center
 */
export const padCenter = (str: string, length: number, char = ' '): string => {
  const padLength = length - str.length;
  if (padLength <= 0) return str;
  
  const padLeft = Math.floor(padLength / 2);
  const padRight = padLength - padLeft;
  
  return char.repeat(padLeft) + str + char.repeat(padRight);
};

// ============================================================================
// Sanitization
// ============================================================================

/**
 * Escape HTML special characters
 */
export const escapeHtml = (str: string): string => {
  const htmlEscapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return str.replace(/[&<>"']/g, (char) => htmlEscapes[char] ?? char);
};

/**
 * Strip HTML tags from string
 */
export const stripHtml = (str: string): string => {
  return str.replace(/<[^>]*>/g, '');
};

/**
 * Normalize whitespace (collapse multiple spaces)
 */
export const normalizeWhitespace = (str: string): string => {
  return str.replace(/\s+/g, ' ').trim();
};

// ============================================================================
// Comparisons
// ============================================================================

/**
 * Case-insensitive string comparison
 */
export const equalsIgnoreCase = (a: string, b: string): boolean => {
  return a.toLowerCase() === b.toLowerCase();
};

/**
 * Check if string contains substring (case-insensitive)
 */
export const containsIgnoreCase = (str: string, search: string): boolean => {
  return str.toLowerCase().includes(search.toLowerCase());
};

// ============================================================================
// Generation
// ============================================================================

/**
 * Generate a random string of specified length
 */
export const randomString = (length: number, charset = 'alphanumeric'): string => {
  const charsets: Record<string, string> = {
    alphanumeric: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
    alpha: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
    numeric: '0123456789',
    hex: '0123456789abcdef',
  };
  
  const chars = charsets[charset] ?? charset;
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
};

/**
 * Generate a short ID (8 characters)
 */
export const shortId = (): string => {
  return randomString(8, 'alphanumeric');
};
