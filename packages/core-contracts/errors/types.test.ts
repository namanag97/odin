/**
 * Unit Tests for Error Types
 */
import { describe, it, expect } from 'vitest';
import {
  createValidationError,
  createNotFoundError,
  createUnauthorizedError,
  createForbiddenError,
  createConflictError,
  createInternalError,
  createBadRequestError,
  createRateLimitedError,
  createExternalServiceError,
  createDatabaseError,
  createPQLError,
  isAppError,
  isValidationError,
  isNotFoundError,
  isUnauthorizedError,
  isForbiddenError,
} from './types';

describe('Error Factory Functions', () => {
  describe('createValidationError', () => {
    it('creates a validation error with details', () => {
      const errors = [
        { field: 'email', message: 'Invalid email format' },
        { field: 'name', message: 'Name is required' },
      ];
      const error = createValidationError(errors);

      expect(error.code).toBe('VALIDATION_FAILED');
      expect(error.message).toBe('Validation failed');
      expect(error.details.errors).toEqual(errors);
      expect(error.timestamp).toBeDefined();
      expect(error.traceId).toBeDefined();
    });

    it('accepts custom message', () => {
      const error = createValidationError([], 'Custom validation error');
      expect(error.message).toBe('Custom validation error');
    });
  });

  describe('createNotFoundError', () => {
    it('creates not found error with resource and id', () => {
      const error = createNotFoundError('User', '123');

      expect(error.code).toBe('ENTITY_NOT_FOUND');
      expect(error.message).toBe("User with id '123' not found");
      expect(error.details.resource).toBe('User');
      expect(error.details.id).toBe('123');
    });

    it('creates not found error without id', () => {
      const error = createNotFoundError('Configuration');

      expect(error.message).toBe('Configuration not found');
      expect(error.details.id).toBeUndefined();
    });
  });

  describe('createUnauthorizedError', () => {
    it('creates unauthorized error with default message', () => {
      const error = createUnauthorizedError();

      expect(error.code).toBe('UNAUTHENTICATED');
      expect(error.message).toBe('Authentication required');
    });

    it('accepts custom message', () => {
      const error = createUnauthorizedError('Token expired');
      expect(error.message).toBe('Token expired');
    });
  });

  describe('createForbiddenError', () => {
    it('creates forbidden error with default message', () => {
      const error = createForbiddenError();

      expect(error.code).toBe('INSUFFICIENT_PERMISSIONS');
      expect(error.message).toBe('Access denied');
    });

    it('includes required permission details', () => {
      const error = createForbiddenError('Cannot delete users', 'user:delete');

      expect(error.details?.requiredPermission).toBe('user:delete');
    });

    it('includes required role details', () => {
      const error = createForbiddenError('Admin only', undefined, 'admin');

      expect(error.details?.requiredRole).toBe('admin');
    });
  });

  describe('createConflictError', () => {
    it('creates conflict error', () => {
      const error = createConflictError('User', 'User already exists', 'email', 'test@example.com');

      expect(error.code).toBe('ENTITY_ALREADY_EXISTS');
      expect(error.message).toBe('User already exists');
      expect(error.details.resource).toBe('User');
      expect(error.details.conflictingField).toBe('email');
      expect(error.details.conflictingValue).toBe('test@example.com');
    });

    it('uses default message when not provided', () => {
      const error = createConflictError('User');
      expect(error.message).toBe('User already exists');
    });
  });

  describe('createInternalError', () => {
    it('creates internal error', () => {
      const error = createInternalError('Something went wrong');

      expect(error.code).toBe('DATABASE_ERROR');
      expect(error.message).toBe('Something went wrong');
    });

    it('uses default message when not provided', () => {
      const error = createInternalError();
      expect(error.message).toBe('An internal error occurred');
    });
  });

  describe('createBadRequestError', () => {
    it('creates bad request error', () => {
      const error = createBadRequestError('Invalid request', { reason: 'missing fields' });

      expect(error.code).toBe('INVALID_INPUT');
      expect(error.message).toBe('Invalid request');
      expect(error.details).toEqual({ reason: 'missing fields' });
    });
  });

  describe('createRateLimitedError', () => {
    it('creates rate limited error', () => {
      const error = createRateLimitedError(5000, 100, 0);

      expect(error.code).toBe('RATE_LIMITED');
      expect(error.message).toBe('Rate limit exceeded');
      expect(error.details.retryAfterMs).toBe(5000);
      expect(error.details.limit).toBe(100);
      expect(error.details.remaining).toBe(0);
    });
  });

  describe('createExternalServiceError', () => {
    it('creates external service error', () => {
      const error = createExternalServiceError('PaymentGateway', 'Payment failed');

      expect(error.code).toBe('EXTERNAL_SERVICE_ERROR');
      expect(error.message).toBe('Payment failed');
      expect(error.details.service).toBe('PaymentGateway');
    });

    it('captures original error message', () => {
      const originalError = new Error('Connection timeout');
      const error = createExternalServiceError('API', undefined, originalError);

      expect(error.details.originalError).toBe('Connection timeout');
    });
  });

  describe('createDatabaseError', () => {
    it('creates database error', () => {
      const error = createDatabaseError('query', 'Query failed', { table: 'users' });

      expect(error.code).toBe('DATABASE_ERROR');
      expect(error.message).toBe('Query failed');
      expect(error.details.operation).toBe('query');
      expect(error.details.table).toBe('users');
    });
  });

  describe('createPQLError', () => {
    it('creates PQL error', () => {
      const error = createPQLError(
        'SELECT * FROM events',
        'Syntax error at position 10',
        { position: 10, line: 1, column: 10 }
      );

      expect(error.code).toBe('INVALID_INPUT');
      expect(error.message).toBe('PQL Error: Syntax error at position 10');
      expect(error.details.query).toBe('SELECT * FROM events');
      expect(error.details.position).toBe(10);
    });
  });
});

