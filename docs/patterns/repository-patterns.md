# Repository Patterns - Odin Domain Layer

> **Purpose:** This document captures the standard patterns for defining repository interfaces in the Odin codebase.
> **Last Updated:** 2025-12-27
> **Prevents:** 1 hour of exploration per new repository

---

## Quick Reference

**Standard Repository Interface Structure:**
```
1. File header (JSDoc)
2. Imports (core-contracts + entity types)
3. Repository interface with sections:
   - Queries (Read operations)
   - Commands (Write operations)
   - Domain-specific operations
4. Supporting types (query options, filters, etc.)
```

**Key Rules:**
- ✅ Interface-only in domain layer (implementations in infra)
- ✅ ALL methods return `AsyncResult<T>`
- ✅ Use `Entity | null` for optional lookups
- ✅ Use `PageRequest` / `PageResponse` for pagination
- ✅ Organize methods into logical sections
- ✅ Name: `I{Entity}Repository`

---

## File Structure Pattern

### 1. File Header

```typescript
/**
 * EntityName Repository Interface - Layer Name
 *
 * Data access contract for EntityName entities.
 */
```

**Example:**
```typescript
/**
 * Subscription Repository Interface - Commercial Layer
 *
 * Data access contract for Subscription entities.
 */
```

---

### 2. Imports Section

**Pattern:**
```typescript
import type {
  UUID,                  // From core-contracts
  TenantId,
  UserId,
  AsyncResult,          // ← CRITICAL - all methods return this
  PageRequest,          // ← For pagination
  PageResponse,         // ← For paginated results
} from '@odin/core-contracts';

import type {
  Entity,              // Import entity from sibling directory
  EntityStatus,
  CreateEntityData,    // Import DTOs
  UpdateEntityData,
} from '../../entities/layer/entity';
```

**Import Rules:**
1. Core-contracts types first
2. Entity types from `../../entities/`
3. Never import from infrastructure or services

---

### 3. Repository Interface

Standard interface with section comments:

```typescript
/**
 * I{Entity}Repository - {Entity} data access contract
 *
 * [Optional domain description]
 */
export interface I{Entity}Repository {
  // -------------------------------------------------------------------------
  // Queries
  // -------------------------------------------------------------------------

  [query methods]

  // -------------------------------------------------------------------------
  // Commands
  // -------------------------------------------------------------------------

  [command methods]

  // -------------------------------------------------------------------------
  // [Domain-Specific Section Name]
  // -------------------------------------------------------------------------

  [specialized methods]
}
```

---

## AsyncResult Pattern

### Core Principle

**ALL repository methods MUST return `AsyncResult<T>`**

```typescript
import type { AsyncResult } from '@odin/core-contracts';

export interface IUserRepository {
  // ✅ CORRECT - Returns AsyncResult
  findById(id: UserId): AsyncResult<User | null>;
  create(data: CreateUserData): AsyncResult<User>;
  delete(id: UserId): AsyncResult<void>;

  // ❌ WRONG - Direct Promise
  findById(id: UserId): Promise<User | null>;

  // ❌ WRONG - Synchronous
  findById(id: UserId): User | null;
}
```

### Return Type Patterns

```typescript
// Optional lookups - return Entity | null
findById(id: UUID): AsyncResult<User | null>;
findByEmail(email: Email): AsyncResult<User | null>;

// Operations that return entity
create(data: CreateData): AsyncResult<Entity>;
update(id: UUID, data: UpdateData): AsyncResult<Entity>;

// Operations with no return value
delete(id: UUID): AsyncResult<void>;
updateStatus(id: UUID, status: Status): AsyncResult<void>;

// Collections without pagination
findByTenantId(tenantId: TenantId): AsyncResult<readonly Entity[]>;
findActive(): AsyncResult<readonly Entity[]>;

// Paginated collections
findAll(options?: PageRequest): AsyncResult<PageResponse<Entity>>;

// Bulk operations - return count
deleteExpired(): AsyncResult<number>;
processScheduledChanges(): AsyncResult<number>;

// Specialized operations
exportToCSV(id: UUID): AsyncResult<Buffer>;
exportToPNML(id: UUID): AsyncResult<string>;
```

