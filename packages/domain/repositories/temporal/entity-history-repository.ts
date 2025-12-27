/**
 * EntityHistory Repository Interface - Temporal Layer
 * 
 * Data access contract for EntityHistory entities.
 * Enables time-travel queries and version comparison.
 */

import type { 
  UUID, 
  UserId, 
  ISODateTime,
  AsyncResult,
  PageRequest,
  PageResponse,
  ServiceContext
} from '@odin/core-contracts';

import type { 
  EntityHistory,
  EntityDiff,
  HistoryOperation
} from '../../entities/temporal/entity-history';

import type { FieldChange } from '../../entities/temporal/audit-log';

// ============================================================================
// Repository Interface
// ============================================================================

/**
 * IEntityHistoryRepository - Entity history data access contract
 * 
 * Provides version tracking and time-travel capabilities.
 */
export interface IEntityHistoryRepository {
  // -------------------------------------------------------------------------
  // Recording
  // -------------------------------------------------------------------------
  
  /**
   * Record a new version of an entity
   */
  record<T>(
    entityType: string,
    entityId: UUID,
    operation: HistoryOperation,
    snapshot: T,
    changes: readonly FieldChange[],
    context: ServiceContext
  ): AsyncResult<EntityHistory<T>>;

  // -------------------------------------------------------------------------
  // Queries
  // -------------------------------------------------------------------------
  
  /**
   * Get complete history for an entity
   */
  getHistory<T>(
    entityType: string,
    entityId: UUID,
    options?: PageRequest
  ): AsyncResult<PageResponse<EntityHistory<T>>>;
  
  /**
   * Get a specific version of an entity
   */
  getVersion<T>(
    entityType: string,
    entityId: UUID,
    version: number
  ): AsyncResult<EntityHistory<T> | null>;
  
  /**
   * Get entity state at a specific point in time
   */
  getAtPoint<T>(
    entityType: string,
    entityId: UUID,
    timestamp: ISODateTime
  ): AsyncResult<EntityHistory<T> | null>;

  // -------------------------------------------------------------------------
  // Comparison
  // -------------------------------------------------------------------------
  
  /**
   * Compare two versions of an entity
   */
  compare<T>(
    entityType: string,
    entityId: UUID,
    versionA: number,
    versionB: number
  ): AsyncResult<EntityDiff>;

  // -------------------------------------------------------------------------
  // Utilities
  // -------------------------------------------------------------------------
  
  /**
   * Get the current version number for an entity
   */
  getCurrentVersion(
    entityType: string,
    entityId: UUID
  ): AsyncResult<number>;
  
  /**
   * Get changes made by a specific user
   */
  getChangesByUser(
    userId: UserId,
    options?: PageRequest
  ): AsyncResult<PageResponse<EntityHistory<unknown>>>;
}
