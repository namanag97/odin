# Entity Patterns - Odin Domain Layer

> **Purpose:** This document captures the standard patterns for defining domain entities in the Odin codebase.
> **Last Updated:** 2025-12-27
> **Prevents:** 1-2 hours of exploration per new feature

---

## Quick Reference

**Standard Entity File Structure:**
```
1. File header (JSDoc)
2. Imports from @odin/core-contracts
3. Status & Type Enums
4. Configuration/Settings Interfaces
5. Main Entity Interface
6. Sub-entity Interfaces (if any)
7. DTOs (CreateXData, UpdateXData)
8. Constants & Defaults (optional)
```

**Key Rules:**
- ✅ All fields must be `readonly`
- ✅ Use branded types for IDs (TenantId, UserId, etc.)
- ✅ Multi-tenant entities include `tenantId: TenantId`
- ✅ DTOs use `Data` suffix (`CreateXData`, `UpdateXData`)
- ✅ Export everything - no private types

---

## File Organization Pattern

### 1. File Header

Every entity file starts with a JSDoc header:

```typescript
/**
 * Entity Name - Layer Name
 *
 * Brief description of the entity's purpose.
 */
```

**Example:**
```typescript
/**
 * Subscription Entity - Commercial Layer
 *
 * Tenant subscription to a plan with billing cycle tracking.
 */
```

---

### 2. Imports Section

Always import from `@odin/core-contracts` using type imports:

```typescript
import type {
  UUID,              // Generic UUID
  TenantId,         // Branded tenant ID
  UserId,           // Branded user ID
  ISODateTime,      // ISO 8601 datetime
  PositiveInt,      // Integer > 0
  NonNegativeInt,   // Integer >= 0
  Duration,         // Duration in milliseconds
  Percentage        // 0-100 value
} from '@odin/core-contracts';
```

**Import Organization:**
1. Core-contracts types first
2. Sibling entity types (if needed)
3. Never import from infrastructure or services layers

---

### 3. Status & Type Enums

Define status types and enums at the top using **string literal unions**:

```typescript
// ============================================================================
// Status & Type Enums
// ============================================================================

/** Entity lifecycle status */
export type EntityStatus = 'active' | 'inactive' | 'archived';

/** Category type */
export type CategoryType = 'type_a' | 'type_b' | 'type_c';
```

**Naming Convention:**
- Status types: `{Entity}Status`
- Category types: Descriptive name + `Type` suffix
- Use pipe-separated string literals, not TS enums

---

### 4. Configuration/Settings Interfaces

Group related settings into nested `readonly` interfaces:

```typescript
// ============================================================================
// Settings & Configuration
// ============================================================================

/**
 * Configuration for the entity
 */
export interface EntitySettings {
  readonly setting1: string;
  readonly setting2: number;
  readonly nestedConfig: NestedConfig;
}

export interface NestedConfig {
  readonly enabled: boolean;
  readonly threshold: number;
}
```

**Pattern Benefits:**
- Cleaner main entity interface
- Logical grouping of related settings
- Easier to pass settings as a single object

---

### 5. Main Entity Interface

The primary entity interface with **all readonly fields**:

```typescript
// ============================================================================
// Entity
// ============================================================================

/**
 * EntityName - Primary description
 */
export interface EntityName {
  readonly id: UUID;                    // Primary key (UUID or branded ID)
  readonly tenantId: TenantId;          // Multi-tenancy (if applicable)
  readonly name: string;
  readonly status: EntityStatus;
  readonly settings: EntitySettings;    // Nested configuration
  readonly metadata?: EntityMetadata;   // Optional metadata
  readonly createdAt: ISODateTime;      // Audit timestamp
  readonly updatedAt: ISODateTime;      // Audit timestamp
  readonly createdBy: UserId;           // Audit user (optional)
}
```

**Standard Fields (when applicable):**
- `id` - Primary identifier
- `tenantId` - For multi-tenant entities
- `status` - Lifecycle status
- `createdAt` / `updatedAt` - Timestamps
- `createdBy` / `updatedBy` - User tracking

**Field Ordering:**
1. ID fields first (id, tenantId)
2. Core business fields
3. Status/state fields
4. Configuration/settings
5. Audit fields last (timestamps, users)

---

### 6. Sub-entity Interfaces

For entities with related sub-entities (stored separately but conceptually linked):

```typescript
/**
 * SubEntity - Related entity for tracking X
 */
export interface SubEntity {
  readonly id: UUID;
  readonly parentId: UUID;              // Reference to parent
  readonly type: SubEntityType;
  readonly data: Record<string, unknown>;
  readonly createdAt: ISODateTime;
}
```

**Examples:**
- `SubscriptionChange` (tracks subscription modifications)
- `AuditLog` (tracks entity changes)
- `Comment` (attached to entities)

---

