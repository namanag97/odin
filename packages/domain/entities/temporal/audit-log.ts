/**
 * AuditLog Entity - Temporal Layer
 * 
 * Immutable record of all significant system actions.
 */

import type { 
  UUID, 
  TenantId, 
  UserId, 
  ISODateTime,
  TraceId,
  Duration,
  Email
} from '@odin/core-contracts';

// ============================================================================
// Actor Types
// ============================================================================

/** Type of actor that performed the action */
export type ActorType = 'user' | 'api_key' | 'system' | 'webhook' | 'scheduler';

/**
 * Information about who performed the audited action
 */
export interface AuditActor {
  readonly type: ActorType;
  /** ID of the actor (null for system) */
  readonly id: UserId | UUID | null;
  readonly email?: Email;
  readonly name?: string;
  readonly ipAddress?: string;
  readonly userAgent?: string;
  /** If action was performed while impersonating another user */
  readonly impersonatedBy?: UserId;
}

// ============================================================================
// Action Types
// ============================================================================

/** Categories for audit actions */
export type AuditCategory = 
  | 'authentication' 
  | 'authorization' 
  | 'data_access'
  | 'data_modification' 
  | 'configuration' 
  | 'integration'
  | 'export' 
  | 'admin' 
  | 'security';

/**
 * Description of the audited action
 */
export interface AuditAction {
  /** Action type identifier (e.g., 'data_pool.create') */
  readonly type: string;
  readonly category: AuditCategory;
  readonly description: string;
}

// ============================================================================
// Resource Types
// ============================================================================

/** Type of resource affected by the action */
export type ResourceType = 
  | 'tenant' 
  | 'user' 
  | 'role'
  | 'data_pool' 
  | 'data_model' 
  | 'view'
  | 'action_flow' 
  | 'integration' 
  | 'webhook'
  | 'api_key' 
  | 'subscription' 
  | 'settings';

/**
 * Information about the resource affected by the action
 */
export interface AuditResource {
  readonly type: ResourceType;
  readonly id: UUID;
  readonly name?: string;
  readonly parentId?: UUID;
  readonly parentType?: ResourceType;
}

// ============================================================================
// Outcome & Changes
// ============================================================================

/** Outcome of the audited action */
export type AuditOutcome = 'success' | 'failure' | 'partial';

/**
 * Single field change record
 */
export interface FieldChange {
  readonly field: string;
  readonly previousValue: unknown;
  readonly newValue: unknown;
}

/**
 * Changes made during the audited action
 */
export interface AuditChanges {
  readonly before?: Record<string, unknown>;
  readonly after?: Record<string, unknown>;
  readonly diff?: readonly FieldChange[];
}

// ============================================================================
// Request Context
// ============================================================================

/**
 * Request context for the audited action
 */
export interface AuditRequest {
  readonly id: TraceId;
  readonly method?: string;
  readonly path?: string;
  readonly duration?: Duration;
}

// ============================================================================
// Entity
// ============================================================================

/**
 * AuditLog - Immutable record of system actions
 * 
 * Captures who did what, when, and the outcome.
 */
export interface AuditLog {
  readonly id: UUID;
  readonly tenantId: TenantId;
  readonly timestamp: ISODateTime;
  readonly actor: AuditActor;
  readonly action: AuditAction;
  readonly resource: AuditResource;
  readonly outcome: AuditOutcome;
  readonly changes?: AuditChanges;
  readonly request: AuditRequest;
  readonly metadata?: Record<string, unknown>;
}

// ============================================================================
// DTOs
// ============================================================================

/**
 * Data required to create a new audit log entry
 */
export interface CreateAuditLogData {
  readonly tenantId: TenantId;
  readonly actor: AuditActor;
  readonly action: AuditAction;
  readonly resource: AuditResource;
  readonly outcome: AuditOutcome;
  readonly changes?: AuditChanges;
  readonly request: AuditRequest;
  readonly metadata?: Record<string, unknown>;
}
