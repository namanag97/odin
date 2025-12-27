/**
 * Role Domain Events
 * 
 * Events emitted when role/permission state changes.
 */

import type { 
  TenantId, 
  UserId,
  Event
} from '@odin/core-contracts';

import type { RoleId, PermissionId } from '../entities/identity/role';

// ============================================================================
// Event Payloads
// ============================================================================

/**
 * Payload for RoleCreatedEvent
 */
export interface RoleCreatedPayload {
  readonly roleId: RoleId;
  readonly tenantId: TenantId;
  readonly name: string;
  readonly createdBy: UserId;
}

/**
 * Payload for RoleUpdatedEvent
 */
export interface RoleUpdatedPayload {
  readonly roleId: RoleId;
  readonly changes: {
    readonly name?: string;
    readonly description?: string;
  };
  readonly updatedBy: UserId;
}

/**
 * Payload for RoleDeletedEvent
 */
export interface RoleDeletedPayload {
  readonly roleId: RoleId;
  readonly deletedBy: UserId;
}

/**
 * Payload for PermissionAddedEvent
 */
export interface PermissionAddedPayload {
  readonly roleId: RoleId;
  readonly permissionId: PermissionId;
  readonly addedBy: UserId;
}

/**
 * Payload for PermissionRemovedEvent
 */
export interface PermissionRemovedPayload {
  readonly roleId: RoleId;
  readonly permissionId: PermissionId;
  readonly removedBy: UserId;
}

// ============================================================================
// Event Types
// ============================================================================

/** Event emitted when a role is created */
export type RoleCreatedEvent = Event<RoleCreatedPayload>;

/** Event emitted when a role is updated */
export type RoleUpdatedEvent = Event<RoleUpdatedPayload>;

/** Event emitted when a role is deleted */
export type RoleDeletedEvent = Event<RoleDeletedPayload>;

/** Event emitted when a permission is added to a role */
export type PermissionAddedEvent = Event<PermissionAddedPayload>;

/** Event emitted when a permission is removed from a role */
export type PermissionRemovedEvent = Event<PermissionRemovedPayload>;

// ============================================================================
// Event Type Constants
// ============================================================================

export const RoleEventTypes = {
  CREATED: 'role.created',
  UPDATED: 'role.updated',
  DELETED: 'role.deleted',
  PERMISSION_ADDED: 'role.permission_added',
  PERMISSION_REMOVED: 'role.permission_removed',
} as const;
