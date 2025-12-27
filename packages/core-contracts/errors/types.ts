/**
 * Specific Error Types
 * L0 Core Contract - Factory functions for creating typed errors
 */

import { type AppError, ErrorCode } from './base';

// ============================================================================
// Validation Error
// ============================================================================

export interface ValidationErrorDetail {
  field: string;
  message: string;
  value?: unknown;
}

export interface ValidationError extends AppError {
  code: ErrorCode.VALIDATION;
  details: {
    errors: ValidationErrorDetail[];
  };
}

export const createValidationError = (
  errors: ValidationErrorDetail[],
  message = 'Validation failed'
): ValidationError => ({
  code: ErrorCode.VALIDATION,
  message,
  details: { errors },
});

// ============================================================================
// Not Found Error
// ============================================================================

export interface NotFoundError extends AppError {
  code: ErrorCode.NOT_FOUND;
  details: {
    resource: string;
    id?: string;
  };
}

export const createNotFoundError = (
  resource: string,
  id?: string
): NotFoundError => ({
  code: ErrorCode.NOT_FOUND,
  message: id 
    ? `${resource} with id '${id}' not found`
    : `${resource} not found`,
  details: { resource, id },
});

// ============================================================================
// Unauthorized Error
// ============================================================================

export interface UnauthorizedError extends AppError {
  code: ErrorCode.UNAUTHORIZED;
}

export const createUnauthorizedError = (
  message = 'Authentication required'
): UnauthorizedError => ({
  code: ErrorCode.UNAUTHORIZED,
  message,
});

// ============================================================================
// Forbidden Error
// ============================================================================

export interface ForbiddenError extends AppError {
  code: ErrorCode.FORBIDDEN;
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
  code: ErrorCode.FORBIDDEN,
  message,
  details: requiredPermission || requiredRole 
    ? { requiredPermission, requiredRole }
    : undefined,
});

// ============================================================================
// Conflict Error
// ============================================================================

export interface ConflictError extends AppError {
  code: ErrorCode.CONFLICT;
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
  code: ErrorCode.CONFLICT,
  message: message ?? `${resource} already exists`,
  details: { resource, conflictingField, conflictingValue },
});

// ============================================================================
// Internal Error
// ============================================================================

export interface InternalError extends AppError {
  code: ErrorCode.INTERNAL;
}

export const createInternalError = (
  message = 'An internal error occurred',
  cause?: Error
): InternalError => ({
  code: ErrorCode.INTERNAL,
  message,
  cause,
});

// ============================================================================
// Bad Request Error
// ============================================================================

export interface BadRequestError extends AppError {
  code: ErrorCode.BAD_REQUEST;
}

export const createBadRequestError = (
  message: string,
  details?: Record<string, unknown>
): BadRequestError => ({
  code: ErrorCode.BAD_REQUEST,
  message,
  details,
});

// ============================================================================
// Rate Limited Error
// ============================================================================

export interface RateLimitedError extends AppError {
  code: ErrorCode.RATE_LIMITED;
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
  code: ErrorCode.RATE_LIMITED,
  message: 'Rate limit exceeded',
  details: { retryAfterMs, limit, remaining },
});

// ============================================================================
// External Service Error
// ============================================================================

export interface ExternalServiceError extends AppError {
  code: ErrorCode.EXTERNAL_SERVICE;
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
  code: ErrorCode.EXTERNAL_SERVICE,
  message: message ?? `External service '${service}' failed`,
  details: {
    service,
    originalError: originalError?.message,
  },
  cause: originalError,
});

// ============================================================================
// Database Error
// ============================================================================

export interface DatabaseError extends AppError {
  code: ErrorCode.INTERNAL;
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
    cause?: Error;
  }
): DatabaseError => ({
  code: ErrorCode.INTERNAL,
  message: message ?? `Database ${operation} operation failed`,
  details: {
    operation,
    table: options?.table,
    constraint: options?.constraint,
  },
  cause: options?.cause,
});

// ============================================================================
// PQL Error (Process Query Language)
// ============================================================================

export interface PQLError extends AppError {
  code: ErrorCode.BAD_REQUEST;
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
  code: ErrorCode.BAD_REQUEST,
  message: `PQL Error: ${message}`,
  details: {
    query,
    ...position,
  },
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
  return isAppError(error) && error.code === ErrorCode.VALIDATION;
};

export const isNotFoundError = (error: unknown): error is NotFoundError => {
  return isAppError(error) && error.code === ErrorCode.NOT_FOUND;
};

export const isUnauthorizedError = (error: unknown): error is UnauthorizedError => {
  return isAppError(error) && error.code === ErrorCode.UNAUTHORIZED;
};

export const isForbiddenError = (error: unknown): error is ForbiddenError => {
  return isAppError(error) && error.code === ErrorCode.FORBIDDEN;
};
