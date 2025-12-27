# Changelog

All notable changes to `@odin/core-lib` will be documented in this file.

## [1.0.0] - 2025-12-27

### 🔒 Initial Locked Release

This is the first stable, locked release of the L0 Core Lib layer.

### Added

- **Result Helpers**: `success`, `failure`, `isSuccess`, `isFailure`, `mapResult`, `flatMapResult`, `unwrap`, `unwrapOr`, `tryCatch`, `combineResults`
- **Option Helpers**: `some`, `none`, `isSome`, `isNone`, `fromNullable`, `mapOption`, `getOrDefault`, `toNullable`
- **Logger Implementations**: `ConsoleLogger`, `NoopLogger`, `createLogger`, `createRequestLogger`
- **Date Utilities**: `now`, `nowMs`, `toISOString`, `addDays`, `addHours`, `diffMs`, `isPast`, `isFuture`, `formatDuration`, `parseDuration`
- **String Utilities**: `toCamelCase`, `toSnakeCase`, `slugify`, `truncate`, `escapeHtml`, `randomString`, `shortId`
- **Validation Utilities**: `isEmail`, `isUrl`, `isUuid`, `hasMinLength`, `isInRange`, `isValidJson`, `tryParseJson`
- **Guards**: `assertNever`, `ensure`, `ensureDefined`, `invariant`, `isDefined`, `isNull`, `unreachable`

### Stability

> **This layer is now LOCKED.** Breaking changes require a major version bump (2.0.0).
> Additive changes (new utilities) are allowed in minor versions (1.1.0, 1.2.0).
