# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Odin is a **Process Intelligence Platform** built with a layered architecture following Domain-Driven Design (DDD) principles. The platform supports both OCEL 2.0 (object-centric) and case-centric process mining, with semantic layer, automation, and studio UI capabilities.

**Runtime**: Bun (preferred) and Node.js 19+
**Package Manager**: pnpm 9.0.0
**Database**: SQLite with WAL mode (Bun's native SQLite)

## Commands

### Development

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Type checking across all packages
pnpm typecheck

# Lint all packages
pnpm lint

# Run tests across all packages
pnpm test

# Run all packages in dev mode (parallel)
pnpm dev
```

### Package-Specific Commands

```bash
# Work in a specific package
cd packages/core-contracts

# Run tests (uses vitest)
pnpm test              # Run once
pnpm test:watch        # Watch mode
pnpm test:coverage     # With coverage

# Type check
pnpm typecheck

# API server (packages/api)
cd packages/api
pnpm dev               # Development with watch
pnpm start             # Production
```

### Database

```bash
# Initialize database (from repo root)
bun run database/init.ts

# With options
bun run database/init.ts --force    # Drop existing DB
bun run database/init.ts --seed     # Load seed data
bun run database/init.ts --verbose  # Detailed output

# Default database location: ./odin.db
# Override with: DATABASE_PATH=./custom.db
```

## Architecture

### Layered Structure

The codebase follows a strict layered architecture with clear dependency rules:

```
┌─────────────────────────────────────────────────────────┐
│  L4: Apps (web, worker)                                 │
│      - Frontend applications                            │
│      - Background workers                               │
├─────────────────────────────────────────────────────────┤
│  L3: API (@odin/api)                                    │
│      - HTTP routes and controllers                      │
│      - Middleware (auth, validation, error handling)    │
│      - Uses Hono framework                              │
├─────────────────────────────────────────────────────────┤
│  L2: Services (@odin/services)                          │
│      - Business logic / Use cases                       │
│      - Orchestrates domain + infrastructure             │
├─────────────────────────────────────────────────────────┤
│  L1: Domain (@odin/domain) [DDD Layer]                  │
│      - Entities (immutable, readonly fields)            │
│      - Repository interfaces (no implementations)       │
│      - Domain events                                    │
│      - Returns AsyncResult<T> for all operations        │
├─────────────────────────────────────────────────────────┤
│  I1-I4: Infrastructure (@odin/infra)                    │
│      - Database implementations                         │
│      - External integrations                            │
│      - Queue/job processing                             │
│      - Storage implementations                          │
├─────────────────────────────────────────────────────────┤
│  L0: Core (@odin/core-contracts, @odin/core-lib)        │
│      - Shared types and interfaces                      │
│      - Result/Option types                              │
│      - Error types                                      │
│      - Utility implementations                          │
│      - LOCKED at v1.0.x (breaking changes = 2.0.0)      │
└─────────────────────────────────────────────────────────┘
```

**Dependency Rules** (bottom → up only):
- L4 can import: L3, L2, L1, I1-I4, L0
- L3 can import: L2, L1, L0
- L2 can import: L1, I1-I4, L0
- L1 can import: L0 only
- I1-I4 can import: L1, L0
- L0 imports: nothing

### Domain Ontological Layers

Domain entities are organized into ontological layers (foundation → operational):

```
OPERATIONAL: ExtendedTenantSettings, FeatureFlag, SystemConfig
    ↓
COMMERCIAL: Plan, Subscription, Invoice, PaymentMethod, UsageRecord, Coupon
    ↓
IDENTITY: User, Role, Session, Team, MfaDevice, IdentityProvider
    ↓
EXISTENCE: Tenant, Organization, Environment
```

### Core Packages (@odin/core-contracts, @odin/core-lib)

**Version**: 1.0.x (LOCKED - requires major bump for breaking changes)

Key types and patterns:
- `Result<T, E>`: All operations return Result for explicit error handling
- `Option<T>`: For optional values (instead of null/undefined)
- `AsyncResult<T>`: Async operations return this
- **Branded IDs**: `TenantId`, `UserId`, etc. - prevents ID type confusion at compile time
- **Error factories**: `createNotFoundError()`, `createValidationError()`, etc.
- **Zero runtime dependencies**: Pure TypeScript types in contracts

**Requirements**: Uses Web Crypto API (`crypto.randomUUID()`) - Node.js 19+ or Node.js 16+ with `--experimental-global-webcrypto`

### Database Schema

46 tables organized in 7 sections:
1. **Minimal Identity**: tenants, users, sessions
2. **Case-Centric Process Mining**: event logs, process models, cases (XES compatible)
3. **OCEL 2.0**: objects, events, object-to-object relations (object-centric)
4. **Ontology & Knowledge**: data models, KPIs, filters, metrics
5. **Discovery & Conformance**: discovered models, variants, conformance results
6. **Analytics & Prediction**: dashboards, predictions, simulations
7. **Automation**: action flows, sensors, skills, signals, tasks

Schema files in `database/schema/` are numbered (00_, 01_, etc.) and loaded in order.

## Workspace Structure

```
odin/
├── packages/
│   ├── core-contracts/    # L0: Types, interfaces, contracts
│   ├── core-lib/          # L0: Shared implementations
│   ├── domain/            # L1: Entities, repositories, events (DDD)
│   ├── services/          # L2: Use cases, business logic
│   ├── infra/             # I1-I4: Database, queue, storage, external
│   └── api/               # L3: Routes, middleware, controllers
├── apps/
│   ├── web/               # Frontend application
│   └── worker/            # Background job processor
├── database/
│   ├── schema/            # SQL schema files (numbered)
│   ├── init.ts            # Database initialization script
│   └── generated/         # Generated types, repos, schemas
└── files/                 # File storage
```

## Key Patterns

### Result Type Pattern

All operations use `Result<T, E>` instead of throwing exceptions:

```typescript
function getUser(id: UserId): Result<User, AppError> {
  if (user) {
    return { success: true, data: user };
  }
  return { success: false, error: createNotFoundError("User", id) };
}

const result = getUser(userId);
if (result.success) {
  // TypeScript knows result.data exists
} else {
  // TypeScript knows result.error exists
}
```

### Immutable Entities

All domain entities have `readonly` fields:

```typescript
interface Tenant {
  readonly id: TenantId;
  readonly name: string;
  readonly status: TenantStatus;
  // ... all fields readonly
}
```

### Branded Identifiers

Use type-safe IDs to prevent mixing different ID types:

```typescript
import { TenantId, UserId, asTenantId, asUserId } from "@odin/core-contracts";

const tenantId: TenantId = asTenantId("uuid");
const userId: UserId = asUserId("uuid");

// This won't compile - prevents bugs at compile time:
// function foo(id: TenantId) {}
// foo(userId); // ERROR!
```

### Repository Pattern

Domain layer defines interfaces, infrastructure layer implements:

```typescript
// In @odin/domain
interface ITenantRepository {
  findById(id: TenantId): AsyncResult<Tenant | null>;
  save(tenant: Tenant): AsyncResult<void>;
}

// In @odin/infra/database
class SqliteTenantRepository implements ITenantRepository {
  // Implementation using Bun's SQLite
}
```

## Testing

- **Framework**: Vitest
- **Coverage**: Available via `pnpm test:coverage` in packages with tests
- **Location**: Tests live alongside source files as `*.test.ts`
- **Core Contracts**: 126 unit tests with full coverage

## Import Patterns

```typescript
// Main exports (recommended for app code)
import { Result, AuthContext, createNotFoundError } from "@odin/core-contracts";
import { Tenant, ITenantRepository } from "@odin/domain";

// Submodule imports (for better tree-shaking in libraries)
import { PageRequest } from "@odin/core-contracts/types";
import { Logger } from "@odin/core-contracts/contracts";
import { Tenant } from "@odin/domain/entities";
import { ITenantRepository } from "@odin/domain/repositories";
```

## Version Management

`versions.json` tracks package versions and compatibility:
- `baseline`: Development phase baseline (e.g., "2024-Q4")
- `phase`: Current development phase
- `packages`: Current versions
- `compatible`: Cross-package compatibility matrix

Core packages (@odin/core-contracts, @odin/core-lib) follow strict semantic versioning:
- Locked at 1.0.x - breaking changes require 2.0.0
- Additive changes (new types, fields) allowed in minor versions

## Common Workflows

### Adding a New Domain Entity

1. Create entity in `packages/domain/entities/{layer}/` (existence, identity, commercial, operational)
2. Add repository interface in `packages/domain/repositories/{layer}/`
3. Export from layer index files
4. Create repository implementation in `packages/infra/database/`
5. Add database schema in `database/schema/` if needed
6. Update `packages/domain/index.ts` with new exports

### Running Single Test File

```bash
cd packages/core-contracts
pnpm vitest run auth/context.test.ts
```

### Type Checking Single Package

```bash
cd packages/domain
pnpm typecheck
```

## Multi-Tenancy

All data is tenant-scoped:
- Every aggregate has a `tenantId: TenantId` field
- Queries filter by tenant
- AuthContext includes tenant context
- Database uses tenant_id column with indexes