### 7. DTOs (Data Transfer Objects)

DTOs for create and update operations:

```typescript
// ============================================================================
// DTOs
// ============================================================================

/**
 * Data required to create a new EntityName
 */
export interface CreateEntityNameData {
  readonly tenantId: TenantId;
  readonly name: string;
  readonly settings?: Partial<EntitySettings>;  // Optional on create
  readonly createdBy: UserId;
}

/**
 * Data for updating an EntityName
 */
export interface UpdateEntityNameData {
  readonly name?: string;                      // All fields optional
  readonly settings?: Partial<EntitySettings>;
}
```

**Naming Convention:**
- Create: `Create{EntityName}Data`
- Update: `Update{EntityName}Data`

**Patterns:**
- Create DTOs include required fields only
- Update DTOs have all fields optional
- Never include `id`, `createdAt`, `updatedAt` in DTOs
- Use `Partial<T>` for nested settings in DTOs

---

### 8. Constants & Defaults (Optional)

Export constant values for default configurations:

```typescript
// ============================================================================
// Constants
// ============================================================================

/** Default entity settings */
export const DEFAULT_ENTITY_SETTINGS: EntitySettings = {
  setting1: 'default',
  setting2: 100,
  nestedConfig: {
    enabled: true,
    threshold: 50,
  },
};
```

**Use Cases:**
- Default settings/configuration
- Well-known constants
- Validation thresholds

---

## Immutability Pattern

### Core Principle

**ALL entity fields MUST be `readonly`**. Entities are immutable value objects.

```typescript
// ✅ CORRECT - All fields readonly
export interface User {
  readonly id: UserId;
  readonly email: string;
  readonly name: string;
}

// ❌ WRONG - Mutable fields
export interface User {
  id: UserId;
  email: string;
  name: string;
}
```

### Benefits

1. **Predictability:** Entities cannot be accidentally mutated
2. **Type Safety:** TypeScript enforces immutability at compile time
3. **Functional:** Aligns with functional programming principles
4. **Domain Integrity:** Ensures domain rules are enforced through repository operations

---

## Branded Types Pattern

### What are Branded Types?

Type-safe wrappers that prevent mixing different ID types:

```typescript
type TenantId = Brand<UUID, 'TenantId'>;
type UserId = Brand<UUID, 'UserId'>;

function getUser(userId: UserId) { /* ... */ }

const tenantId: TenantId = /* ... */;
getUser(tenantId);  // ❌ TypeScript ERROR - prevents bugs!
```

### When to Use

**Use branded types from core-contracts for:**
- `TenantId`, `UserId`, `OrganizationId` - Identity
- `DataPoolId`, `DataModelId`, `ProcessModelId` - Data domain
- `EventId`, `ObjectId`, `CaseId` - Process mining
- `UUID` - Generic identifiers

**Define new branded types for:**
- Domain-specific IDs (e.g., `RoleId`, `PermissionId`)
- Location: Define in the entity file itself, or in core-contracts if reused widely

**Example:**
```typescript
import type { Brand, UUID } from '@odin/core-contracts';

export type RoleId = Brand<UUID, 'RoleId'>;
export const asRoleId = (id: UUID): RoleId => id as RoleId;

export interface Role {
  readonly id: RoleId;
  readonly name: string;
}
```

---

## Multi-Tenancy Pattern

### When to Include tenantId

**Include `tenantId: TenantId` in:**
- All tenant-scoped entities (most entities)
- User data, business data, configurations

**Exclude `tenantId` from:**
- Global entities (Plan, Coupon, FeatureFlag, SystemConfig)
- Cross-tenant lookup tables
- System-level entities

### Pattern

```typescript
export interface TenantScopedEntity {
  readonly id: UUID;
  readonly tenantId: TenantId;   // ← Multi-tenancy field
  readonly name: string;
  // ... other fields
}

export interface GlobalEntity {
  readonly id: UUID;
  // NO tenantId - this is global
  readonly name: string;
}
```

---

## Nested Configuration Objects

### Pattern

Instead of flat interfaces with many fields, use nested configuration objects:

```typescript
// ❌ AVOID - Flat structure gets unwieldy
export interface TenantSettings {
  readonly brandingLogoUrl?: string;
  readonly brandingPrimaryColor?: string;
  readonly securityMfaEnabled: boolean;
  readonly securityPasswordMinLength: number;
  readonly notificationsEmailEnabled: boolean;
  readonly notificationsSmsEnabled: boolean;
  // ... 50 more fields
}

// ✅ PREFER - Nested structure is organized
export interface ExtendedTenantSettings {
  readonly branding: BrandingSettings;
  readonly security: SecuritySettings;
  readonly notifications: NotificationSettings;
  readonly processMining: ProcessMiningSettings;
}

export interface BrandingSettings {
  readonly logoUrl?: string;
  readonly primaryColor?: string;
  readonly favicon?: string;
}

export interface SecuritySettings {
  readonly mfaEnabled: boolean;
  readonly passwordPolicy: PasswordPolicy;
  readonly sessionTimeout: Duration;
}
```

