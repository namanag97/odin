# Architecture Overview - Odin Layered Architecture

> **Purpose:** Understanding the layered architecture
> **Prevents:** 1-2 hours of architecture exploration

## Layered Structure

```
┌─────────────────────────────────────────┐
│  L4: Apps (web, worker)                 │
├─────────────────────────────────────────┤
│  L3: API (@odin/api)                    │
├─────────────────────────────────────────┤
│  L2: Services (@odin/services)          │
├─────────────────────────────────────────┤
│  L1: Domain (@odin/domain) [DDD Layer]  │
├─────────────────────────────────────────┤
│  I1-I4: Infrastructure (@odin/infra)    │
├─────────────────────────────────────────┤
│  L0: Core (@odin/core-contracts)        │
└─────────────────────────────────────────┘
```

## Dependency Rules

**Bottom-up only:**
- L4 → L3, L2, L1, I*, L0
- L3 → L2, L1, L0
- L2 → L1, I*, L0
- L1 → L0 **only**
- I* → L1, L0
- L0 → nothing

**Domain layer NEVER imports from:**
- Infrastructure
- Services
- API
- Apps

## Ontological Layers (Domain Entities)

```
OPERATIONAL: ExtendedTenantSettings, FeatureFlag, SystemConfig
    ↓
COMMERCIAL: Plan, Subscription, Invoice, Payment, Usage
    ↓
IDENTITY: User, Role, Session, Team, MfaDevice
    ↓
EXISTENCE: Tenant, Organization, Environment
```

**New domains added as peers:**
- PROCESS-MINING: DataPool, Table, DataModel, ProcessModel, Case, OCEL*

## Domain Layer Structure

```
packages/domain/
├── entities/
│   ├── existence/
│   ├── identity/
│   ├── commercial/
│   ├── operational/
│   ├── temporal/
│   ├── integration/
│   ├── process-mining/
│   └── index.ts
├── repositories/
│   ├── existence/
│   ├── identity/
│   ├── commercial/
│   ├── operational/
│   ├── temporal/
│   ├── integration/
│   ├── process-mining/
│   └── index.ts
├── events/
│   ├── tenant-events.ts
│   ├── user-events.ts
│   ├── commercial-events.ts
│   ├── process-mining-events.ts
│   └── index.ts
└── index.ts
```

## Process Mining Sublayers

```
PROCESS MODEL SUBLAYER
  - ProcessModel (main entity)
  - PetriNet, ProcessTree, DFG, BPMN, OCELPetriNet
    ↓
OCEL DATA MODEL SUBLAYER
  - DataModel, OCELEvent, OCELObject, Case, Variant
    ↓
DATA INTEGRATION SUBLAYER
  - DataPool, Table
```

## Core Contracts (L0)

**Version:** 1.0.x (LOCKED)
**Breaking changes require:** 2.0.0

**Contents:**
- Branded ID types
- Common types (ISODateTime, Duration, etc.)
- Result/Option types
- Error types
- Query/pagination types
- **Zero runtime dependencies**

## File Organization

**Entity files:**
1. File header
2. Imports
3. Status types
4. Configuration interfaces
5. Main entity
6. Sub-entities
7. DTOs
8. Constants

**Repository files:**
1. File header
2. Imports
3. Interface with sections:
   - Queries
   - Commands
   - Domain-specific
4. Supporting types

**Event files:**
1. Event constants
2. Payload interfaces
3. Typed event aliases

## Export Pattern

Each layer has `index.ts`:
```typescript
// packages/domain/entities/process-mining/index.ts
export * from './data-pool';
export * from './table';
export * from './data-model';
// ...
```

Main domain index aggregates:
```typescript
// packages/domain/index.ts
export * from './entities';
export * from './repositories';
export * from './events';
```

## Multi-Tenancy

**All data is tenant-scoped:**
- Every entity has `tenantId: TenantId`
- Queries filter by tenant
- **Exceptions:** Global entities (Plan, FeatureFlag, SystemConfig)

## Key Principles

1. **Immutability:** All entity fields `readonly`
2. **Type Safety:** Branded types prevent ID confusion
3. **Explicit Errors:** AsyncResult<T> instead of exceptions
4. **Interface Segregation:** Repository interfaces in domain, implementations in infra
5. **Domain Purity:** Domain layer has NO infrastructure dependencies

## References

- **Entities:** See `entity-patterns.md`
- **Repositories:** See `repository-patterns.md`
- **Events:** See `event-patterns.md`
- **Types:** See `type-patterns.md`
