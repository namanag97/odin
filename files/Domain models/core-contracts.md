# L0 CORE CONTRACTS
> Foundation types, errors, and cross-cutting concerns

---

## 1. Result & Error Types

```typescript
// ═══════════════════════════════════════════════════════════════
// RESULT MONAD
// ═══════════════════════════════════════════════════════════════

type Result<T, E = AppError> = 
  | { success: true; data: T }
  | { success: false; error: E };

type AsyncResult<T, E = AppError> = Promise<Result<T, E>>;

// ═══════════════════════════════════════════════════════════════
// ERROR HIERARCHY
// ═══════════════════════════════════════════════════════════════

interface AppError {
  readonly code: ErrorCode;
  readonly message: string;
  readonly details?: Record<string, unknown>;
  readonly timestamp: ISODateTime;
  readonly traceId: TraceId;
  readonly cause?: AppError;
}

type ErrorCode = 
  // Domain Errors (1xxx)
  | 'ENTITY_NOT_FOUND'           // 1001
  | 'ENTITY_ALREADY_EXISTS'      // 1002
  | 'ENTITY_CONFLICT'            // 1003
  | 'INVALID_STATE_TRANSITION'   // 1004
  | 'BUSINESS_RULE_VIOLATION'    // 1005
  | 'INVARIANT_VIOLATION'        // 1006
  // Validation Errors (2xxx)
  | 'VALIDATION_FAILED'          // 2001
  | 'INVALID_INPUT'              // 2002
  | 'MISSING_REQUIRED_FIELD'     // 2003
  | 'INVALID_FORMAT'             // 2004
  | 'VALUE_OUT_OF_RANGE'         // 2005
  // Auth Errors (3xxx)
  | 'UNAUTHENTICATED'            // 3001
  | 'UNAUTHORIZED'               // 3002
  | 'TOKEN_EXPIRED'              // 3003
  | 'INSUFFICIENT_PERMISSIONS'   // 3004
  | 'MFA_REQUIRED'               // 3005
  // Infrastructure Errors (4xxx)
  | 'DATABASE_ERROR'             // 4001
  | 'EXTERNAL_SERVICE_ERROR'     // 4002
  | 'TIMEOUT'                    // 4003
  | 'RATE_LIMITED'               // 4004
  | 'RESOURCE_EXHAUSTED'         // 4005
  // Process Mining Errors (5xxx)
  | 'INVALID_EVENT_LOG'          // 5001
  | 'DISCOVERY_FAILED'           // 5002
  | 'CONFORMANCE_CHECK_FAILED'   // 5003
  | 'INVALID_PROCESS_MODEL'      // 5004
  | 'OCEL_PARSE_ERROR'           // 5005
  | 'PM4PY_EXECUTION_ERROR';     // 5006

interface ValidationError extends AppError {
  code: 'VALIDATION_FAILED';
  violations: ValidationViolation[];
}

interface ValidationViolation {
  field: string;
  constraint: string;
  message: string;
  value?: unknown;
}
```

---

## 2. Primitive Types

```typescript
// ═══════════════════════════════════════════════════════════════
// BRANDED TYPES (Nominal Typing)
// ═══════════════════════════════════════════════════════════════

type Brand<T, B> = T & { readonly __brand: B };

type UUID = Brand<string, 'UUID'>;
type TenantId = Brand<UUID, 'TenantId'>;
type UserId = Brand<UUID, 'UserId'>;
type OrganizationId = Brand<UUID, 'OrganizationId'>;
type TraceId = Brand<string, 'TraceId'>;
type CorrelationId = Brand<string, 'CorrelationId'>;

// Domain-Specific IDs
type DataPoolId = Brand<UUID, 'DataPoolId'>;
type DataModelId = Brand<UUID, 'DataModelId'>;
type EventLogId = Brand<UUID, 'EventLogId'>;
type ProcessModelId = Brand<UUID, 'ProcessModelId'>;
type ViewId = Brand<UUID, 'ViewId'>;
type PackageId = Brand<UUID, 'PackageId'>;
type SpaceId = Brand<UUID, 'SpaceId'>;
type ActionFlowId = Brand<UUID, 'ActionFlowId'>;

// OCEL-Specific IDs
type ObjectTypeId = Brand<string, 'ObjectTypeId'>;
type ObjectId = Brand<string, 'ObjectId'>;
type EventId = Brand<string, 'EventId'>;
type ActivityId = Brand<string, 'ActivityId'>;

// ═══════════════════════════════════════════════════════════════
// TEMPORAL TYPES
// ═══════════════════════════════════════════════════════════════

type ISODateTime = Brand<string, 'ISODateTime'>;  // ISO 8601
type UnixTimestamp = Brand<number, 'UnixTimestamp'>;
type Duration = Brand<number, 'DurationMs'>;  // milliseconds

interface DateRange {
  readonly start: ISODateTime;
  readonly end: ISODateTime;
}

interface TimeWindow {
  readonly value: number;
  readonly unit: 'seconds' | 'minutes' | 'hours' | 'days' | 'weeks' | 'months';
}

// ═══════════════════════════════════════════════════════════════
// SEMANTIC TYPES
// ═══════════════════════════════════════════════════════════════

type Email = Brand<string, 'Email'>;
type URL = Brand<string, 'URL'>;
type JSONString = Brand<string, 'JSONString'>;
type Percentage = Brand<number, 'Percentage'>;  // 0-100
type PositiveInt = Brand<number, 'PositiveInt'>;
type NonNegativeInt = Brand<number, 'NonNegativeInt'>;
```