### Benefits

1. **Logical Grouping:** Related settings together
2. **Type Composition:** Reuse interfaces across entities
3. **Partial Updates:** Easy to update one category
4. **Code Navigation:** Clearer structure in IDEs

---

## Complete Example - Annotated

```typescript
/**
 * Subscription Entity - Commercial Layer
 *
 * Tenant subscription to a plan with billing cycle tracking.
 */

// ============================================================================
// Imports
// ============================================================================

import type {
  UUID,           // Generic ID type
  TenantId,       // Branded tenant ID
  ISODateTime,    // ISO 8601 datetime string
  PositiveInt     // Integer > 0
} from '@odin/core-contracts';

// ============================================================================
// Status & Type Enums
// ============================================================================

/** Subscription lifecycle status */
export type SubscriptionStatus =
  | 'trialing'    // In trial period
  | 'active'      // Active subscription
  | 'past_due'    // Payment failed
  | 'cancelled'   // Cancelled by user
  | 'unpaid'      // Payment overdue
  | 'paused';     // Temporarily paused

/** Billing cycle frequency */
export type BillingCycle = 'monthly' | 'yearly';

/** Subscription change type */
export type ChangeType =
  | 'upgrade'
  | 'downgrade'
  | 'seat_change'
  | 'cancel'
  | 'reactivate';

// ============================================================================
// Entity
// ============================================================================

/**
 * Subscription - Tenant's subscription to a plan
 */
export interface Subscription {
  readonly id: UUID;
  readonly tenantId: TenantId;
  readonly planId: UUID;
  readonly status: SubscriptionStatus;
  readonly billingCycle: BillingCycle;
  readonly currentPeriodStart: ISODateTime;
  readonly currentPeriodEnd: ISODateTime;
  readonly seats: PositiveInt;
  readonly trialEndsAt?: ISODateTime;
  readonly cancelledAt?: ISODateTime;
  readonly cancellationReason?: string;
  readonly externalId?: string;          // Stripe subscription ID
  readonly createdAt: ISODateTime;
  readonly updatedAt: ISODateTime;
}

/**
 * SubscriptionChange - Tracks subscription modifications
 */
export interface SubscriptionChange {
  readonly id: UUID;
  readonly subscriptionId: UUID;
  readonly type: ChangeType;
  readonly previousPlanId?: UUID;
  readonly newPlanId?: UUID;
  readonly previousSeats?: number;
  readonly newSeats?: number;
  readonly effectiveAt: ISODateTime;
  readonly processedAt?: ISODateTime;
  readonly createdAt: ISODateTime;
}

// ============================================================================
// DTOs
// ============================================================================

/**
 * Data required to create a new subscription
 */
export interface CreateSubscriptionData {
  readonly tenantId: TenantId;
  readonly planId: UUID;
  readonly billingCycle: BillingCycle;
  readonly seats?: PositiveInt;          // Defaults to 1
  readonly trialEndsAt?: ISODateTime;    // Optional trial
  readonly externalId?: string;
}

/**
 * Data for updating a subscription
 */
export interface UpdateSubscriptionData {
  readonly planId?: UUID;
  readonly billingCycle?: BillingCycle;
  readonly seats?: PositiveInt;
  readonly status?: SubscriptionStatus;
  readonly cancellationReason?: string;
}

/**
 * Data for scheduling a subscription change
 */
export interface ScheduleChangeData {
  readonly type: ChangeType;
  readonly newPlanId?: UUID;
  readonly newSeats?: number;
  readonly effectiveAt: ISODateTime;
}
```

---

## Examples by Layer

### Existence Layer (Foundation)

**File:** `/packages/domain/entities/existence/tenant.ts`

```typescript
export type TenantStatus = 'active' | 'suspended' | 'deleted';
export type TenantTier = 'free' | 'starter' | 'professional' | 'enterprise';

export interface Tenant {
  readonly id: TenantId;
  readonly name: string;
  readonly slug: string;
  readonly tier: TenantTier;
  readonly status: TenantStatus;
  readonly settings: TenantSettings;
  readonly metadata: TenantMetadata;
  readonly createdAt: ISODateTime;
  readonly updatedAt: ISODateTime;
  readonly deletedAt?: ISODateTime;
}
```

**Characteristics:**
- No `tenantId` (Tenant is the tenant itself)
- Simple, foundational
- Soft delete support (`deletedAt`)

---

### Identity Layer

**File:** `/packages/domain/entities/identity/user.ts`

