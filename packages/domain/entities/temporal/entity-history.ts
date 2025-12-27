/**
 * EntityHistory Entity - Temporal Layer
 * 
 * Versioned snapshots of entity state for time-travel queries.
 */

import type { 
  UUID, 
  TenantId, 
  UserId, 
  ISODateTime,
  Brand,
} from '@odin/core-contracts';

import type { FieldChange } from './audit-log';

// ============================================================================
// Branded IDs
// ============================================================================

/** Branded EntityHistory ID */
export type EntityHistoryId = Brand<UUID, 'EntityHistoryId'>;

/** Cast function for EntityHistoryId */
export const asEntityHistoryId = (id: string): EntityHistoryId => id as unknown as EntityHistoryId;

// ============================================================================
// Operation Types
// ============================================================================

/** Type of history operation */
export type HistoryOperation = 'create' | 'update' | 'delete' | 'restore';

// ============================================================================
// Entity
// ============================================================================

/**
 * EntityHistory - Versioned snapshot of entity state
 * 
 * Enables point-in-time queries and change tracking.
 * @template T - The type of the entity snapshot
 */
export interface EntityHistory<T = unknown> {
  readonly id: EntityHistoryId;
  readonly tenantId: TenantId;
  /** Type of entity (e.g., 'data_pool', 'user') */
  readonly entityType: string;
  /** ID of the versioned entity */
  readonly entityId: UUID;
  /** Version number (increments with each change) */
  readonly version: number;
  readonly operation: HistoryOperation;
  /** Complete snapshot of entity at this version */
  readonly snapshot: T;
  /** Field-level changes from previous version */
  readonly changes: readonly FieldChange[];
  readonly changedBy: UserId;
  readonly changedAt: ISODateTime;
  /** Optional reason for the change */
  readonly reason?: string;
}

// ============================================================================
// Comparison
// ============================================================================

/**
 * Difference between two entity versions
 */
export interface EntityDiff {
  readonly entityType: string;
  readonly entityId: UUID;
  readonly fromVersion: number;
  readonly toVersion: number;
  readonly changes: readonly FieldChange[];
}

// ============================================================================
// DTOs
// ============================================================================

/**
 * Data required to create an entity history record
 */
export interface CreateEntityHistoryData<T = unknown> {
  readonly tenantId: TenantId;
  readonly entityType: string;
  readonly entityId: UUID;
  readonly operation: HistoryOperation;
  readonly snapshot: T;
  readonly changes: readonly FieldChange[];
  readonly changedBy: UserId;
  readonly reason?: string;
}

/**
 * Data for updating an entity history record (typically histories are immutable)
 */
export interface UpdateEntityHistoryData {
  readonly reason?: string;
}

