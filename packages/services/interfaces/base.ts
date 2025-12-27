import type { AsyncResult, AppError, AuthContext, Duration, TenantId, UserId } from "@odin/core-contracts";

/**
 * Base service interface with context injection.
 * All services receive context for auth, tracing, and feature flags.
 */
export interface IService {
  readonly name: string;
}

/**
 * Context passed to all service operations.
 * Extends AuthContext to include user identity and permissions.
 */
export interface OperationContext {
  readonly tenantId: TenantId;
  readonly userId: UserId;
  readonly roles?: readonly string[];
  readonly permissions?: readonly string[];
  readonly sessionId?: string;
  readonly email?: string;
  readonly idempotencyKey?: string;
  readonly timeout?: Duration;
}

/**
 * Result metadata for service operations.
 */
export interface ResultMetadata {
  readonly duration: Duration;
  readonly cached: boolean;
  readonly deprecationWarning?: string;
}

/**
 * Result wrapper for service operations with metadata.
 */
export interface ServiceResult<T> {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: AppError;
  readonly metadata?: ResultMetadata;
}

/**
 * Standard service method signature.
 */
export type ServiceMethod<TInput, TOutput> = (
  input: TInput,
  ctx: OperationContext
) => AsyncResult<TOutput>;
