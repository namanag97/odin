/**
 * Base Error Types
 * L0 Core Contract - Standardized error structure across all layers
 */

import type { ISODateTime, TraceId } from '../types/common';

// ============================================================================
// Error Codes (Categorized by Type)
// ============================================================================

/**
 * Error codes organized by category:
 * - 1xxx: Domain Errors
 * - 2xxx: Validation Errors
 * - 3xxx: Auth Errors
 * - 4xxx: Infrastructure Errors
 * - 5xxx: Process Mining Errors
 */
export type ErrorCode =
  // Domain Errors (1xxx)
  | 'ENTITY_NOT_FOUND'           // 1001
  | 'ENTITY_ALREADY_EXISTS'      // 1002
  | 'ENTITY_CONFLICT'            // 1003
  | 'INVALID_STATE_TRANSITION'   // 1004
  | 'BUSINESS_RULE_VIOLATION'    // 1005
  | 'INVARIANT_VIOLATION'        // 1006
  // Validation Errors (2xxx)
  | 'VALIDATION_FAILED'          // 2001
  | 'INVALID_INPUT'              // 2002
  | 'MISSING_REQUIRED_FIELD'     // 2003
  | 'INVALID_FORMAT'             // 2004
  | 'VALUE_OUT_OF_RANGE'         // 2005
  // Auth Errors (3xxx)
  | 'UNAUTHENTICATED'            // 3001
  | 'UNAUTHORIZED'               // 3002
  | 'TOKEN_EXPIRED'              // 3003
  | 'INSUFFICIENT_PERMISSIONS'   // 3004
  | 'MFA_REQUIRED'               // 3005
  // Infrastructure Errors (4xxx)
  | 'DATABASE_ERROR'             // 4001
  | 'EXTERNAL_SERVICE_ERROR'     // 4002
  | 'TIMEOUT'                    // 4003
  | 'RATE_LIMITED'               // 4004
  | 'RESOURCE_EXHAUSTED'         // 4005
  // Process Mining Errors (5xxx)
  | 'INVALID_EVENT_LOG'          // 5001
  | 'DISCOVERY_FAILED'           // 5002
  | 'CONFORMANCE_CHECK_FAILED'   // 5003
  | 'INVALID_PROCESS_MODEL'      // 5004
  | 'OCEL_PARSE_ERROR'           // 5005
  | 'PM4PY_EXECUTION_ERROR';     // 5006

// ============================================================================
// HTTP Status Mapping
// ============================================================================

export const ErrorCodeToHttpStatus: Record<ErrorCode, number> = {
  // Domain Errors -> 400/404/409
  ENTITY_NOT_FOUND: 404,
  ENTITY_ALREADY_EXISTS: 409,
  ENTITY_CONFLICT: 409,
  INVALID_STATE_TRANSITION: 400,
  BUSINESS_RULE_VIOLATION: 400,
  INVARIANT_VIOLATION: 400,
  // Validation Errors -> 400/422
  VALIDATION_FAILED: 400,
  INVALID_INPUT: 400,
  MISSING_REQUIRED_FIELD: 400,
  INVALID_FORMAT: 400,
  VALUE_OUT_OF_RANGE: 400,
  // Auth Errors -> 401/403
  UNAUTHENTICATED: 401,
  UNAUTHORIZED: 403,
  TOKEN_EXPIRED: 401,
  INSUFFICIENT_PERMISSIONS: 403,
  MFA_REQUIRED: 403,
  // Infrastructure Errors -> 500/502/503/504
  DATABASE_ERROR: 500,
  EXTERNAL_SERVICE_ERROR: 502,
  TIMEOUT: 504,
  RATE_LIMITED: 429,
  RESOURCE_EXHAUSTED: 503,
  // Process Mining Errors -> 400/500
  INVALID_EVENT_LOG: 400,
  DISCOVERY_FAILED: 500,
  CONFORMANCE_CHECK_FAILED: 500,
  INVALID_PROCESS_MODEL: 400,
  OCEL_PARSE_ERROR: 400,
  PM4PY_EXECUTION_ERROR: 500,
};

// ============================================================================
// App Error Interface
// ============================================================================

/**
 * Standard application error
 * All errors across all services should conform to this structure
 */
export interface AppError {
  /** Error code for programmatic handling */
  readonly code: ErrorCode;
  /** Human-readable error message */
  readonly message: string;
  /** Additional error details (validation errors, field errors, etc.) */
  readonly details?: Record<string, unknown>;
  /** Timestamp when error occurred */
  readonly timestamp: ISODateTime;
  /** Trace ID for correlation */
  readonly traceId: TraceId;
  /** Chain of underlying errors */
  readonly cause?: AppError;
}

// ============================================================================
// Error Serialization
// ============================================================================

/**
 * Serialized error format for API responses
 */
export interface SerializedError {
  readonly code: ErrorCode;
  readonly message: string;
  readonly details?: Record<string, unknown>;
  /** Request ID for correlation */
  readonly requestId?: string;
  /** Timestamp of the error */
  readonly timestamp: string;
}

/**
 * Convert AppError to serialized format
 */
export const serializeError = (
  error: AppError,
  requestId?: string
): SerializedError => ({
  code: error.code,
  message: error.message,
  details: error.details,
  requestId,
  timestamp: error.timestamp,
});

/**
 * Get HTTP status code for an error
 */
export const getHttpStatus = (error: AppError): number => {
  return ErrorCodeToHttpStatus[error.code] ?? 500;
};
