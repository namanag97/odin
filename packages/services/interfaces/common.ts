/**
 * Common DTOs shared across all services
 */

export interface PaginatedResult<T> {
  readonly items: readonly T[];
  readonly total: number;
  readonly page: number;
  readonly limit: number;
  readonly hasMore: boolean;
}

export interface Pagination {
  readonly page: number;
  readonly limit: number;
}

export interface SortConfig {
  readonly field: string;
  readonly direction: 'asc' | 'desc';
}

export interface DateRange {
  readonly start: string; // ISODateTime
  readonly end: string; // ISODateTime
}

export interface FilterClause {
  readonly field: string;
  readonly operator: FilterOperator;
  readonly value: unknown;
}

export type FilterOperator =
  | 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte'
  | 'in' | 'not_in' | 'contains' | 'starts_with' | 'ends_with'
  | 'is_null' | 'is_not_null';

export type LogicalOperator = 'and' | 'or';

export interface FilterCondition {
  readonly field: string;
  readonly operator: FilterOperator;
  readonly value: unknown;
}

export type DataType =
  | 'string' | 'number' | 'boolean' | 'date' | 'datetime'
  | 'timestamp' | 'json' | 'array';

export type ImportMode = 'create' | 'append' | 'replace' | 'upsert';

export interface ImportResult {
  readonly rowsImported: number;
  readonly rowsFailed: number;
  readonly errors?: readonly ImportError[];
  readonly duration: number; // milliseconds
}

export interface ImportError {
  readonly row: number;
  readonly column?: string;
  readonly message: string;
  readonly value?: unknown;
}

export interface Column {
  readonly name: string;
  readonly displayName?: string;
  readonly dataType: DataType;
  readonly nullable: boolean;
  readonly isPrimaryKey?: boolean;
}

export type AggregationType = 'sum' | 'avg' | 'min' | 'max' | 'count';
