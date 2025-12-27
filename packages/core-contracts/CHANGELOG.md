# Changelog

All notable changes to `@odin/core-contracts` will be documented in this file.

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