---

## 3. Pagination & Query Types

```typescript
// ═══════════════════════════════════════════════════════════════
// PAGINATION
// ═══════════════════════════════════════════════════════════════

interface CursorPagination {
  readonly cursor?: string;
  readonly limit: PositiveInt;
  readonly direction: 'forward' | 'backward';
}

interface OffsetPagination {
  readonly page: PositiveInt;
  readonly pageSize: PositiveInt;
}

type Pagination = CursorPagination | OffsetPagination;

interface PaginatedResult<T> {
  readonly items: readonly T[];
  readonly total: NonNegativeInt;
  readonly hasMore: boolean;
  readonly cursor?: string;
}

// ═══════════════════════════════════════════════════════════════
// FILTERING & SORTING
// ═══════════════════════════════════════════════════════════════

interface SortConfig {
  readonly field: string;
  readonly direction: 'asc' | 'desc';
  readonly nulls?: 'first' | 'last';
}

interface FilterClause {
  readonly field: string;
  readonly operator: FilterOperator;
  readonly value: unknown;
}

type FilterOperator =
  | 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte'
  | 'in' | 'nin' | 'contains' | 'startsWith' | 'endsWith'
  | 'isNull' | 'isNotNull' | 'between' | 'regex';

interface FilterGroup {
  readonly logic: 'AND' | 'OR';
  readonly clauses: readonly (FilterClause | FilterGroup)[];
}

interface QueryOptions {
  readonly filters?: FilterGroup;
  readonly sort?: readonly SortConfig[];
  readonly pagination?: Pagination;
  readonly includes?: readonly string[];  // eager loading
}
```

---

## 4. Context Types

```typescript
// ═══════════════════════════════════════════════════════════════
// EXECUTION CONTEXT
// ═══════════════════════════════════════════════════════════════

interface RequestContext {
  readonly traceId: TraceId;
  readonly correlationId: CorrelationId;
  readonly timestamp: ISODateTime;
  readonly source: RequestSource;
}

type RequestSource = 
  | { type: 'api'; ip: string; userAgent: string }
  | { type: 'webhook'; webhookId: UUID }
  | { type: 'scheduler'; jobId: UUID }
  | { type: 'system'; component: string };

interface AuthContext {
  readonly tenantId: TenantId;
  readonly userId: UserId;
  readonly organizationId?: OrganizationId;
  readonly sessionId: UUID;
  readonly permissions: readonly Permission[];
  readonly roles: readonly RoleId[];
  readonly impersonatedBy?: UserId;
}

interface ServiceContext extends RequestContext {
  readonly auth: AuthContext;
  readonly featureFlags: ReadonlyMap<string, boolean>;
  readonly rateLimit: RateLimitContext;
}

interface RateLimitContext {
  readonly remaining: number;
  readonly resetAt: ISODateTime;
  readonly tier: RateLimitTier;
}

type RateLimitTier = 'free' | 'starter' | 'professional' | 'enterprise';
```

---

## 5. Core Interfaces

