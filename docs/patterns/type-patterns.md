# Type Patterns - Core Contracts

> **Purpose:** Understanding the core-contracts type system
> **Prevents:** 1 hour searching for types

## Available Branded IDs

**Identity:**
- `TenantId`, `UserId`, `OrganizationId`, `SessionId`

**Data:**
- `DataPoolId`, `DataModelId`, `EventLogId`, `ConnectionId`, `JobId`

**Process Mining:**
- `ProcessModelId`, `CaseId`, `ActivityId`, `EventId`, `ObjectId`, `ObjectTypeId`

**Automation:**
- `WorkflowId`, `ActionFlowId`

**Studio:**
- `DashboardId`, `ViewId`, `ComponentId`, `PackageId`, `SpaceId`

## Common Types

**Temporal:**
- `ISODateTime` - ISO 8601 datetime string
- `UnixTimestamp` - Unix timestamp (ms)
- `Duration` - Duration in milliseconds
- `DateRange` - Start/end date range

**Semantic:**
- `Email` - Validated email
- `URL` - URL string
- `JSONString` - JSON string
- `Percentage` - 0-100 value
- `PositiveInt` - Integer > 0
- `NonNegativeInt` - Integer >= 0
- `UUID` - Generic UUID

**Results:**
- `Result<T, E>` - Success or Failure
- `AsyncResult<T, E>` - Async Result
- `Option<T>` - Some or None
- `AsyncOption<T>` - Async Option

## Query & Pagination

```typescript
PageRequest {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

PageResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}
```

## When to Add New Branded Types

**Add to core-contracts when:**
- Used across multiple packages
- Fundamental process mining ID
- Prevent type confusion is critical

**Define locally when:**
- Only used in one entity file
- Layer-specific ID

**Location:** `/packages/core-contracts/types/identifiers.ts`

## Error Handling

```typescript
// Error factories
createValidationError(message, fields?)
createNotFoundError(resource, id)
createUnauthorizedError()
createForbiddenError()
createConflictError()
createInternalError()

// Process mining errors (5xxx)
INVALID_EVENT_LOG (5001)
DISCOVERY_FAILED (5002)
CONFORMANCE_CHECK_FAILED (5003)
```

## Import Pattern

```typescript
import type {
  UUID, TenantId, UserId,
  ISODateTime, Duration,
  AsyncResult, PageRequest, PageResponse
} from '@odin/core-contracts';
```

**Reference:** `/packages/core-contracts/types/identifiers.ts`
