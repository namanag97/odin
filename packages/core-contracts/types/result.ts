/**
 * Result Type - Discriminated union for success/failure handling
 * L0 Core Contract - Used across all services for error handling
 */

import type { AppError } from '../errors/base';

// ============================================================================
// Result Type - Success or Failure
// ============================================================================

/** Represents a successful operation with data */
export interface Success<T> {
  readonly success: true;
  readonly data: T;
}

/** Represents a failed operation with an error */
export interface Failure<E> {
  readonly success: false;
  readonly error: E;
}

/** 
 * Result type - Either Success<T> or Failure<E>
 * Use this for operations that can fail with typed errors
 */
export type Result<T, E = AppError> = Success<T> | Failure<E>;

// ============================================================================
// Option Type - Some or None
// ============================================================================

/** Represents a value that exists */
export interface Some<T> {
  readonly some: true;
  readonly value: T;
}

/** Represents absence of a value */
export interface None {
  readonly some: false;
}

/**
 * Option type - Either Some<T> or None
 * Use this instead of null/undefined for explicit optional values
 */
export type Option<T> = Some<T> | None;

// ============================================================================
// Async variants
// ============================================================================

/** Async Result - Promise that resolves to a Result */
export type AsyncResult<T, E = AppError> = Promise<Result<T, E>>;

/** Async Option - Promise that resolves to an Option */
export type AsyncOption<T> = Promise<Option<T>>;
