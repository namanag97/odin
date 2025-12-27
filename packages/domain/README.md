# @odin/domain

> L1 Domain Layer - Entities, Repositories, and Domain Events for the Process Intelligence Platform

## Overview

This package implements the **Domain Layer** following Domain-Driven Design (DDD) principles. It contains:

- **Entities** - Core domain objects with identity and lifecycle
- **Repositories** - Data access contracts (interfaces only, no implementations)
- **Domain Events** - Events published when domain state changes

## Design Principles

| Principle               | Description                                    |
| ----------------------- | ---------------------------------------------- |
| **Pure Contracts**      | Repository interfaces define _what_, not _how_ |
| **Zero Infrastructure** | No database, HTTP, or external dependencies    |
| **Immutable Entities**  | All entity fields are `readonly`               |
| **Result-Based**        | All repository methods return `AsyncResult<T>` |
| **Tenant-Scoped**       | Multi-tenancy built into every aggregate       |

## Ontological Layers

The domain is organized into ontological layers representing different concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                    OPERATIONAL LAYER                        │
│  Runtime config, feature flags, system settings             │
├─────────────────────────────────────────────────────────────┤
│                    COMMERCIAL LAYER                         │
│  Plans, subscriptions, billing, usage tracking              │
├─────────────────────────────────────────────────────────────┤
│                     IDENTITY LAYER                          │
│  Users, roles, sessions, teams, MFA, identity providers     │
├─────────────────────────────────────────────────────────────┤
│                    EXISTENCE LAYER                          │
│  Tenants, organizations, environments                       │
└─────────────────────────────────────────────────────────────┘
```

## Module Structure

### Entities

| Layer           | Entities                                                                    |
| --------------- | --------------------------------------------------------------------------- |
| **Existence**   | `Tenant`, `Organization`, `Environment`                                     |
| **Identity**    | `User`, `Role`, `Session`, `Team`, `MfaDevice`, `IdentityProvider`          |
| **Commercial**  | `Plan`, `Subscription`, `Invoice`, `PaymentMethod`, `UsageRecord`, `Coupon` |
| **Operational** | `ExtendedTenantSettings`, `FeatureFlag`, `SystemConfig`                     |

### Repositories

| Layer           | Repositories                                                                                                                            |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| **Existence**   | `ITenantRepository`, `IOrganizationRepository`, `IEnvironmentRepository`                                                                |
| **Identity**    | `IUserRepository`, `IRoleRepository`, `ISessionRepository`, `ITeamRepository`, `IMfaDeviceRepository`, `IIdentityProviderRepository`    |
| **Commercial**  | `IPlanRepository`, `ISubscriptionRepository`, `IInvoiceRepository`, `IPaymentMethodRepository`, `IUsageRepository`, `ICouponRepository` |
| **Operational** | `ITenantSettingsRepository`, `IFeatureFlagRepository`, `ISystemConfigRepository`                                                        |

## Quick Reference

### Entities

All entities are immutable with branded identifiers:

```typescript
import { Tenant, TenantStatus, TenantTier } from "@odin/domain";

const tenant: Tenant = {
  id: asTenantId("uuid"),
  slug: "acme-corp",
  name: "Acme Corporation",
  status: "active",
  tier: "professional",
  settings: {
    /* ... */
  },
  metadata: {
    /* ... */
  },
  createdAt: "2024-01-01T00:00:00Z" as ISODateTime,
  updatedAt: "2024-01-01T00:00:00Z" as ISODateTime,
};
```

### Repositories

All repository methods return `AsyncResult<T>`:

```typescript
import { ITenantRepository, Tenant } from "@odin/domain";
import { AsyncResult, TenantId } from "@odin/core-contracts";

class TenantRepository implements ITenantRepository {
  async findById(id: TenantId): AsyncResult<Tenant | null> {
    // Implementation in infrastructure layer
  }
}
```

### Domain Events

Events use typed payloads:

```typescript
import { SubscriptionCreatedEvent, CommercialEventTypes } from "@odin/domain";

// Publish when subscription is created
const event: SubscriptionCreatedEvent = createEvent(
  CommercialEventTypes.SUBSCRIPTION_CREATED,
  { subscriptionId, tenantId, planId, status },
  { source: "billing-service" }
);
```

## Import Patterns

```typescript
// Main exports (recommended)
import { Tenant, ITenantRepository, User, IUserRepository } from "@odin/domain";

// Submodule imports
import { Tenant, Plan, Subscription } from "@odin/domain/entities";
import { ITenantRepository, IPlanRepository } from "@odin/domain/repositories";
import {
  SubscriptionCreatedEvent,
  PaymentSucceededEvent,
} from "@odin/domain/events";
```

## Layer Dependencies

This is the **L1 Domain Layer**:

```
L0 Core Contracts  ←─  L1 Domain  ←─  L2 Application
       ↑                   ↑                ↑
       │                   │                │
    (imports)          (imports)        (imports)
```

- ✅ Imports from: `@odin/core-contracts`, `@odin/core-lib`
- ❌ Must NOT import from: Application, Infrastructure, or Presentation layers

## Naming Conventions

| Type       | Convention              | Example                       |
| ---------- | ----------------------- | ----------------------------- |
| Entity     | PascalCase noun         | `Subscription`, `FeatureFlag` |
| Repository | `I{Entity}Repository`   | `ISubscriptionRepository`     |
| DTO        | `{Action}{Entity}Data`  | `CreateSubscriptionData`      |
| Event      | `{Entity}{Action}Event` | `SubscriptionCreatedEvent`    |
| Event Type | `{entity}.{action}`     | `subscription.created`        |

## Design Decisions

### Why `ExtendedTenantSettings` instead of `TenantSettings`?

The existence layer already defines a basic `TenantSettings` interface for core tenant configuration. The operational layer's `ExtendedTenantSettings` adds branding, security policies, notification preferences, and process mining defaults without conflicting with the base type.

### Why no Repository Implementations?

Repository implementations depend on infrastructure (databases, ORMs). Keeping them separate ensures:

- Domain layer remains pure and testable
- Infrastructure can be swapped without domain changes
- Clear separation of concerns per DDD

### Why `AsyncResult<T>` everywhere?

- Explicit error handling without exceptions
- Type-safe error propagation
- Consistent API across all operations
- Easy to compose and transform

## See Also

- [Domain Entities](./entities/index.ts)
- [Repository Interfaces](./repositories/index.ts)
- [Domain Events](./events/index.ts)