---

## Query Section Pattern

### Standard Query Methods

**Pattern:**
```typescript
  // -------------------------------------------------------------------------
  // Queries
  // -------------------------------------------------------------------------

  /**
   * Find an entity by ID
   */
  findById(id: EntityId): AsyncResult<Entity | null>;

  /**
   * Find an entity by tenant ID
   */
  findByTenantId(tenantId: TenantId): AsyncResult<Entity | null>;

  /**
   * Find all entities with optional pagination
   */
  findAll(options?: PageRequest): AsyncResult<PageResponse<Entity>>;

  /**
   * Check if an entity exists
   */
  exists(id: EntityId): AsyncResult<boolean>;
```

### Naming Conventions

**findById** - Single entity by primary key, returns `Entity | null`
```typescript
findById(id: UUID): AsyncResult<User | null>;
```

**findBy{Property}** - Single entity by unique property, returns `Entity | null`
```typescript
findByEmail(tenantId: TenantId, email: Email): AsyncResult<User | null>;
findBySlug(slug: string): AsyncResult<Tenant | null>;
```

**findBy{Criteria}** - Multiple entities by criteria, with pagination
```typescript
findByTenantId(tenantId: TenantId, options?: PageRequest): AsyncResult<PageResponse<User>>;
findByStatus(status: Status, options?: PageRequest): AsyncResult<PageResponse<Entity>>;
```

**findAll** - All entities, typically with pagination
```typescript
findAll(options?: PageRequest): AsyncResult<PageResponse<Entity>>;
```

**find{Adjective}** - Filtered collections (active, expired, etc.)
```typescript
findActive(): AsyncResult<readonly Entity[]>;
findExpiring(withinDays: number): AsyncResult<readonly Entity[]>;
findPublic(): AsyncResult<readonly Plan[]>;
```

**exists** - Boolean checks
```typescript
exists(id: UUID): AsyncResult<boolean>;
emailExists(tenantId: TenantId, email: Email): AsyncResult<boolean>;
slugExists(slug: string): AsyncResult<boolean>;
```

---

## Command Section Pattern

### Standard Command Methods

**Pattern:**
```typescript
  // -------------------------------------------------------------------------
  // Commands
  // -------------------------------------------------------------------------

  /**
   * Create a new entity
   */
  create(data: CreateEntityData): AsyncResult<Entity>;

  /**
   * Update entity fields
   */
  update(id: EntityId, data: UpdateEntityData): AsyncResult<Entity>;

  /**
   * Update entity status
   */
  updateStatus(id: EntityId, status: EntityStatus): AsyncResult<Entity>;

  /**
   * Delete an entity
   */
  delete(id: EntityId): AsyncResult<void>;
```

### Command Naming Conventions

**create** - Create new entity, returns created entity
```typescript
create(data: CreateEntityData): AsyncResult<Entity>;
```

**update** - Update entity fields, returns updated entity
```typescript
update(id: UUID, data: UpdateEntityData): AsyncResult<Entity>;
```

**update{Field}** - Update specific field, returns updated entity
```typescript
updateStatus(id: UUID, status: Status): AsyncResult<Entity>;
updateSettings(id: UUID, settings: Partial<Settings>): AsyncResult<Entity>;
updatePassword(userId: UserId, hashedPassword: string): AsyncResult<void>;
```

**delete** - Delete entity, returns void
```typescript
delete(id: UUID): AsyncResult<void>;
```

**softDelete / hardDelete** - Explicit delete types
```typescript
softDelete(id: UUID): AsyncResult<void>;  // Sets deletedAt
hardDelete(id: UUID): AsyncResult<void>;  // Permanent deletion
```

**State transitions** - Domain-specific state changes
```typescript
cancel(id: UUID, reason?: string): AsyncResult<Subscription>;
reactivate(id: UUID): AsyncResult<Subscription>;
archive(id: UUID): AsyncResult<void>;
deprecate(id: UUID): AsyncResult<Plan>;
```

---

## Pagination Pattern

### Using PageRequest and PageResponse

**Import:**
```typescript
import type { PageRequest, PageResponse } from '@odin/core-contracts';
```