describe('Type Guards', () => {
  describe('isAppError', () => {
    it('returns true for valid app errors', () => {
      const error = createNotFoundError('User', '123');
      expect(isAppError(error)).toBe(true);
    });

    it('returns true for error-like objects', () => {
      expect(isAppError({ code: 'ENTITY_NOT_FOUND', message: 'Not found' })).toBe(true);
    });

    it('returns false for non-errors', () => {
      expect(isAppError(null)).toBe(false);
      expect(isAppError(undefined)).toBe(false);
      expect(isAppError('error')).toBe(false);
      expect(isAppError({ code: 123 })).toBe(false);
      expect(isAppError({ message: 'error' })).toBe(false);
    });
  });

  describe('isValidationError', () => {
    it('returns true for validation errors', () => {
      const error = createValidationError([{ field: 'name', message: 'Required' }]);
      expect(isValidationError(error)).toBe(true);
    });

    it('returns false for other errors', () => {
      const error = createNotFoundError('User');
      expect(isValidationError(error)).toBe(false);
    });
  });

  describe('isNotFoundError', () => {
    it('returns true for not found errors', () => {
      const error = createNotFoundError('User');
      expect(isNotFoundError(error)).toBe(true);
    });

    it('returns false for other errors', () => {
      const error = createValidationError([]);
      expect(isNotFoundError(error)).toBe(false);
    });
  });

  describe('isUnauthorizedError', () => {
    it('returns true for unauthorized errors', () => {
      const error = createUnauthorizedError();
      expect(isUnauthorizedError(error)).toBe(true);
    });

    it('returns false for other errors', () => {
      const error = createForbiddenError();
      expect(isUnauthorizedError(error)).toBe(false);
    });
  });

  describe('isForbiddenError', () => {
    it('returns true for forbidden errors', () => {
      const error = createForbiddenError();
      expect(isForbiddenError(error)).toBe(true);
    });

    it('returns false for other errors', () => {
      const error = createUnauthorizedError();
      expect(isForbiddenError(error)).toBe(false);
    });
  });
});
