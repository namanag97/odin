/**
 * Query Types
 * L0 Core Contract - Query configuration for filtering, sorting, and pagination
 */

import type { PageRequest, SortDirection } from './pagination';
import type { Timestamp } from './common';

// ============================================================================
// Filter Operator
// ============================================================================

/**
 * Operators for filter conditions
 */
export enum FilterOperator {
  /** Equal to */
  EQ = 'eq',
  /** Not equal to */
  NEQ = 'neq',
  /** Greater than */
  GT = 'gt',
  /** Greater than or equal to */
  GTE = 'gte',
  /** Less than */
  LT = 'lt',
  /** Less than or equal to */
  LTE = 'lte',
  /** In array of values */
  IN = 'in',
  /** Not in array of values */
  NOT_IN = 'not_in',
  /** Contains substring */
  CONTAINS = 'contains',
  /** Starts with */
  STARTS_WITH = 'starts_with',
  /** Ends with */
  ENDS_WITH = 'ends_with',
  /** Between two values (inclusive) */
  BETWEEN = 'between',
  /** Is null */
  IS_NULL = 'is_null',
  /** Is not null */
  IS_NOT_NULL = 'is_not_null',
  /** Regex match */
  REGEX = 'regex',
}

// ============================================================================
// Filter
// ============================================================================

/**
 * Single filter condition
 */
export interface Filter {
  /** Field name to filter on */
  readonly field: string;
  /** Filter operator */
  readonly operator: FilterOperator;
  /** Value to compare against (can be array for IN/NOT_IN, tuple for BETWEEN) */
  readonly value: unknown;
}

/**
 * Filter group with AND/OR logic
 */
export interface FilterGroup {
  /** Logical operator for combining filters */
  readonly logic: 'AND' | 'OR';
  /** Filters in this group */
  readonly clauses: readonly (Filter | FilterGroup)[];
}

// ============================================================================
// Sort Configuration
// ============================================================================

/**
 * Single sort configuration
 */
export interface SortConfig {
  /** Field to sort by */
  readonly field: string;
  /** Sort direction */
  readonly direction: SortDirection;
  /** Null handling */
  readonly nulls?: 'first' | 'last';
}

// ============================================================================
// Date Range
// ============================================================================

/**
 * Date range for temporal queries
 */
export interface DateRange {
  /** Start datetime (ISO 8601 string) */
  start: Timestamp;
  /** End datetime (ISO 8601 string) */
  end: Timestamp;
  /** Whether start is inclusive (default: true) */
  startInclusive?: boolean;
  /** Whether end is inclusive (default: true) */
  endInclusive?: boolean;
}

// ============================================================================
// Query Options
// ============================================================================

/**
 * Complete query configuration combining filters, sort, and pagination
 */
export interface QueryOptions<TFilter = Record<string, unknown>> {
  /** Filters to apply */
  filters?: Filter[];
  /** Filter groups for complex logic */
  filterGroups?: FilterGroup[];
  /** Sort configurations (applied in order) */
  sort?: SortConfig[];
  /** Pagination options */
  pagination?: PageRequest;
  /** Date range filter (convenience) */
  dateRange?: DateRange;
  /** Custom filter object */
  filter?: TFilter;
  /** Search query string */
  search?: string;
  /** Fields to include in response */
  select?: string[];
  /** Relations to include */
  include?: string[];
}

// ============================================================================
// Type Guards & Utilities
// ============================================================================

/**
 * Check if a value is a valid FilterOperator
 */
export const isFilterOperator = (value: unknown): value is FilterOperator => {
  return Object.values(FilterOperator).includes(value as FilterOperator);
};

/**
 * Check if a value is a valid Filter
 */
export const isFilter = (value: unknown): value is Filter => {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  return (
    typeof obj.field === 'string' &&
    isFilterOperator(obj.operator) &&
    'value' in obj
  );
};

/**
 * Check if a value is a valid DateRange
 */
export const isDateRange = (value: unknown): value is DateRange => {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  return typeof obj.start === 'string' && typeof obj.end === 'string';
};

/**
 * Create a simple equality filter
 */
export const eq = (field: string, value: unknown): Filter => ({
  field,
  operator: FilterOperator.EQ,
  value,
});

/**
 * Create a "contains" filter
 */
export const contains = (field: string, value: string): Filter => ({
  field,
  operator: FilterOperator.CONTAINS,
  value,
});

/**
 * Create a "between" filter
 */
export const between = (field: string, min: unknown, max: unknown): Filter => ({
  field,
  operator: FilterOperator.BETWEEN,
  value: [min, max],
});

/**
 * Create an "in" filter
 */
export const inArray = (field: string, values: unknown[]): Filter => ({
  field,
  operator: FilterOperator.IN,
  value: values,
});
