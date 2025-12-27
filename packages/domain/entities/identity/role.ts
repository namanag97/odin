/**
 * Role & Permission Entities - Identity Layer
 * 
 * Role-based access control with fine-grained permissions.
 */

import type { 
  TenantId, 
  UUID,
  ISODateTime,
  FilterOperator
} from '@odin/core-contracts';

// ============================================================================
// Branded IDs
// ============================================================================

declare const __brand: unique symbol;
type Brand<T, TBrand extends string> = T & { readonly [__brand]: TBrand };

/** Role identifier */
export type RoleId = Brand<UUID, 'RoleId'>;

/** Permission identifier (string-based) */
export type PermissionId = Brand<string, 'PermissionId'>;

// ============================================================================
// Factory Functions
// ============================================================================

/** Create a RoleId from a string */
export const asRoleId = (id: string): RoleId => id as RoleId;

/** Create a PermissionId from a string */
export const asPermissionId = (id: string): PermissionId => id as PermissionId;

// ============================================================================
// Permission Types
// ============================================================================

/**
 * Resource types that can be protected
 */
export type ResourceType = 
  | 'tenant' | 'organization' | 'user' | 'role'
  | 'data_pool' | 'data_model' | 'event_log'
  | 'knowledge_model' | 'view' | 'package' | 'space'
  | 'action_flow' | 'skill' | 'task'
  | 'api_key' | 'webhook' | 'integration'
  | 'audit_log' | 'settings';

/**
 * Actions that can be performed on resources
 */
export type ActionType = 
  | 'create' | 'read' | 'update' | 'delete'
  | 'execute' | 'publish' | 'share' | 'export'
  | 'manage' | 'admin';

/**
 * Scope of permission application
 */
export type PermissionScope = 
  | 'own'           // Only own resources
  | 'organization'  // Organization resources
  | 'tenant'        // All tenant resources
  | 'global';       // System-wide (super admin)

// ============================================================================
// Permission Condition
// ============================================================================

/**
 * Conditional permission constraint
 */
export interface PermissionCondition {
  readonly field: string;
  readonly operator: FilterOperator;
  readonly value: unknown;
}

// ============================================================================
// Permission Entity
// ============================================================================

/**
 * Permission - Defines access to a resource action
 */
export interface Permission {
  readonly id: PermissionId;
  readonly resource: ResourceType;
  readonly action: ActionType;
  readonly scope: PermissionScope;
  readonly conditions?: PermissionCondition[];
}

// ============================================================================
// Role Entity
// ============================================================================

/**
 * Role - Collection of permissions assigned to users
 */
export interface Role {
  readonly id: RoleId;
  readonly tenantId: TenantId;
  readonly name: string;
  readonly description?: string;
  /** Built-in, non-deletable role */
  readonly isSystem: boolean;
  readonly permissions: readonly Permission[];
  readonly createdAt: ISODateTime;
}

// ============================================================================
// DTOs
// ============================================================================

/**
 * Data required to create a new role
 */
export interface CreateRoleData {
  readonly tenantId: TenantId;
  readonly name: string;
  readonly description?: string;
  readonly permissions?: Permission[];
}

/**
 * Data for updating a role
 */
export interface UpdateRoleData {
  readonly name?: string;
  readonly description?: string;
}
