# @odin/core-contracts

> L0 Foundation Layer - Shared types, interfaces, and contracts for the Process Intelligence Platform

## Overview

This package contains all shared type definitions, interfaces, and contracts used across all layers of the application. It is designed with:

- **Zero runtime dependencies** - Pure TypeScript types
- **Zero business logic** - Only structural definitions
- **Stable APIs** - Rarely-changing foundation

## Installation

```bash
# Within the monorepo
bun add @odin/core-contracts
```

## Module Structure

| Module      | Description                                                     |
| ----------- | --------------------------------------------------------------- |
| `types`     | Result, Option, Pagination, Identifiers, Query types            |
| `errors`    | ErrorCode enum, AppError interface, error factories             |
| `auth`      | AuthContext, Permissions, Roles                                 |
| `contracts` | Logger, Storage, Cache, EventBus, IdGenerator, DateTimeProvider |
| `enums`     | DataType, ConnectionType, ExecutionStatus, ComponentType, etc.  |

## Quick Reference

### Result Type

All operations return `Result<T, E>` for explicit error handling:

```typescript
import { Result, AppError } from "@odin/core-contracts";

function getUser(id: string): Result<User, AppError> {
  // Returns { ok: true, value: user } or { ok: false, error: appError }
}
```

### Option Type

For values that may or may not exist:

```typescript
import { Option } from "@odin/core-contracts";

function findUser(email: string): Option<User> {
  // Returns { some: true, value: user } or { some: false }
}
```

### Pagination

```typescript
import { PageRequest, PageResponse } from "@odin/core-contracts";

const request: PageRequest = {
  page: 1,
  limit: 20,
  sortBy: "createdAt",
  sortDir: "desc",
};
// Returns PageResponse<T> with data, page, total, hasNext, hasPrev
```

### Auth Context

Every authenticated request includes:

```typescript
import { AuthContext } from "@odin/core-contracts";

interface AuthContext {
  userId: string;
  tenantId: string;
  roles: string[];
  permissions: string[];
  sessionId?: string;
  email?: string;
}
```

### Error Handling

```typescript
import {
  ErrorCode,
  createNotFoundError,
  createValidationError,
} from "@odin/core-contracts";

// Create typed errors
const error = createNotFoundError("User", userId);
const validationError = createValidationError([
  { field: "email", message: "Invalid email format" },
]);
```

### Branded Identifiers

Type-safe ID handling:

```typescript
import { TenantId, UserId, asTenantId, asUserId } from "@odin/core-contracts";

const tenantId: TenantId = asTenantId("tenant-uuid");
const userId: UserId = asUserId("user-uuid");
// These cannot be accidentally swapped!
```

## Import Patterns

```typescript
// Main exports (recommended)
import { Result, AuthContext, ErrorCode } from "@odin/core-contracts";

// Submodule imports (for tree-shaking)
import { PageRequest, PageResponse } from "@odin/core-contracts/types";
import { AuthContext } from "@odin/core-contracts/auth";
import { Logger, Cache } from "@odin/core-contracts/contracts";
import { AppError, createNotFoundError } from "@odin/core-contracts/errors";
import { DataType, ExecutionStatus } from "@odin/core-contracts/enums";
```

## Layer Imports

This is the **L0 foundation layer**. It can be imported by:

- ✅ L1 Domain Layer
- ✅ L2 Application Layer
- ✅ L3 Infrastructure Layer
- ✅ L4 Presentation Layer

It **should not** import from any other layer.