**Pattern:**
```typescript
// Optional pagination parameter
findByTenantId(
  tenantId: TenantId,
  options?: PageRequest
): AsyncResult<PageResponse<Entity>>;

// With additional filters
findAll(
  filters?: FilterCriteria,
  options?: PageRequest
): AsyncResult<PageResponse<Entity>>;
```

**PageRequest Structure:**
```typescript
interface PageRequest {
  page?: number;        // 1-indexed, default: 1
  limit?: number;       // Items per page, default: 20, max: 100
  sortBy?: string;      // Field to sort by
  sortDir?: 'asc' | 'desc';  // Sort direction, default: 'desc'
}
```

**PageResponse Structure:**
```typescript
interface PageResponse<T> {
  data: T[];           // Current page items
  page: number;        // Current page (1-indexed)
  limit: number;       // Items per page
  total: number;       // Total items across all pages
  totalPages: number;  // Total number of pages
  hasNext: boolean;    // Has next page?
  hasPrev: boolean;    // Has previous page?
}
```

### Collections Without Pagination

For small, bounded collections, skip pagination:

```typescript
// Roles are typically small - no pagination needed
getRoles(userId: UserId): AsyncResult<readonly Role[]>;

// Active subscriptions are limited
findActive(): AsyncResult<readonly Subscription[]>;

// Tenant-scoped API keys are usually few
findByTenantId(tenantId: TenantId): AsyncResult<readonly ApiKey[]>;
```

**Use `readonly T[]` for immutability.**

---

## Domain-Specific Sections

Beyond standard CRUD, add domain-specific sections:

### Example: User Repository

```typescript
export interface IUserRepository {
  // Queries
  findById(id: UserId): AsyncResult<User | null>;
  findByEmail(tenantId: TenantId, email: Email): AsyncResult<User | null>;

  // Commands
  create(data: CreateUserData): AsyncResult<User>;
  update(id: UserId, data: UpdateUserData): AsyncResult<User>;
  delete(id: UserId): AsyncResult<void>;

  // -------------------------------------------------------------------------
  // Profile Management
  // -------------------------------------------------------------------------

  getProfile(userId: UserId): AsyncResult<UserProfile | null>;
  updateProfile(userId: UserId, data: Partial<UserProfile>): AsyncResult<UserProfile>;

  // -------------------------------------------------------------------------
  // Role Management
  // -------------------------------------------------------------------------

  getRoles(userId: UserId): AsyncResult<readonly Role[]>;
  assignRole(userId: UserId, roleId: RoleId): AsyncResult<void>;
  revokeRole(userId: UserId, roleId: RoleId): AsyncResult<void>;
}
```

### Example: Subscription Repository

```typescript
export interface ISubscriptionRepository {
  // Queries
  findById(id: UUID): AsyncResult<Subscription | null>;

  // Commands
  create(data: CreateSubscriptionData): AsyncResult<Subscription>;
  cancel(id: UUID, reason?: string): AsyncResult<Subscription>;

  // -------------------------------------------------------------------------
  // Change Management
  // -------------------------------------------------------------------------

  scheduleChange(subscriptionId: UUID, change: ScheduleChangeData): AsyncResult<SubscriptionChange>;
  getChanges(subscriptionId: UUID): AsyncResult<readonly SubscriptionChange[]>;
  processScheduledChanges(): AsyncResult<number>;  // Returns count processed
}
```

### Example: Audit Log Repository

```typescript
export interface IAuditLogRepository {
  // Write Operations (Append-Only)
  create(data: CreateAuditLogData): AsyncResult<AuditLog>;
  createBatch(logs: readonly CreateAuditLogData[]): AsyncResult<readonly AuditLog[]>;

  // Queries
  findById(id: UUID): AsyncResult<AuditLog | null>;
  search(tenantId: TenantId, criteria: AuditSearchCriteria, options?: PageRequest): AsyncResult<PageResponse<AuditLog>>;

  // -------------------------------------------------------------------------
  // Aggregations
  // -------------------------------------------------------------------------

  getActivitySummary(tenantId: TenantId, dateRange: DateRange): AsyncResult<ActivitySummary>;

  // -------------------------------------------------------------------------
  // Retention
  // -------------------------------------------------------------------------

  deleteOlderThan(tenantId: TenantId, cutoffDate: ISODateTime): AsyncResult<number>;
  archiveToStorage(tenantId: TenantId, cutoffDate: ISODateTime): AsyncResult<string>;
}
```

