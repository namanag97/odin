/**
 * Specific Error Types
 * L0 Core Contract - Factory functions for creating typed errors
 */

import type { AppError } from './base';
import type { ISODateTime, TraceId } from '../types/common';

// ============================================================================
// Helper to generate error metadata
// ============================================================================

const errorMeta = (): { timestamp: ISODateTime; traceId: TraceId } => ({
  timestamp: new Date().toISOString() as ISODateTime,
  traceId: crypto.randomUUID() as TraceId,
});

// ============================================================================
// Validation Error
// ============================================================================

export interface ValidationErrorDetail {
  readonly field: string;
  readonly message: string;
  readonly value?: unknown;
}

export interface ValidationError extends AppError {
  code: 'VALIDATION_FAILED';
  details: {
    errors: ValidationErrorDetail[];
  };
}

export const createValidationError = (
  errors: ValidationErrorDetail[],
  message = 'Validation failed'
): ValidationError => ({
  code: 'VALIDATION_FAILED',
  message,
  details: { errors },
  ...errorMeta(),
});

// ============================================================================
// Not Found Error
// ============================================================================

export interface NotFoundError extends AppError {
  code: 'ENTITY_NOT_FOUND';
  details: {
    resource: string;
    id?: string;
  };
}

export const createNotFoundError = (
  resource: string,
  id?: string
): NotFoundError => ({
  code: 'ENTITY_NOT_FOUND',
  message: id 
    ? `${resource} with id '${id}' not found`
    : `${resource} not found`,
  details: { resource, id },
  ...errorMeta(),
});

// ============================================================================
// Unauthorized Error
// ============================================================================

export interface UnauthorizedError extends AppError {
  code: 'UNAUTHENTICATED';
}

export const createUnauthorizedError = (
  message = 'Authentication required'
): UnauthorizedError => ({
  code: 'UNAUTHENTICATED',
  message,
  ...errorMeta(),
});

// ============================================================================
// Forbidden Error
// ============================================================================

export interface ForbiddenError extends AppError {
  code: 'UNAUTHORIZED' | 'INSUFFICIENT_PERMISSIONS';
  details?: {
    requiredPermission?: string;
    requiredRole?: string;
  };
}

export const createForbiddenError = (
  message = 'Access denied',
  requiredPermission?: string,
  requiredRole?: string
): ForbiddenError => ({
  code: 'INSUFFICIENT_PERMISSIONS',
  message,
  details: requiredPermission || requiredRole 
    ? { requiredPermission, requiredRole }
    : undefined,
  ...errorMeta(),
});

// ============================================================================
// Conflict Error
// ============================================================================

export interface ConflictError extends AppError {
  code: 'ENTITY_ALREADY_EXISTS' | 'ENTITY_CONFLICT';
  details: {
    resource: string;
    conflictingField?: string;
    conflictingValue?: unknown;
  };
}

export const createConflictError = (
  resource: string,
  message?: string,
  conflictingField?: string,
  conflictingValue?: unknown
): ConflictError => ({
  code: 'ENTITY_ALREADY_EXISTS',
  message: message ?? `${resource} already exists`,
  details: { resource, conflictingField, conflictingValue },
  ...errorMeta(),
});

// ============================================================================
// Internal Error
// ============================================================================

export interface InternalError extends AppError {
  code: 'DATABASE_ERROR' | 'EXTERNAL_SERVICE_ERROR';
}

export const createInternalError = (
  message = 'An internal error occurred',
  cause?: AppError
): InternalError => ({
  code: 'DATABASE_ERROR',
  message,
  cause,
  ...errorMeta(),
});

// ============================================================================
// Bad Request Error
// ============================================================================

export interface BadRequestError extends AppError {
  code: 'INVALID_INPUT';
}

export const createBadRequestError = (
  message: string,
  details?: Record<string, unknown>
): BadRequestError => ({
  code: 'INVALID_INPUT',
  message,
  details,
  ...errorMeta(),
});

// ============================================================================
// Rate Limited Error
// ============================================================================

export interface RateLimitedError extends AppError {
  code: 'RATE_LIMITED';
  details: {
    retryAfterMs?: number;
    limit?: number;
    remaining?: number;
  };
}

export const createRateLimitedError = (
  retryAfterMs?: number,
  limit?: number,
  remaining?: number
): RateLimitedError => ({
  code: 'RATE_LIMITED',
  message: 'Rate limit exceeded',
  details: { retryAfterMs, limit, remaining },
  ...errorMeta(),
});

// ============================================================================
// External Service Error
// ============================================================================

export interface ExternalServiceError extends AppError {
  code: 'EXTERNAL_SERVICE_ERROR';
  details: {
    service: string;
    originalError?: string;
  };
}

export const createExternalServiceError = (
  service: string,
  message?: string,
  originalError?: Error
): ExternalServiceError => ({
  code: 'EXTERNAL_SERVICE_ERROR',
  message: message ?? `External service '${service}' failed`,
  details: {
    service,
    originalError: originalError?.message,
  },
  ...errorMeta(),
});

// ============================================================================
// Database Error
// ============================================================================

export interface DatabaseError extends AppError {
  code: 'DATABASE_ERROR';
  details: {
    operation: 'query' | 'insert' | 'update' | 'delete' | 'transaction';
    table?: string;
    constraint?: string;
  };
}

export const createDatabaseError = (
  operation: DatabaseError['details']['operation'],
  message?: string,
  options?: {
    table?: string;
    constraint?: string;
    cause?: AppError;
  }
): DatabaseError => ({
  code: 'DATABASE_ERROR',
  message: message ?? `Database ${operation} operation failed`,
  details: {
    operation,
    table: options?.table,
    constraint: options?.constraint,
  },
  cause: options?.cause,
  ...errorMeta(),
});

// ============================================================================
// PQL Error (Process Query Language)
// ============================================================================

export interface PQLError extends AppError {
  code: 'INVALID_INPUT';
  details: {
    query: string;
    position?: number;
    line?: number;
    column?: number;
    expected?: string[];
  };
}

export const createPQLError = (
  query: string,
  message: string,
  position?: {
    position?: number;
    line?: number;
    column?: number;
    expected?: string[];
  }
): PQLError => ({
  code: 'INVALID_INPUT',
  message: `PQL Error: ${message}`,
  details: {
    query,
    ...position,
  },
  ...errorMeta(),
});

// ============================================================================
// Type Guards
// ============================================================================

export const isAppError = (error: unknown): error is AppError => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error &&
    typeof (error as AppError).code === 'string' &&
    typeof (error as AppError).message === 'string'
  );
};

export const isValidationError = (error: unknown): error is ValidationError => {
  return isAppError(error) && error.code === 'VALIDATION_FAILED';
};

export const isNotFoundError = (error: unknown): error is NotFoundError => {
  return isAppError(error) && error.code === 'ENTITY_NOT_FOUND';
};

export const isUnauthorizedError = (error: unknown): error is UnauthorizedError => {
  return isAppError(error) && error.code === 'UNAUTHENTICATED';
};

export const isForbiddenError = (error: unknown): error is ForbiddenError => {
  return isAppError(error) && (error.code === 'UNAUTHORIZED' || error.code === 'INSUFFICIENT_PERMISSIONS');
};
