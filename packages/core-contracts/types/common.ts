/**
 * Common Types
 * L0 Core Contract - Shared primitives used across all layers
 */

// ============================================================================
// Brand Symbol
// ============================================================================

declare const __brand: unique symbol;
export type BrandSymbol = typeof __brand;
export type Brand<T, TBrand extends string> = T & { readonly [__brand]: TBrand };


// ============================================================================
// Branded Temporal Types
// ============================================================================

/** ISO 8601 datetime string (branded) */
export type ISODateTime = Brand<string, 'ISODateTime'>;

/** Unix timestamp in milliseconds (branded) */
export type UnixTimestamp = Brand<number, 'UnixTimestamp'>;

/** Duration in milliseconds (branded) */
export type Duration = Brand<number, 'DurationMs'>;

// ============================================================================
// Tracing Types
// ============================================================================

/** Trace ID for distributed tracing */
export type TraceId = Brand<string, 'TraceId'>;

/** Correlation ID for request chaining */
export type CorrelationId = Brand<string, 'CorrelationId'>;

// ============================================================================
// Semantic Types
// ============================================================================

/** Email address (validated) */
export type Email = Brand<string, 'Email'>;

/** URL string (validated) */
export type URL = Brand<string, 'URL'>;

/** JSON string (parseable) */
export type JSONString = Brand<string, 'JSONString'>;

/** Percentage value (0-100) */
export type Percentage = Brand<number, 'Percentage'>;

/** Positive integer (> 0) */
export type PositiveInt = Brand<number, 'PositiveInt'>;

/** Non-negative integer (>= 0) */
export type NonNegativeInt = Brand<number, 'NonNegativeInt'>;

// ============================================================================
// Backward Compatibility Alias
// ============================================================================

/** @deprecated Use ISODateTime instead */
export type Timestamp = string;

// ============================================================================
// Positioning
// ============================================================================

/**
 * Position and size configuration for UI components
 */
export interface PositionConfig {
  /** X coordinate (left position) */
  x: number;
  /** Y coordinate (top position) */
  y: number;
  /** Width */
  width: number;
  /** Height */
  height: number;
}

// ============================================================================
// Metadata
// ============================================================================

/** Generic metadata object */
export type Metadata = Record<string, unknown>;

/** JSON-serializable value */
export type JsonValue = 
  | string 
  | number 
  | boolean 
  | null 
  | JsonValue[] 
  | { [key: string]: JsonValue };

// ============================================================================
// Environment
// ============================================================================

export enum Environment {
  Development = 'development',
  Staging = 'staging',
  Production = 'production',
  Test = 'test',
}

// ============================================================================
// Job Status (used across Data, Mining, Automation)
// ============================================================================

export enum JobStatus {
  Pending = 'pending',
  Queued = 'queued',
  Running = 'running',
  Completed = 'completed',
  Failed = 'failed',
  Cancelled = 'cancelled',
  Paused = 'paused',
}

// ============================================================================
// Entity Status (generic status for entities)
// ============================================================================

export enum EntityStatus {
  Active = 'active',
  Inactive = 'inactive',
  Archived = 'archived',
  Deleted = 'deleted',
}

// ============================================================================
// Common Entity Fields
// ============================================================================

/** Fields common to all auditable entities */
export interface Auditable {
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/** Fields for soft-deletable entities */
export interface SoftDeletable {
  deletedAt: Timestamp | null;
}

/** Fields for tenant-scoped entities */
export interface TenantScoped {
  tenantId: string;
}

/** Combination of common entity traits */
export interface BaseEntity extends Auditable {
  id: string;
}

/** Tenant-scoped base entity */
export interface TenantEntity extends BaseEntity, TenantScoped {}

// ============================================================================
// Utility Types
// ============================================================================

/** Make specific keys optional */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/** Make specific keys required */
export type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

/** Extract only string keys */
export type StringKeys<T> = Extract<keyof T, string>;

/** Deep partial type */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/** Non-nullable type */
export type NonNullableFields<T> = {
  [P in keyof T]: NonNullable<T[P]>;
};
