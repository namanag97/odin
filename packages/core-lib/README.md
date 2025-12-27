# @odin/core-lib

> L0 Foundation Layer - Shared implementations and utilities for the Process Intelligence Platform

## Overview

This package provides default implementations and utility functions for the contracts defined in `@odin/core-contracts`. It includes:

- **Result/Option helpers** - Functional utilities for working with Result and Option types
- **Logger implementations** - Console and Noop logger implementations
- **Utility functions** - Date, string, and validation helpers

## Installation

```bash
# Within the monorepo
bun add @odin/core-lib
```

## Dependencies

- `@odin/core-contracts` - Peer dependency for type definitions

## Module Structure

| Module            | Description                            |
| ----------------- | -------------------------------------- |
| `implementations` | Result helpers, Logger implementations |
| `utils`           | Date, String, Validation utilities     |

## Quick Reference

### Result Helpers

```typescript
import {
  success,
  failure,
  isSuccess,
  isFailure,
  mapResult,
  flatMapResult,
  unwrap,
  unwrapOr,
  tryCatch,
  combineResults,
} from "@odin/core-lib";

// Create results
const ok = success(42);
const err = failure({ code: "NOT_FOUND", message: "Not found" });

// Transform results
const doubled = mapResult(ok, (x) => x * 2); // success(84)

// Chain operations
const result = flatMapResult(ok, (x) =>
  x > 0 ? success(x) : failure({ code: "INVALID", message: "Must be positive" })
);

// Unwrap safely
const value = unwrapOr(result, 0);

// Async try-catch
const asyncResult = await tryCatch(
  () => fetchUser(id),
  (e) => createNotFoundError("User", id)
);
```

### Option Helpers

```typescript
import {
  some,
  none,
  fromNullable,
  isSome,
  isNone,
  mapOption,
  getOrDefault,
  toNullable,
} from "@odin/core-lib";

// Create options
const present = some("value");
const absent = none();
const fromNull = fromNullable(maybeNull); // Some or None

// Transform
const upper = mapOption(present, (s) => s.toUpperCase());

// Extract
const value = getOrDefault(option, "default");
const nullable = toNullable(option); // string | null
```

### Logger

```typescript
import { ConsoleLogger, NoopLogger, createLogger } from "@odin/core-lib";

// Create console logger
const logger = new ConsoleLogger("info");
logger.info("Application started", { port: 3000 });
logger.error("Failed to connect", { error });

// Create noop logger (for testing)
const silentLogger = new NoopLogger();

// Create with context
const requestLogger = createRequestLogger(logger, { requestId: "abc-123" });
```

### Date Utilities

```typescript
import {
  now,
  nowMs,
  toISOString,
  addDays,
  addHours,
  diffMs,
  isPast,
  isFuture,
  isExpired,
  startOfDay,
  endOfDay,
  formatDuration,
  parseDuration,
} from "@odin/core-lib";

const timestamp = now(); // ISO string
const ms = nowMs(); // Unix milliseconds
const tomorrow = addDays(now(), 1);
const diff = diffMs(start, end);

// Duration formatting
formatDuration(3661000); // "1h 1m 1s"
parseDuration("2h 30m"); // 9000000 (ms)
```

### String Utilities

```typescript
import {
  toCamelCase,
  toSnakeCase,
  toKebabCase,
  slugify,
  truncate,
  padZeros,
  escapeHtml,
  stripHtml,
  randomString,
  shortId,
} from "@odin/core-lib";

toCamelCase("hello_world"); // "helloWorld"
toSnakeCase("helloWorld"); // "hello_world"
slugify("Hello World!"); // "hello-world"
truncate("Long text...", 10); // "Long te..."
shortId(); // "k7x9m2p1"
```

### Validation Utilities

```typescript
import {
  isEmail,
  isUrl,
  isUuid,
  isNonEmpty,
  hasMinLength,
  hasMaxLength,
  isValidNumber,
  isPositive,
  isInRange,
  isValidJson,
  tryParseJson,
} from "@odin/core-lib";

isEmail("test@example.com"); // true
isUrl("https://example.com"); // true
isUuid("550e8400-e29b-41d4-a716-446655440000"); // true
isInRange(5, 1, 10); // true

const json = tryParseJson('{"a":1}'); // Option<{a: number}>
```

## Import Patterns

```typescript
// Main exports (recommended)
import { success, failure, ConsoleLogger, now, isEmail } from "@odin/core-lib";

// Submodule imports (for tree-shaking)
import { success, failure, tryCatch } from "@odin/core-lib/implementations";
import { now, addDays, formatDuration } from "@odin/core-lib/utils";
```

## Layer Imports

This is the **L0 foundation layer**. It can be imported by:

- ✅ L1 Domain Layer
- ✅ L2 Application Layer
- ✅ L3 Infrastructure Layer
- ✅ L4 Presentation Layer

It **only** imports from `@odin/core-contracts` (peer dependency).