```typescript
export type UserStatus = 'active' | 'inactive' | 'suspended';

export interface User {
  readonly id: UserId;
  readonly tenantId: TenantId;           // ← Multi-tenant
  readonly organizationId?: OrganizationId;
  readonly email: Email;                  // ← Branded type
  readonly name: string;
  readonly status: UserStatus;
  readonly lastLoginAt?: ISODateTime;
  readonly createdAt: ISODateTime;
  readonly updatedAt: ISODateTime;
}
```

**Characteristics:**
- Multi-tenant (`tenantId`)
- References Existence layer (OrganizationId)
- Uses branded Email type

---

### Commercial Layer

**File:** `/packages/domain/entities/commercial/plan.ts`

```typescript
export type PlanStatus = 'active' | 'deprecated' | 'archived';
export type PlanVisibility = 'public' | 'private' | 'internal';

export interface Plan {
  readonly id: UUID;
  // NO tenantId - Plans are global
  readonly name: string;
  readonly slug: string;
  readonly status: PlanStatus;
  readonly visibility: PlanVisibility;
  readonly pricing: PlanPricing;
  readonly features: PlanFeatures;
  readonly limits: PlanLimits;
  readonly createdAt: ISODateTime;
  readonly updatedAt: ISODateTime;
}
```

**Characteristics:**
- Global entity (no `tenantId`)
- Complex nested configuration
- Visibility controls

---

### Operational Layer

**File:** `/packages/domain/entities/operational/feature-flag.ts`

```typescript
export interface FeatureFlag {
  readonly id: UUID;
  // NO tenantId - Feature flags are global
  readonly key: string;
  readonly name: string;
  readonly description?: string;
  readonly isEnabled: boolean;
  readonly rules: readonly FeatureRule[];
  readonly createdAt: ISODateTime;
  readonly updatedAt: ISODateTime;
}

export interface FeatureRule {
  readonly id: string;
  readonly priority: number;
  readonly conditions: readonly FeatureCondition[];
  readonly enabled: boolean;
}
```

**Characteristics:**
- Global (no tenantId)
- Rules-based logic
- Context-dependent evaluation

---

## Common Mistakes

### ❌ Mutable Fields

```typescript
// WRONG - fields not readonly
export interface User {
  id: UserId;
  email: string;
}
```

**Fix:** Add `readonly` to all fields.

---

### ❌ Missing Multi-tenancy

```typescript
// WRONG - tenant-scoped entity without tenantId
export interface Customer {
  readonly id: UUID;
  readonly name: string;
  // Missing tenantId!
}
```

**Fix:** Add `readonly tenantId: TenantId` for tenant-scoped entities.

---

### ❌ Using String Instead of Branded Types

```typescript
// WRONG - using string for IDs
export interface User {
  readonly id: string;
  readonly tenantId: string;
}
```

**Fix:** Use branded types: `UserId`, `TenantId`.

---

### ❌ Including Audit Fields in DTOs

```typescript
// WRONG - DTOs shouldn't have audit fields
export interface CreateUserData {
  readonly email: string;
  readonly createdAt: ISODateTime;  // ❌ Generated by system
  readonly id: UUID;                 // ❌ Generated by system
}
```

**Fix:** Only include fields that the caller provides.

---

### ❌ Flat Configuration Objects

```typescript
// WRONG - 50 flat fields
export interface Settings {
  readonly brandingLogo: string;
  readonly brandingColor: string;
  readonly securityMfa: boolean;
  // ... 47 more fields
}
```

**Fix:** Use nested configuration interfaces.

---

## Quick Checklist

Before committing a new entity file:

- [ ] File header with JSDoc
- [ ] Imports from `@odin/core-contracts` use `import type`
- [ ] Status types defined as string literal unions
- [ ] All entity fields are `readonly`
- [ ] Branded types used for IDs
- [ ] `tenantId` included if entity is tenant-scoped
- [ ] Complex config split into nested interfaces
- [ ] DTOs use `CreateXData`, `UpdateXData` naming
- [ ] DTOs don't include `id`, `createdAt`, `updatedAt`
- [ ] Constants exported if defaults needed
- [ ] Everything is exported (no private types)

---

## File Paths Reference

**Entity files located in:**
- `/packages/domain/entities/existence/` - Foundation layer
- `/packages/domain/entities/identity/` - Identity context
- `/packages/domain/entities/commercial/` - Business models
- `/packages/domain/entities/operational/` - Runtime controls
- `/packages/domain/entities/temporal/` - Time-bound data
- `/packages/domain/entities/integration/` - External systems
- `/packages/domain/entities/process-mining/` - Process mining domain

**Each layer has an `index.ts` that exports all entities in that layer.**

---

## Additional Resources

- **Repository Patterns:** See `repository-patterns.md`
- **Event Patterns:** See `event-patterns.md`
- **Type Patterns:** See `type-patterns.md`
- **Architecture:** See `architecture-overview.md`
