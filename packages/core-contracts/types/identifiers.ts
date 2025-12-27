/**
 * Branded Identifier Types
 * L0 Core Contract - Type-safe identifiers that prevent mixing different ID types
 */

// ============================================================================
// Brand Symbol
// ============================================================================

declare const __brand: unique symbol;
type Brand<T, TBrand extends string> = T & { readonly [__brand]: TBrand };

/** Generic UUID type */
export type UUID = Brand<string, 'UUID'>;

// ============================================================================
// Core Identifiers
// ============================================================================

/** Tenant identifier */
export type TenantId = Brand<UUID, 'TenantId'>;

/** User identifier */
export type UserId = Brand<UUID, 'UserId'>;

/** Organization identifier */
export type OrganizationId = Brand<UUID, 'OrganizationId'>;

/** Session identifier */
export type SessionId = Brand<UUID, 'SessionId'>;

// ============================================================================
// Data Domain Identifiers
// ============================================================================

/** Data pool identifier */
export type DataPoolId = Brand<UUID, 'DataPoolId'>;

/** @deprecated Use DataPoolId */
export type PoolId = DataPoolId;

/** Data model identifier */
export type DataModelId = Brand<UUID, 'DataModelId'>;

/** Event log identifier */
export type EventLogId = Brand<UUID, 'EventLogId'>;

/** Data connection identifier */
export type ConnectionId = Brand<UUID, 'ConnectionId'>;

/** Import job identifier */
export type JobId = Brand<UUID, 'JobId'>;

// ============================================================================
// Process Mining Identifiers
// ============================================================================

/** Process model identifier */
export type ProcessModelId = Brand<UUID, 'ProcessModelId'>;

/** @deprecated Use ProcessModelId */
export type ModelId = ProcessModelId;

/** Case identifier */
export type CaseId = Brand<string, 'CaseId'>;

/** Activity identifier */
export type ActivityId = Brand<string, 'ActivityId'>;

// ============================================================================
// OCEL-Specific Identifiers
// ============================================================================

/** Object type identifier (OCEL) */
export type ObjectTypeId = Brand<string, 'ObjectTypeId'>;

/** Object identifier (OCEL) */
export type ObjectId = Brand<string, 'ObjectId'>;

/** Event identifier (OCEL) */
export type EventId = Brand<string, 'EventId'>;

/** Variant identifier (process variant hash) */
export type VariantId = Brand<string, 'VariantId'>;

// ============================================================================
// Automation Identifiers
// ============================================================================

/** Workflow identifier */
export type WorkflowId = Brand<UUID, 'WorkflowId'>;

/** Action flow identifier */
export type ActionFlowId = Brand<UUID, 'ActionFlowId'>;

// ============================================================================
// Studio Identifiers
// ============================================================================

/** Dashboard identifier */
export type DashboardId = Brand<UUID, 'DashboardId'>;

/** View identifier */
export type ViewId = Brand<UUID, 'ViewId'>;

/** Component identifier */
export type ComponentId = Brand<UUID, 'ComponentId'>;

/** Package identifier */
export type PackageId = Brand<UUID, 'PackageId'>;

/** Space identifier */
export type SpaceId = Brand<UUID, 'SpaceId'>;

// ============================================================================
// Factory Functions
// ============================================================================

/** Create a TenantId from a string */
export const asTenantId = (id: string): TenantId => id as TenantId;

/** Create a UserId from a string */
export const asUserId = (id: string): UserId => id as UserId;

/** Create a SessionId from a string */
export const asSessionId = (id: string): SessionId => id as SessionId;

/** Create a PoolId from a string */
export const asPoolId = (id: string): PoolId => id as PoolId;

/** Create an EventLogId from a string */
export const asEventLogId = (id: string): EventLogId => id as EventLogId;

/** Create a ConnectionId from a string */
export const asConnectionId = (id: string): ConnectionId => id as ConnectionId;

/** Create a JobId from a string */
export const asJobId = (id: string): JobId => id as JobId;

/** Create a ModelId from a string */
export const asModelId = (id: string): ModelId => id as ModelId;

/** Create a CaseId from a string */
export const asCaseId = (id: string): CaseId => id as CaseId;

/** Create an ActivityId from a string */
export const asActivityId = (id: string): ActivityId => id as ActivityId;

/** Create a VariantId from a string */
export const asVariantId = (id: string): VariantId => id as VariantId;

/** Create a WorkflowId from a string */
export const asWorkflowId = (id: string): WorkflowId => id as WorkflowId;

/** Create an ActionFlowId from a string */
export const asActionFlowId = (id: string): ActionFlowId => id as ActionFlowId;

/** Create a DashboardId from a string */
export const asDashboardId = (id: string): DashboardId => id as DashboardId;

/** Create a ViewId from a string */
export const asViewId = (id: string): ViewId => id as ViewId;

/** Create a ComponentId from a string */
export const asComponentId = (id: string): ComponentId => id as ComponentId;

/** Create an OrganizationId from a string */
export const asOrganizationId = (id: string): OrganizationId => id as OrganizationId;

/** Create a DataPoolId from a string */
export const asDataPoolId = (id: string): DataPoolId => id as DataPoolId;

/** Create a DataModelId from a string */
export const asDataModelId = (id: string): DataModelId => id as DataModelId;

/** Create a ProcessModelId from a string */
export const asProcessModelId = (id: string): ProcessModelId => id as ProcessModelId;

/** Create an ObjectTypeId from a string */
export const asObjectTypeId = (id: string): ObjectTypeId => id as ObjectTypeId;

/** Create an ObjectId from a string */
export const asObjectId = (id: string): ObjectId => id as ObjectId;

/** Create an EventId from a string */
export const asEventId = (id: string): EventId => id as EventId;

/** Create a PackageId from a string */
export const asPackageId = (id: string): PackageId => id as PackageId;

/** Create a SpaceId from a string */
export const asSpaceId = (id: string): SpaceId => id as SpaceId;

// ============================================================================
// Type Guards
// ============================================================================

/** Check if a value is a valid ID (non-empty string) */
export const isValidId = (value: unknown): value is string => {
  return typeof value === 'string' && value.length > 0;
};

/** Check if a value is a UUID format */
export const isUUID = (value: unknown): value is string => {
  if (typeof value !== 'string') return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
};