---

## Supporting Types Pattern

### Query Options and Filters

Define supporting types in the same file after the interface:

```typescript
export interface I{Entity}Repository {
  search(criteria: SearchCriteria, options?: PageRequest): AsyncResult<PageResponse<Entity>>;
}

// ============================================================================
// Supporting Types
// ============================================================================

/**
 * Search criteria for {Entity} queries
 */
export interface SearchCriteria {
  readonly field1?: string;
  readonly field2?: number;
  readonly dateRange?: DateRange;
  readonly status?: EntityStatus;
}
```

### Complex Query Options

```typescript
export interface ITableRepository {
  importData(tableId: UUID, data: TableImportData): AsyncResult<ImportResult>;
}

// Supporting types
export interface TableImportData {
  readonly source: ImportSource;
  readonly options: ImportOptions;
}

export type ImportSource =
  | { readonly type: 'file'; readonly fileId: UUID }
  | { readonly type: 'raw'; readonly data: readonly Record<string, unknown>[] }
  | { readonly type: 'query'; readonly connectionId: UUID; readonly query: string };

export interface ImportOptions {
  readonly mode: ImportMode;
  readonly batchSize?: number;
  readonly skipErrors?: boolean;
}

export type ImportMode = 'replace' | 'append' | 'upsert';

export interface ImportResult {
  readonly rowsImported: number;
  readonly rowsSkipped: number;
  readonly errors: readonly ImportError[];
  readonly duration: Duration;
}
```

---

## Complete Examples

### Simple Repository (Existence Layer)

**File:** `/packages/domain/repositories/existence/tenant-repository.ts`

```typescript
/**
 * Tenant Repository Interface - Existence Layer
 *
 * Data access contract for Tenant entities.
 */

import type {
  TenantId,
  AsyncResult,
  PageRequest,
  PageResponse,
} from '@odin/core-contracts';

import type {
  Tenant,
  TenantStatus,
  TenantSettings,
  CreateTenantData,
  UpdateTenantData,
} from '../../entities/existence/tenant';

/**
 * ITenantRepository - Tenant data access contract
 */
export interface ITenantRepository {
  // -------------------------------------------------------------------------
  // Queries
  // -------------------------------------------------------------------------

  /**
   * Find a tenant by ID
   */
  findById(id: TenantId): AsyncResult<Tenant | null>;

  /**
   * Find a tenant by slug
   */
  findBySlug(slug: string): AsyncResult<Tenant | null>;

  /**
   * Find all tenants with optional pagination
   */
  findAll(options?: PageRequest): AsyncResult<PageResponse<Tenant>>;

  /**
   * Check if a tenant exists
   */
  exists(id: TenantId): AsyncResult<boolean>;

  /**
   * Check if a slug is already taken
   */
  slugExists(slug: string): AsyncResult<boolean>;

  // -------------------------------------------------------------------------
  // Commands
  // -------------------------------------------------------------------------

  /**
   * Create a new tenant
   */
  create(data: CreateTenantData): AsyncResult<Tenant>;

  /**
   * Update tenant fields
   */
  update(id: TenantId, data: UpdateTenantData): AsyncResult<Tenant>;

  /**
   * Update tenant status
   */
  updateStatus(id: TenantId, status: TenantStatus): AsyncResult<Tenant>;

  /**
   * Update tenant settings (partial merge)
   */
  updateSettings(id: TenantId, settings: Partial<TenantSettings>): AsyncResult<Tenant>;

  /**
   * Soft delete a tenant (sets deletedAt)
   */
  softDelete(id: TenantId): AsyncResult<void>;

  /**
   * Hard delete a tenant (permanent)
   */
  hardDelete(id: TenantId): AsyncResult<void>;
}
```

---

### Complex Repository (Commercial Layer)

**File:** `/packages/domain/repositories/commercial/subscription-repository.ts`

