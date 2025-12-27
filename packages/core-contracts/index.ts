/**
 * Core Contracts - L0 Shared Foundation
 * 
 * This package contains all shared types, interfaces, and contracts
 * used across all layers of the application. It has:
 * - Zero business logic
 * - Zero runtime dependencies
 * - Stable, rarely-changing APIs
 */

// ============================================================================
// Types
// ============================================================================

export {
  // Result types
  type Result,
  type Success,
  type Failure,
  type Option,
  type Some,
  type None,
  type AsyncResult,
  type AsyncOption,
} from './types/result';

export {
  // Pagination
  type SortDirection,
  type PageRequest,
  type FilteredPageRequest,
  type PageResponse,
  type CursorPageRequest,
  type CursorPageResponse,
  DEFAULT_PAGE,
  DEFAULT_LIMIT,
  MAX_LIMIT,
  DEFAULT_SORT_DIR,
} from './types/pagination';

export {
  // Identifiers
  type UUID,
  type TenantId,
  type UserId,
  type OrganizationId,
  type SessionId,
  type DataPoolId,
  type PoolId,
  type DataModelId,
  type EventLogId,
  type ConnectionId,
  type JobId,
  type ProcessModelId,
  type ModelId,
  type CaseId,
  type ActivityId,
  // OCEL IDs
  type ObjectTypeId,
  type ObjectId,
  type EventId,
  type VariantId,
  // Automation IDs
  type WorkflowId,
  type ActionFlowId,
  // Studio IDs
  type DashboardId,
  type ViewId,
  type ComponentId,
  type PackageId,
  type SpaceId,
  // Factory functions
  asTenantId,
  asUserId,
  asSessionId,
  asPoolId,
  asEventLogId,
  asConnectionId,
  asJobId,
  asModelId,
  asCaseId,
  asActivityId,
  asVariantId,
  asWorkflowId,
  asActionFlowId,
  asDashboardId,
  asViewId,
  asComponentId,
  asOrganizationId,
  asDataPoolId,
  asDataModelId,
  asProcessModelId,
  asObjectTypeId,
  asObjectId,
  asEventId,
  asPackageId,
  asSpaceId,
  isValidId,
  isUUID,
} from './types/identifiers';

export {
  // Branded temporal types
  type ISODateTime,
  type UnixTimestamp,
  type Duration,
  // Tracing types
  type TraceId,
  type CorrelationId,
  // Semantic types
  type Email,
  type URL,
  type JSONString,
  type Percentage,
  type PositiveInt,
  type NonNegativeInt,
  // Legacy alias
  type Timestamp,
  // Common types
  type PositionConfig,
  type Metadata,
  type JsonValue,
  Environment,
  JobStatus,
  EntityStatus,
  type Auditable,
  type SoftDeletable,
  type TenantScoped,
  type BaseEntity,
  type TenantEntity,
  type PartialBy,
  type RequiredBy,
  type StringKeys,
  type DeepPartial,
  type NonNullableFields,
} from './types/common';

export {
  // Query types
  FilterOperator,
  type Filter,
  type FilterGroup,
  type SortConfig,
  type DateRange,
  type QueryOptions,
  isFilterOperator,
  isFilter,
  isDateRange,
  eq,
  contains,
  between,
  inArray,
} from './types/query';

// ============================================================================
// Enums
// ============================================================================

export {
  // Data types
  DataType,
  ConnectionType,
  ConnectionStatus,
  LoadStatus,
  LoadType,
  DataModelType,
  KMType,
  // Automation
  ActionFlowStatus,
  TriggerType,
  ExecutionStatus,
  TaskStatus,
  SignalStatus,
  // Studio
  LayoutType,
  ComponentType,
  // Process Mining (PM4Py aligned)
  type DiscoveryAlgorithm,
  type ConformanceMethod,
  type ProcessModelType,
  type MetricType,
  type PublishStatus,
  // Utilities
  isEnumValue,
} from './enums';

// ============================================================================
// Errors
// ============================================================================

export {
  type ErrorCode,
  ErrorCodeToHttpStatus,
  type AppError,
  type SerializedError,
  serializeError,
  getHttpStatus,
} from './errors/base';

export {
  type ValidationErrorDetail,
  type ValidationError,
  type NotFoundError,
  type UnauthorizedError,
  type ForbiddenError,
  type ConflictError,
  type InternalError,
  type BadRequestError,
  type RateLimitedError,
  type ExternalServiceError,
  type DatabaseError,
  type PQLError,
  createValidationError,
  createNotFoundError,
  createUnauthorizedError,
  createForbiddenError,
  createConflictError,
  createInternalError,
  createBadRequestError,
  createRateLimitedError,
  createExternalServiceError,
  createDatabaseError,
  createPQLError,
  isAppError,
  isValidationError,
  isNotFoundError,
  isUnauthorizedError,
  isForbiddenError,
} from './errors/types';

// ============================================================================
// Auth
// ============================================================================

export {
  type AuthContext,
  type ServiceContext,
  type RequestContext,
  isAuthContext,
  isServiceContext,
  createAnonymousContext,
  createSystemContext,
  createServiceContext,
} from './auth/context';

export {
  DataPermissions,
  MiningPermissions,
  StudioPermissions,
  AutomationPermissions,
  AdminPermissions,
  Permissions,
  type Permission,
  hasPermission,
  hasAllPermissions,
  hasAnyPermission,
} from './auth/permissions';

export {
  SystemRole,
  RoleScope,
  RoleType,
  type RoleDefinition,
  SystemRolePermissions,
  isSystemRole,
  getSystemRolePermissions,
  resolveRolePermissions,
} from './auth/roles';

// ============================================================================
// Contracts
// ============================================================================

export {
  type LogLevel,
  LogLevelPriority,
  type LogContext,
  type Logger,
  type LogEntry,
  type LogTransport,
} from './contracts/logger';

export {
  type FileMetadata,
  type UploadOptions,
  type DownloadOptions,
  type ListOptions,
  type ListResult,
  type SignedUrlOptions,
  type Storage,
  buildTenantPath,
  buildUserPath,
} from './contracts/storage';

export {
  type CacheSetOptions,
  type CacheGetOptions,
  type Cache,
  buildCacheKey,
  buildTenantCacheKey,
  CacheTags,
} from './contracts/cache';

export {
  type BaseEvent,
  type Event,
  type EventHandler,
  type SubscribeOptions,
  type Subscription,
  type PublishOptions,
  type EventBus,
  createEvent,
  EventTypes,
} from './contracts/events';

export {
  type IdGenerator,
  type IdGeneratorOptions,
  UUID_PATTERN,
  ULID_PATTERN,
  isValidUUID,
  isValidULID,
} from './contracts/id-generator';

export {
  type DateTimeFormat,
  type DateTimeProvider,
  DurationMs,
  seconds,
  minutes,
  hours,
  days,
  weeks,
} from './contracts/datetime';

