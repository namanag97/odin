/**
 * Result Helpers
 * L0 Core Lib - Utility functions for working with Result and Option types
 */

import type { 
  Result, 
  Success, 
  Failure, 
  Option, 
  Some, 
  None,
  AsyncResult 
} from '@odin/core-contracts';

// ============================================================================
// Result Constructors
// ============================================================================

/**
 * Create a Success result
 */
export const success = <T>(data: T): Success<T> => ({
  success: true,
  data,
});

/**
 * Create a Failure result
 */
export const failure = <E>(error: E): Failure<E> => ({
  success: false,
  error,
});

// ============================================================================
// Result Type Guards
// ============================================================================

/**
 * Check if a result is a Success
 */
export const isSuccess = <T, E>(result: Result<T, E>): result is Success<T> => {
  return result.success === true;
};

/**
 * Check if a result is a Failure
 */
export const isFailure = <T, E>(result: Result<T, E>): result is Failure<E> => {
  return result.success === false;
};

// ============================================================================
// Result Transformations
// ============================================================================

/**
 * Map the success data of a Result
 */
export const mapResult = <T, U, E>(
  result: Result<T, E>,
  fn: (data: T) => U
): Result<U, E> => {
  if (isSuccess(result)) {
    return success(fn(result.data));
  }
  return result;
};

/**
 * Map the error value of a Result
 */
export const mapError = <T, E, F>(
  result: Result<T, E>,
  fn: (error: E) => F
): Result<T, F> => {
  if (isFailure(result)) {
    return failure(fn(result.error));
  }
  return result;
};

/**
 * FlatMap (chain) a Result
 */
export const flatMapResult = <T, U, E>(
  result: Result<T, E>,
  fn: (data: T) => Result<U, E>
): Result<U, E> => {
  if (isSuccess(result)) {
    return fn(result.data);
  }
  return result;
};

/**
 * Unwrap a Result, throwing if it's a Failure
 */
export const unwrap = <T, E>(result: Result<T, E>): T => {
  if (isSuccess(result)) {
    return result.data;
  }
  throw result.error;
};

/**
 * Unwrap a Result with a default value
 */
export const unwrapOr = <T, E>(result: Result<T, E>, defaultValue: T): T => {
  if (isSuccess(result)) {
    return result.data;
  }
  return defaultValue;
};

/**
 * Unwrap a Result with a lazy default
 */
export const unwrapOrElse = <T, E>(
  result: Result<T, E>,
  fn: (error: E) => T
): T => {
  if (isSuccess(result)) {
    return result.data;
  }
  return fn(result.error);
};

/**
 * Convert a Result to an Option (discards error)
 */
export const resultToOption = <T, E>(result: Result<T, E>): Option<T> => {
  if (isSuccess(result)) {
    return some(result.data);
  }
  return none();
};

// ============================================================================
// Option Constructors
// ============================================================================

/**
 * Create a Some option
 */
export const some = <T>(value: T): Some<T> => ({
  some: true,
  value,
});

/**
 * Create a None option
 */
export const none = (): None => ({
  some: false,
});

/**
 * Create an Option from a nullable value
 */
export const fromNullable = <T>(value: T | null | undefined): Option<T> => {
  if (value === null || value === undefined) {
    return none();
  }
  return some(value);
};

// ============================================================================
// Option Type Guards
// ============================================================================

/**
 * Check if an option is Some
 */
export const isSome = <T>(option: Option<T>): option is Some<T> => {
  return option.some === true;
};

/**
 * Check if an option is None
 */
export const isNone = <T>(option: Option<T>): option is None => {
  return option.some === false;
};

// ============================================================================
// Option Transformations
// ============================================================================

/**
 * Map the value of an Option
 */
export const mapOption = <T, U>(
  option: Option<T>,
  fn: (value: T) => U
): Option<U> => {
  if (isSome(option)) {
    return some(fn(option.value));
  }
  return none();
};

/**
 * FlatMap an Option
 */
export const flatMapOption = <T, U>(
  option: Option<T>,
  fn: (value: T) => Option<U>
): Option<U> => {
  if (isSome(option)) {
    return fn(option.value);
  }
  return none();
};

/**
 * Get the value or a default
 */
export const getOrDefault = <T>(option: Option<T>, defaultValue: T): T => {
  if (isSome(option)) {
    return option.value;
  }
  return defaultValue;
};

/**
 * Convert an Option to a nullable value
 */
export const toNullable = <T>(option: Option<T>): T | null => {
  if (isSome(option)) {
    return option.value;
  }
  return null;
};

// ============================================================================
// Async Result Helpers
// ============================================================================

/**
 * Try executing an async function, returning a Result
 */
export const tryCatch = async <T, E = Error>(
  fn: () => Promise<T>,
  mapError: (error: unknown) => E = (e) => e as E
): AsyncResult<T, E> => {
  try {
    const data = await fn();
    return success(data);
  } catch (error) {
    return failure(mapError(error));
  }
};

/**
 * Combine multiple Results into one
 */
export const combineResults = <T, E>(
  results: Result<T, E>[]
): Result<T[], E> => {
  const data: T[] = [];
  
  for (const result of results) {
    if (isFailure(result)) {
      return result;
    }
    data.push(result.data);
  }
  
  return success(data);
};

/**
 * Run async operations in sequence, returning first failure
 */
export const sequenceAsync = async <T, E>(
  fns: Array<() => AsyncResult<T, E>>
): AsyncResult<T[], E> => {
  const data: T[] = [];
  
  for (const fn of fns) {
    const result = await fn();
    if (isFailure(result)) {
      return result;
    }
    data.push(result.data);
  }
  
  return success(data);
};