```typescript
/**
 * Subscription Repository Interface - Commercial Layer
 *
 * Data access contract for Subscription entities.
 */

import type {
  UUID,
  TenantId,
  AsyncResult,
} from '@odin/core-contracts';

import type {
  Subscription,
  SubscriptionStatus,
  SubscriptionChange,
  CreateSubscriptionData,
  UpdateSubscriptionData,
  ScheduleChangeData,
} from '../../entities/commercial/subscription';

/**
 * ISubscriptionRepository - Subscription data access contract
 */
export interface ISubscriptionRepository {
  // -------------------------------------------------------------------------
  // Queries
  // -------------------------------------------------------------------------

  /**
   * Find a subscription by ID
   */
  findById(id: UUID): AsyncResult<Subscription | null>;

  /**
   * Find a subscription by tenant ID
   */
  findByTenantId(tenantId: TenantId): AsyncResult<Subscription | null>;

  /**
   * Find all active subscriptions
   */
  findActive(): AsyncResult<readonly Subscription[]>;

  /**
   * Find subscriptions expiring within N days
   */
  findExpiring(withinDays: number): AsyncResult<readonly Subscription[]>;

  // -------------------------------------------------------------------------
  // Commands
  // -------------------------------------------------------------------------

  /**
   * Create a new subscription
   */
  create(data: CreateSubscriptionData): AsyncResult<Subscription>;

  /**
   * Update subscription fields
   */
  update(id: UUID, data: UpdateSubscriptionData): AsyncResult<Subscription>;

  /**
   * Update subscription status
   */
  updateStatus(id: UUID, status: SubscriptionStatus): AsyncResult<Subscription>;

  /**
   * Cancel a subscription
   */
  cancel(id: UUID, reason?: string): AsyncResult<Subscription>;

  /**
   * Reactivate a cancelled subscription
   */
  reactivate(id: UUID): AsyncResult<Subscription>;

  // -------------------------------------------------------------------------
  // Change Management
  // -------------------------------------------------------------------------

  /**
   * Schedule a future subscription change
   */
  scheduleChange(subscriptionId: UUID, change: ScheduleChangeData): AsyncResult<SubscriptionChange>;

  /**
   * Get all scheduled changes for a subscription
   */
  getChanges(subscriptionId: UUID): AsyncResult<readonly SubscriptionChange[]>;

  /**
   * Process all scheduled changes due for execution
   * @returns Number of changes processed
   */
  processScheduledChanges(): AsyncResult<number>;
}
```

---

### Rich Query Repository (Temporal Layer)

**File:** `/packages/domain/repositories/temporal/audit-log-repository.ts`

```typescript
/**
 * Audit Log Repository Interface - Temporal Layer
 *
 * Append-only audit log data access contract.
 */

import type {
  UUID,
  TenantId,
  UserId,
  ISODateTime,
  AsyncResult,
  PageRequest,
  PageResponse,
  DateRange,
} from '@odin/core-contracts';

import type {
  AuditLog,
  CreateAuditLogData,
} from '../../entities/temporal/audit-log';

/**
 * IAuditLogRepository - Audit log data access contract
 *
 * Note: Audit logs are append-only - no update or delete methods
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
   * Create multiple audit log entries in a batch
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
   * Search audit logs with criteria and pagination
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
   * Get audit logs for a specific actor
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
   * Get activity summary for a tenant in a date range
   */
  getActivitySummary(tenantId: TenantId, dateRange: DateRange): AsyncResult<ActivitySummary>;

  // -------------------------------------------------------------------------
  // Retention
  // -------------------------------------------------------------------------

  /**
   * Delete audit logs older than cutoff date
   * @returns Number of logs deleted
   */
  deleteOlderThan(tenantId: TenantId, cutoffDate: ISODateTime): AsyncResult<number>;

  /**
   * Archive audit logs to external storage
   * @returns Storage location reference
   */
  archiveToStorage(tenantId: TenantId, cutoffDate: ISODateTime): AsyncResult<string>;
}

// ============================================================================
// Supporting Types
// ============================================================================

/**
 * Rich search criteria for audit log queries
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

export type ResourceType = 'user' | 'tenant' | 'subscription' | 'plan' | 'data_model';
export type ActorType = 'user' | 'system' | 'api';
export type AuditCategory = 'auth' | 'data' | 'admin' | 'billing';
export type AuditOutcome = 'success' | 'failure';

/**
 * Activity summary aggregation result
 */
export interface ActivitySummary {
  readonly totalActions: number;
  readonly uniqueActors: number;
  readonly topActions: readonly ActionCount[];
  readonly outcomeDistribution: Record<AuditOutcome, number>;
}

interface ActionCount {
  readonly action: string;
  readonly count: number;
}
```