```typescript
// ═══════════════════════════════════════════════════════════════
// LOGGER
// ═══════════════════════════════════════════════════════════════

interface ILogger {
  debug(message: string, context?: LogContext): void;
  info(message: string, context?: LogContext): void;
  warn(message: string, context?: LogContext): void;
  error(message: string, error?: Error, context?: LogContext): void;
  
  child(bindings: Record<string, unknown>): ILogger;
  withContext(ctx: RequestContext): ILogger;
}

interface LogContext {
  [key: string]: unknown;
  readonly traceId?: TraceId;
  readonly userId?: UserId;
  readonly tenantId?: TenantId;
}

// ═══════════════════════════════════════════════════════════════
// EVENT BUS
// ═══════════════════════════════════════════════════════════════

interface IEventBus {
  publish<T extends DomainEvent>(event: T): AsyncResult<void>;
  publishBatch(events: readonly DomainEvent[]): AsyncResult<void>;
  subscribe<T extends DomainEvent>(
    eventType: T['type'],
    handler: EventHandler<T>
  ): Unsubscribe;
}

interface DomainEvent<TPayload = unknown> {
  readonly id: UUID;
  readonly type: string;
  readonly aggregateType: string;
  readonly aggregateId: UUID;
  readonly payload: TPayload;
  readonly metadata: EventMetadata;
  readonly occurredAt: ISODateTime;
  readonly version: PositiveInt;
}

interface EventMetadata {
  readonly tenantId: TenantId;
  readonly userId?: UserId;
  readonly traceId: TraceId;
  readonly correlationId: CorrelationId;
  readonly causationId?: UUID;
}

type EventHandler<T extends DomainEvent> = (event: T) => AsyncResult<void>;
type Unsubscribe = () => void;

// ═══════════════════════════════════════════════════════════════
// ID GENERATOR
// ═══════════════════════════════════════════════════════════════

interface IIdGenerator {
  generate(): UUID;
  generatePrefixed(prefix: string): string;  // e.g., "dp_xxxxx"
  validate(id: string): boolean;
}

// ═══════════════════════════════════════════════════════════════
// DATE/TIME PROVIDER
// ═══════════════════════════════════════════════════════════════

interface IDateTimeProvider {
  now(): ISODateTime;
  nowUnix(): UnixTimestamp;
  parse(value: string): Result<ISODateTime>;
  format(date: ISODateTime, pattern: string): string;
  add(date: ISODateTime, duration: Duration): ISODateTime;
  diff(a: ISODateTime, b: ISODateTime): Duration;
}

// ═══════════════════════════════════════════════════════════════
// CACHE
// ═══════════════════════════════════════════════════════════════

interface ICache {
  get<T>(key: string): AsyncResult<T | null>;
  set<T>(key: string, value: T, options?: CacheOptions): AsyncResult<void>;
  delete(key: string): AsyncResult<boolean>;
  deletePattern(pattern: string): AsyncResult<number>;
  has(key: string): AsyncResult<boolean>;
  
  getOrSet<T>(
    key: string,
    factory: () => AsyncResult<T>,
    options?: CacheOptions
  ): AsyncResult<T>;
}

interface CacheOptions {
  readonly ttl?: Duration;
  readonly tags?: readonly string[];
}
```

---

## 6. Shared Enums

```typescript
// ═══════════════════════════════════════════════════════════════
// DATA TYPES
// ═══════════════════════════════════════════════════════════════

type DataType = 
  | 'string' | 'integer' | 'float' | 'boolean'
  | 'date' | 'datetime' | 'timestamp'
  | 'json' | 'binary' | 'uuid';

// ═══════════════════════════════════════════════════════════════
// STATUS ENUMS
// ═══════════════════════════════════════════════════════════════

type EntityStatus = 'active' | 'inactive' | 'archived' | 'deleted';

type LoadStatus = 
  | 'idle' | 'queued' | 'loading' | 'loaded' 
  | 'failed' | 'stale' | 'cancelled';

type ExecutionStatus = 
  | 'pending' | 'running' | 'completed' 
  | 'failed' | 'cancelled' | 'timeout';

type PublishStatus = 'draft' | 'published' | 'deprecated';

// ═══════════════════════════════════════════════════════════════
// PROCESS MINING ENUMS (PM4Py Aligned)
// ═══════════════════════════════════════════════════════════════

type DiscoveryAlgorithm = 
  | 'alpha' | 'alpha_plus' 
  | 'inductive' | 'inductive_infrequent' | 'inductive_dfg'
  | 'heuristic' | 'ilp' | 'correlation';

type ConformanceMethod = 
  | 'token_replay' | 'alignments' | 'footprints';

type ProcessModelType = 
  | 'petri_net' | 'process_tree' | 'bpmn' | 'dfg' 
  | 'causal_net' | 'powl' | 'ocel_net';

type MetricType = 
  | 'fitness' | 'precision' | 'generalization' | 'simplicity';
```
