import type {
  AsyncResult,
  UUID,
  UserId,
  ISODateTime,
} from "@odin/core-contracts";
import type { IService, OperationContext } from "./base";
import type { PaginatedResult, Pagination, SortConfig, DateRange } from "./common";

/**
 * Audit logging and querying service.
 */
export interface IAuditService extends IService {
  // Logging
  log(input: CreateAuditLogInput, ctx: OperationContext): AsyncResult<void>;
  logBatch(logs: readonly CreateAuditLogInput[], ctx: OperationContext): AsyncResult<void>;

  // Querying
  search(input: AuditSearchInput, ctx: OperationContext): AsyncResult<PaginatedResult<AuditLog>>;
  getByResource(input: ResourceAuditInput, ctx: OperationContext): AsyncResult<PaginatedResult<AuditLog>>;
  getByActor(input: ActorAuditInput, ctx: OperationContext): AsyncResult<PaginatedResult<AuditLog>>;

  // Analytics
  getActivitySummary(input: ActivitySummaryInput, ctx: OperationContext): AsyncResult<ActivitySummary>;
  getSecurityEvents(input: SecurityEventsInput, ctx: OperationContext): AsyncResult<PaginatedResult<AuditLog>>;

  // Export
  exportAuditLogs(input: ExportAuditInput, ctx: OperationContext): AsyncResult<ExportJob>;

  // Retention
  archiveLogs(input: ArchiveLogsInput, ctx: OperationContext): AsyncResult<ArchiveResult>;
}

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

export type AuditExecutionStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

export type ResourceType =
  | 'tenant' | 'user' | 'role' | 'session' | 'api_key'
  | 'data_pool' | 'data_model' | 'process_model'
  | 'subscription' | 'invoice' | 'payment'
  | 'webhook' | 'integration' | 'action_flow' | 'sensor';

export type AuditCategory =
  | 'authentication' | 'authorization' | 'data_access'
  | 'configuration' | 'billing' | 'system';

export type AuditOutcome = 'success' | 'failure' | 'error';

// ═══════════════════════════════════════════════════════════════
// DTOs
// ═══════════════════════════════════════════════════════════════

export interface AuditLog {
  readonly id: UUID;
  readonly tenantId: UUID;
  readonly actorId: UserId;
  readonly action: AuditAction;
  readonly resource: AuditResource;
  readonly outcome: AuditOutcome;
  readonly category: AuditCategory;
  readonly changes?: AuditChanges;
  readonly metadata?: Record<string, unknown>;
  readonly ipAddress?: string;
  readonly userAgent?: string;
  readonly timestamp: ISODateTime;
}

export interface AuditAction {
  readonly type: string;
  readonly description?: string;
}

export interface AuditResource {
  readonly type: ResourceType;
  readonly id: UUID;
  readonly name?: string;
}

export interface AuditChanges {
  readonly before?: Record<string, unknown>;
  readonly after?: Record<string, unknown>;
  readonly fields?: readonly string[];
}

export interface AuditSearchCriteria {
  readonly actorId?: UserId;
  readonly resourceType?: ResourceType;
  readonly resourceId?: UUID;
  readonly category?: AuditCategory;
  readonly outcome?: AuditOutcome;
  readonly dateRange?: DateRange;
  readonly search?: string;
}

export interface CreateAuditLogInput {
  readonly action: AuditAction;
  readonly resource: AuditResource;
  readonly outcome: AuditOutcome;
  readonly changes?: AuditChanges;
  readonly metadata?: Record<string, unknown>;
}

export interface AuditSearchInput {
  readonly criteria: AuditSearchCriteria;
  readonly pagination?: Pagination;
  readonly sort?: SortConfig;
}

export interface ResourceAuditInput {
  readonly resourceType: ResourceType;
  readonly resourceId: UUID;
  readonly dateRange?: DateRange;
  readonly pagination?: Pagination;
}

export interface ActorAuditInput {
  readonly actorId: UserId;
  readonly dateRange?: DateRange;
  readonly categories?: readonly AuditCategory[];
  readonly pagination?: Pagination;
}

export interface ActivitySummaryInput {
  readonly dateRange: DateRange;
  readonly groupBy?: 'category' | 'actor' | 'resource_type' | 'day';
}

export interface ActivitySummary {
  readonly totalActions: number;
  readonly byCategory: Record<string, number>;
  readonly byOutcome: Record<string, number>;
  readonly topActors: readonly { actorId: UserId; count: number }[];
  readonly topResources: readonly { resourceType: string; count: number }[];
  readonly trend: readonly { timestamp: ISODateTime; count: number }[];
}

export interface SecurityEventsInput {
  readonly dateRange: DateRange;
  readonly severity?: 'all' | 'warning' | 'critical';
  readonly pagination?: Pagination;
}

export interface ExportAuditInput {
  readonly criteria: AuditSearchCriteria;
  readonly format: 'csv' | 'json';
  readonly includeChanges: boolean;
}

export interface ExportJob {
  readonly id: UUID;
  readonly status: AuditExecutionStatus;
  readonly fileId?: UUID;
  readonly recordCount?: number;
}

export interface ArchiveLogsInput {
  readonly olderThan: ISODateTime;
  readonly destination: 'cold_storage' | 'delete';
}

export interface ArchiveResult {
  readonly archivedCount: number;
  readonly archiveLocation?: string;
}
