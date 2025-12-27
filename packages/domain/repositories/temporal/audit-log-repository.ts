/**
 * AuditLog Repository Interface - Temporal Layer
 * 
 * Data access contract for AuditLog entities.
 * Write-only, append-only design for immutable audit trails.
 */

import type { 
  UUID, 
  TenantId, 
  UserId, 
  ISODateTime,
  AsyncResult,
  PageRequest,
  PageResponse,
  DateRange
} from '@odin/core-contracts';

import type { 
  AuditLog,
  AuditCategory,
  AuditOutcome,
  ActorType,
  ResourceType,
  CreateAuditLogData
} from '../../entities/temporal/audit-log';

// ============================================================================
// Search Criteria
// ============================================================================

/**
 * Criteria for searching audit logs
 */
export interface AuditSearchCriteria {
  readonly actorId?: UserId;
  readonly actorType?: ActorType;
  readonly actionType?: string;
  readonly category?: AuditCategory;
  readonly resourceType?: ResourceType;
  readonly resourceId?: UUID;
  readonly outcome?: AuditOutcome;
  readonly dateRange?: DateRange;
  readonly ipAddress?: string;
  readonly searchText?: string;
}

// ============================================================================
// Aggregations
// ============================================================================

/**
 * Activity by a specific actor
 */
export interface ActorActivity {
  readonly actorId: UserId | UUID | null;
  readonly actorType: ActorType;
  readonly actionCount: number;
  readonly lastAction: ISODateTime;
}

/**
 * Activity on a specific resource
 */
export interface ResourceActivity {
  readonly resourceId: UUID;
  readonly resourceType: ResourceType;
  readonly actionCount: number;
  readonly lastAction: ISODateTime;
}

/**
 * Summary of activity in a time period
 */
export interface ActivitySummary {
  readonly totalActions: number;
  readonly byCategory: Record<AuditCategory, number>;
  readonly byOutcome: Record<AuditOutcome, number>;
  readonly topActors: readonly ActorActivity[];
  readonly topResources: readonly ResourceActivity[];
}

// ============================================================================
// Repository Interface
// ============================================================================

/**
 * IAuditLogRepository - Audit log data access contract
 * 
 * Append-only repository for immutable audit records.
 */
export interface IAuditLogRepository {
  // -------------------------------------------------------------------------
  // Write Operations (Append-Only)
  // -------------------------------------------------------------------------
  
  /**
   * Create a new audit log entry
   */
  create(data: CreateAuditLogData): AsyncResult<AuditLog>;
  
  /**
   * Create multiple audit log entries in batch
   */
  createBatch(logs: readonly CreateAuditLogData[]): AsyncResult<readonly AuditLog[]>;

  // -------------------------------------------------------------------------
  // Queries
  // -------------------------------------------------------------------------
  
  /**
   * Find an audit log by ID
   */
  findById(id: UUID): AsyncResult<AuditLog | null>;
  
  /**
   * Search audit logs with criteria
   */
  search(
    tenantId: TenantId,
    criteria: AuditSearchCriteria,
    options?: PageRequest
  ): AsyncResult<PageResponse<AuditLog>>;
  
  /**
   * Get audit logs for a specific resource
   */
  getByResource(
    resourceType: ResourceType,
    resourceId: UUID,
    options?: PageRequest
  ): AsyncResult<PageResponse<AuditLog>>;
  
  /**
   * Get audit logs by actor
   */
  getByActor(
    tenantId: TenantId,
    actorId: UserId,
    dateRange?: DateRange,
    options?: PageRequest
  ): AsyncResult<PageResponse<AuditLog>>;

  // -------------------------------------------------------------------------
  // Aggregations
  // -------------------------------------------------------------------------
  
  /**
   * Get activity summary for a time period
   */
  getActivitySummary(
    tenantId: TenantId,
    dateRange: DateRange
  ): AsyncResult<ActivitySummary>;

  // -------------------------------------------------------------------------
  // Retention
  // -------------------------------------------------------------------------
  
  /**
   * Delete audit logs older than cutoff date
   */
  deleteOlderThan(tenantId: TenantId, cutoffDate: ISODateTime): AsyncResult<number>;
  
  /**
   * Archive audit logs to external storage
   */
  archiveToStorage(tenantId: TenantId, cutoffDate: ISODateTime): AsyncResult<string>;
}
