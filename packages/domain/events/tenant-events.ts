/**
 * Tenant Domain Events
 * 
 * Events emitted when tenant state changes.
 */

import type { 
  TenantId, 
  UserId,
  Event
} from '@odin/core-contracts';

import type { TenantTier } from '../entities/existence/tenant';

// ============================================================================
// Event Payloads
// ============================================================================

/**
 * Payload for TenantCreatedEvent
 */
export interface TenantCreatedPayload {
  readonly tenantId: TenantId;
  readonly slug: string;
  readonly tier: TenantTier;
}

/**
 * Payload for TenantSuspendedEvent
 */
export interface TenantSuspendedPayload {
  readonly tenantId: TenantId;
  readonly reason: string;
  readonly suspendedBy: UserId;
}

/**
 * Payload for TenantTierChangedEvent
 */
export interface TenantTierChangedPayload {
  readonly tenantId: TenantId;
  readonly previousTier: TenantTier;
  readonly newTier: TenantTier;
}

/**
 * Payload for TenantDeletedEvent
 */
export interface TenantDeletedPayload {
  readonly tenantId: TenantId;
  readonly deletedBy: UserId;
  readonly hardDelete: boolean;
}

// ============================================================================
// Event Types
// ============================================================================

/** Event emitted when a tenant is created */
export type TenantCreatedEvent = Event<TenantCreatedPayload>;

/** Event emitted when a tenant is suspended */
export type TenantSuspendedEvent = Event<TenantSuspendedPayload>;

/** Event emitted when a tenant's tier changes */
export type TenantTierChangedEvent = Event<TenantTierChangedPayload>;

/** Event emitted when a tenant is deleted */
export type TenantDeletedEvent = Event<TenantDeletedPayload>;

// ============================================================================
// Event Type Constants
// ============================================================================

export const TenantEventTypes = {
  CREATED: 'tenant.created',
  UPDATED: 'tenant.updated',
  SUSPENDED: 'tenant.suspended',
  REACTIVATED: 'tenant.reactivated',
  TIER_CHANGED: 'tenant.tier_changed',
  DELETED: 'tenant.deleted',
} as const;
