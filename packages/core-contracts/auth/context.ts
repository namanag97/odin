/**
 * Auth Context
 * L0 Core Contract - Authentication context available across all services
 */

// ============================================================================
// Auth Context
// ============================================================================

/**
 * Authentication context passed to all authenticated requests
 * This is populated by the gateway middleware and passed to services
 */
export interface AuthContext {
  /** Current user's ID */
  userId: string;
  /** Current tenant ID */
  tenantId: string;
  /** Assigned roles */
  roles: string[];
  /** Resolved permissions (from roles) */
  permissions: string[];
  /** Current session ID */
  sessionId?: string;
  /** Token expiry timestamp (Unix ms) */
  tokenExpiry?: number;
  /** User's email (for display/audit) */
  email?: string;
  /** Whether user has MFA enabled */
  mfaEnabled?: boolean;
  /** Additional claims from JWT */
  claims?: Record<string, unknown>;
}

/**
 * Minimal auth context for service-to-service calls
 */
export interface ServiceContext {
  /** Service name making the call */
  serviceName: string;
  /** Tenant ID for the operation */
  tenantId: string;
  /** Correlation ID for tracing */
  correlationId: string;
}

/**
 * Union type for any context
 */
export type RequestContext = AuthContext | ServiceContext;

// ============================================================================
// Type Guards
// ============================================================================

export const isAuthContext = (ctx: RequestContext): ctx is AuthContext => {
  return 'userId' in ctx;
};

export const isServiceContext = (ctx: RequestContext): ctx is ServiceContext => {
  return 'serviceName' in ctx;
};

// ============================================================================
// Context Utilities
// ============================================================================

/**
 * Create an anonymous context (for unauthenticated requests)
 */
export const createAnonymousContext = (tenantId: string): AuthContext => ({
  userId: 'anonymous',
  tenantId,
  roles: [],
  permissions: [],
});

/**
 * Create a system context (for background jobs, migrations, etc.)
 */
export const createSystemContext = (tenantId: string): AuthContext => ({
  userId: 'system',
  tenantId,
  roles: ['system'],
  permissions: ['*'],
});

/**
 * Create a service context for service-to-service calls
 */
export const createServiceContext = (
  serviceName: string,
  tenantId: string,
  correlationId: string
): ServiceContext => ({
  serviceName,
  tenantId,
  correlationId,
});