---

## Common Patterns by Layer

### Existence Layer

- Simple CRUD operations
- Slug validation (slugExists)
- Soft delete support
- Settings management

### Identity Layer

- User authentication methods
- Role/permission management
- Session handling
- Profile operations

### Commercial Layer

- State transitions (cancel, reactivate)
- Change scheduling
- External ID tracking (Stripe, etc.)
- Billing operations

### Operational Layer

- Feature flag evaluation
- Configuration management
- System-wide settings

### Temporal Layer

- Append-only (no updates)
- Rich search/filtering
- Aggregations
- Retention policies

### Integration Layer

- External system sync
- Credential management
- Webhook handling
- Connection testing

---

## Common Mistakes

### ❌ Not Using AsyncResult

```typescript
// WRONG
findById(id: UUID): Promise<User | null>;

// CORRECT
findById(id: UUID): AsyncResult<User | null>;
```

---

### ❌ Not Returning null for Optional Lookups

```typescript
// WRONG - what if not found?
findById(id: UUID): AsyncResult<User>;

// CORRECT - explicit null for not found
findById(id: UUID): AsyncResult<User | null>;
```

---

### ❌ Returning Mutable Arrays

```typescript
// WRONG - mutable array
findAll(): AsyncResult<User[]>;

// CORRECT - readonly array
findAll(): AsyncResult<readonly User[]>;
```

---

### ❌ Forgetting Tenant Scoping

```typescript
// WRONG - findByEmail without tenant context
findByEmail(email: Email): AsyncResult<User | null>;

// CORRECT - scoped to tenant
findByEmail(tenantId: TenantId, email: Email): AsyncResult<User | null>;
```

---

### ❌ Including Implementation Details

```typescript
// WRONG - repository interface shouldn't mention SQL
interface IUserRepository {
  /**
   * Execute raw SQL query
   */
  executeQuery(sql: string): AsyncResult<any>;
}

// CORRECT - domain-focused operations
interface IUserRepository {
  findByEmail(tenantId: TenantId, email: Email): AsyncResult<User | null>;
}
```

---

## Quick Checklist

Before committing a new repository interface:

- [ ] File header with JSDoc
- [ ] Imports from `@odin/core-contracts` use `import type`
- [ ] All methods return `AsyncResult<T>`
- [ ] Optional lookups return `Entity | null`
- [ ] Collections use `readonly T[]`
- [ ] Paginated queries use `PageRequest` / `PageResponse`
- [ ] Methods organized into sections (Queries, Commands, Domain)
- [ ] Supporting types defined in same file
- [ ] JSDoc comments on all public methods
- [ ] Interface name: `I{Entity}Repository`
- [ ] Everything exported (no private types)

---

## File Paths Reference

**Repository files located in:**
- `/packages/domain/repositories/existence/` - Foundation layer
- `/packages/domain/repositories/identity/` - Identity context
- `/packages/domain/repositories/commercial/` - Business models
- `/packages/domain/repositories/operational/` - Runtime controls
- `/packages/domain/repositories/temporal/` - Time-bound data
- `/packages/domain/repositories/integration/` - External systems
- `/packages/domain/repositories/process-mining/` - Process mining domain

**Each layer has an `index.ts` that exports all repository interfaces in that layer.**

**Implementations live in:** `/packages/infra/database/` (not in domain layer)

---

## Additional Resources

- **Entity Patterns:** See `entity-patterns.md`
- **Event Patterns:** See `event-patterns.md`
- **Type Patterns:** See `type-patterns.md`
- **Architecture:** See `architecture-overview.md`
