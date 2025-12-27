# @odin/core-contracts

> L0 Foundation Layer - Shared types, interfaces, and contracts for the Process Intelligence Platform

## Overview

This package contains all shared type definitions, interfaces, and contracts used across all layers of the application. It is designed with:

- **Zero runtime dependencies** - Pure TypeScript types
- **Zero business logic** - Only structural definitions
- **Stable APIs** - Rarely-changing foundation
- **Comprehensive tests** - 126 unit tests with full coverage

## Requirements

> [!IMPORTANT]
> This package uses the Web Crypto API (`crypto.randomUUID()`) for generating trace IDs and event IDs.
>
> - **Node.js**: v19+ (or v16+ with `--experimental-global-webcrypto` flag)
> - **Bun**: All versions supported
> - **Browser**: Modern browsers with Web Crypto API support

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
  // Returns { success: true, data: user } or { success: false, error: appError }
}

// Type narrowing
const result = getUser("123");
if (result.success) {
  console.log(result.data); // TypeScript knows data exists
} else {
  console.error(result.error.message); // TypeScript knows error exists
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
  createNotFoundError,
  createValidationError,
  isNotFoundError,
} from "@odin/core-contracts";

// Create typed errors
const error = createNotFoundError("User", userId);
const validationError = createValidationError([
  { field: "email", message: "Invalid email format" },
]);

// Type guards for error handling
if (isNotFoundError(error)) {
  console.log(`Resource: ${error.details.resource}`);
}
```

### Branded Identifiers

Type-safe ID handling - prevents accidentally swapping different ID types:

```typescript
import {
  TenantId,
  UserId,
  asTenantId,
  asUserId,
  asDataPoolId,
  asProcessModelId,
} from "@odin/core-contracts";

const tenantId: TenantId = asTenantId("tenant-uuid");
const userId: UserId = asUserId("user-uuid");
// These cannot be accidentally swapped at compile time!

// All ID types have factory functions:
// asTenantId, asUserId, asSessionId, asPoolId, asEventLogId,
// asConnectionId, asJobId, asModelId, asCaseId, asActivityId,
// asWorkflowId, asActionFlowId, asDashboardId, asViewId, asComponentId,
// asOrganizationId, asDataPoolId, asDataModelId, asProcessModelId,
// asObjectTypeId, asObjectId, asEventId, asPackageId, asSpaceId
```

## Import Patterns

```typescript
// Main exports (recommended)
import { Result, AuthContext, createNotFoundError } from "@odin/core-contracts";

// Submodule imports (for tree-shaking)
import { PageRequest, PageResponse } from "@odin/core-contracts/types";
import { AuthContext } from "@odin/core-contracts/auth";
import { Logger, Cache } from "@odin/core-contracts/contracts";
import { AppError, createNotFoundError } from "@odin/core-contracts/errors";
import { DataType, ExecutionStatus } from "@odin/core-contracts/enums";
```

## Testing

```bash
# Run all tests
bun run test

# Run tests in watch mode
bun run test:watch

# Run tests with coverage
bun run test:coverage
```

## Layer Imports

This is the **L0 foundation layer**. It can be imported by:

- ✅ L1 Domain Layer
- ✅ L2 Application Layer
- ✅ L3 Infrastructure Layer
- ✅ L4 Presentation Layer

It **should not** import from any other layer.

## API Stability

> [!NOTE]
> This layer is now **LOCKED**. Breaking changes require a major version bump (2.0.0).
> Additive changes (new types, new fields) are allowed in minor versions (1.1.0, 1.2.0).
