# Changelog

All notable changes to `@odin/core-contracts` will be documented in this file.

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
