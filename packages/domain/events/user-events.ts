/**
 * User Domain Events
 * 
 * Events emitted when user state changes.
 */

import type { 
  UserId, 
  UUID,
  Email,
  Event
} from '@odin/core-contracts';

import type { AuthMethod } from '../entities/identity/user';
import type { RoleId } from '../entities/identity/role';
import type { MfaType } from '../entities/identity/mfa-device';

// ============================================================================
// Event Payloads
// ============================================================================

/**
 * Payload for UserCreatedEvent
 */
export interface UserCreatedPayload {
  readonly userId: UserId;
  readonly email: Email;
  readonly authMethod: AuthMethod;
}

/**
 * Payload for UserAuthenticatedEvent
 */
export interface UserAuthenticatedPayload {
  readonly userId: UserId;
  readonly sessionId: UUID;
  readonly method: AuthMethod;
  readonly ipAddress: string;
}

/**
 * Payload for UserPasswordChangedEvent
 */
export interface UserPasswordChangedPayload {
  readonly userId: UserId;
  readonly changedBy: UserId;
}

/**
 * Payload for RoleAssignedEvent
 */
export interface RoleAssignedPayload {
  readonly userId: UserId;
  readonly roleId: RoleId;
  readonly assignedBy: UserId;
}

/**
 * Payload for RoleRevokedEvent
 */
export interface RoleRevokedPayload {
  readonly userId: UserId;
  readonly roleId: RoleId;
  readonly revokedBy: UserId;
}

/**
 * Payload for MfaEnabledEvent
 */
export interface MfaEnabledPayload {
  readonly userId: UserId;
  readonly deviceType: MfaType;
}

/**
 * Payload for MfaDisabledEvent
 */
export interface MfaDisabledPayload {
  readonly userId: UserId;
  readonly reason: string;
}

// ============================================================================
// Event Types
// ============================================================================

/** Event emitted when a user is created */
export type UserCreatedEvent = Event<UserCreatedPayload>;

/** Event emitted when a user authenticates */
export type UserAuthenticatedEvent = Event<UserAuthenticatedPayload>;

/** Event emitted when a user's password changes */
export type UserPasswordChangedEvent = Event<UserPasswordChangedPayload>;

/** Event emitted when a role is assigned to a user */
export type RoleAssignedEvent = Event<RoleAssignedPayload>;

/** Event emitted when a role is revoked from a user */
export type RoleRevokedEvent = Event<RoleRevokedPayload>;

/** Event emitted when MFA is enabled for a user */
export type MfaEnabledEvent = Event<MfaEnabledPayload>;

/** Event emitted when MFA is disabled for a user */
export type MfaDisabledEvent = Event<MfaDisabledPayload>;

// ============================================================================
// Event Type Constants
// ============================================================================

export const UserEventTypes = {
  CREATED: 'user.created',
  UPDATED: 'user.updated',
  AUTHENTICATED: 'user.authenticated',
  PASSWORD_CHANGED: 'user.password_changed',
  EMAIL_VERIFIED: 'user.email_verified',
  SUSPENDED: 'user.suspended',
  DELETED: 'user.deleted',
  ROLE_ASSIGNED: 'user.role_assigned',
  ROLE_REVOKED: 'user.role_revoked',
  MFA_ENABLED: 'user.mfa_enabled',
  MFA_DISABLED: 'user.mfa_disabled',
} as const;
