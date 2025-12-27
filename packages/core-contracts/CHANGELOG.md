# Changelog

All notable changes to `@odin/core-contracts` will be documented in this file.

## [1.0.2] - 2025-12-27

### ✅ Added

#### ID Factory Functions

- **Complete ID Factory Coverage**: Added 9 missing `asXxxId` factory functions:
  - `asOrganizationId`, `asDataPoolId`, `asDataModelId`, `asProcessModelId`
  - `asObjectTypeId`, `asObjectId`, `asEventId`, `asPackageId`, `asSpaceId`

#### Unit Tests

- **Full Test Suite**: Added 126 unit tests across 7 test files:
  - `types/result.test.ts` - Result and Option type narrowing
  - `types/identifiers.test.ts` - UUID validation and all factory functions
  - `types/query.test.ts` - Filter operators, type guards, filter factories
  - `errors/types.test.ts` - All error factories and type guards
  - `auth/context.test.ts` - Auth and service context utilities
  - `auth/permissions.test.ts` - Permission checks and utilities
  - `auth/roles.test.ts` - Role resolution and system role permissions

#### Development Infrastructure

- **Vitest Setup**: Added Vitest for unit testing with v8 coverage
- **Test Scripts**: Added `test`, `test:watch`, `test:coverage` npm scripts
- **Vitest Config**: Created `vitest.config.ts` for test configuration

### 🔧 Improved

#### Type Safety

- **Readonly Interfaces**: Made `ValidationErrorDetail` interface properties readonly for immutability
- **DateRange Type Fix**: Replaced deprecated `Timestamp` with `ISODateTime` in `DateRange` interface
- **DateRange Readonly**: Made `DateRange` interface properties readonly

#### Documentation

- **README Updates**:
  - Added crypto API requirements section (Node.js v19+ or flag)
  - Corrected Result type examples (uses `success`/`data`, not `ok`/`value`)
  - Added complete list of ID factory functions
  - Added testing section with commands
  - Added API stability notice

### ✅ Verification

- All 126 tests pass
- TypeScript compilation passes
- All exports verified

---

## [1.0.1] - 2025-12-27

### 🐛 Fixed

#### `errors/types.ts`

- **ErrorCode Type Safety**: Changed `ErrorCode` from enum-like value usage to proper string literal types (`'VALIDATION_FAILED'`, `'ENTITY_NOT_FOUND'`, etc.) to fix runtime/type mismatch
- **Error Metadata**: Added `errorMeta()` helper function to ensure all error factories include required `timestamp` and `traceId` fields
- **Error Cause Types**: Fixed `cause` type in `createInternalError` - changed from generic `Error` to `AppError` for proper error chain typing

#### `contracts/datetime.ts`

- **Duration Branding**: Added explicit `as Duration` casts to all duration factory functions to ensure proper branded type returns

#### `contracts/storage.ts`

- **Cross-Platform Compatibility**: Replaced Node-specific `Buffer` type with `Uint8Array` for cross-platform compatibility (Node, Bun, browser)

#### `index.ts`

- **Export Fixes**: Changed `ErrorCode` export from value export to type-only export (`export type { ErrorCode }`) since it's a type alias, not a runtime value

### ✅ Verification

- Both `@odin/core-contracts` and dependent packages now pass TypeScript type checking without errors

## [1.0.0] - 2025-12-27

### 🔒 Initial Locked Release

This is the first stable, locked release of the L0 Core Contracts layer.

### Added

- **Result Types**: `Result<T, E>`, `Success`, `Failure`, `Option<T>`, `AsyncResult<T>`
- **Pagination**: `PageRequest`, `PageResponse`, `CursorPageRequest`, `CursorPageResponse`
- **Identifiers**: Branded types for `TenantId`, `UserId`, `SessionId`, `PoolId`, `JobId`, etc.
- **Common Types**: `ISODateTime`, `Duration`, `Email`, `URL`, `CorrelationId`, `TraceId`
- **Errors**: `AppError` with categorized error codes (1xxx-5xxx), factory functions, HTTP mappings
- **Auth**: `AuthContext`, `ServiceContext`, `Permission`, `Role` definitions
- **Contracts**: `Logger`, `Storage`, `Cache`, `EventBus`, `IdGenerator`, `DateTimeProvider`
- **Enums**: `DataType`, `ConnectionType`, `ExecutionStatus`, `ComponentType`, PM4Py-aligned types

### Stability

> **This layer is now LOCKED.** Breaking changes require a major version bump (2.0.0).
> Additive changes (new types, new fields) are allowed in minor versions (1.1.0, 1.2.0).
