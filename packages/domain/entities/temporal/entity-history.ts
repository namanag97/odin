/**
 * EntityHistory Entity - Temporal Layer
 * 
 * Versioned snapshots of entity state for time-travel queries.
 */

import type { 
  UUID, 
  TenantId, 
  UserId, 
  ISODateTime 
} from '@odin/core-contracts';

import type { FieldChange } from './audit-log';

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
  readonly id: UUID;
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
