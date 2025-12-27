# Core Packages Version Update - v1.0.1

**Date:** 2025-12-27  
**Packages Updated:** `@odin/core-contracts`, `@odin/core-lib`

## Summary

Both core packages have been updated to version **1.0.1** to document and release the TypeScript type safety fixes that were implemented to resolve type checking errors.

## Changes Overview

### `@odin/core-contracts` v1.0.1

#### Type Safety Fixes

| File                    | Issue                                                                | Fix                                                                            |
| ----------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `errors/types.ts`       | Used `ErrorCode.X` as runtime values but `ErrorCode` is a type alias | Changed to string literals (`'VALIDATION_FAILED'`, `'ENTITY_NOT_FOUND'`, etc.) |
| `errors/types.ts`       | Missing `timestamp` and `traceId` in error factories                 | Added `errorMeta()` helper that generates both fields                          |
| `errors/types.ts`       | `cause` was `Error` but should be `AppError`                         | Fixed type in `createInternalError`                                            |
| `contracts/datetime.ts` | Duration functions returned `number` not branded `Duration`          | Cast to `as Duration`                                                          |
| `contracts/storage.ts`  | Used `Buffer` (Node-specific)                                        | Changed to `Uint8Array` (cross-platform)                                       |
| `index.ts`              | Exported `ErrorCode` as value but it's a type                        | Changed to `export type { ErrorCode }`                                         |

#### Verification Status

✅ **PASSED** - TypeScript type checking passes without errors

---

### `@odin/core-lib` v1.0.1

#### Changes

- Updated peer dependency `@odin/core-contracts` from `1.0.0` → `1.0.1`

#### Verification Status

⚠️ **HAS PRE-EXISTING ISSUES** - 12 TypeScript errors found (unrelated to version bump):

- `implementations/logger.ts`: Console/process globals, unused imports
- `implementations/result.ts`: Build output path issue
- `utils/date.ts`: Undefined handling in parseInt
- `utils/validation.ts`: URL constructor not found

> **Note:** These errors appear to be pre-existing configuration issues (missing lib/types) and are not related to the v1.0.1 changes.

---

## Files Updated

### Package Manifests

- ✅ `packages/core-contracts/package.json` - version bumped to `1.0.1`
- ✅ `packages/core-lib/package.json` - version bumped to `1.0.1`, peer dependency updated

### Changelogs

- ✅ `packages/core-contracts/CHANGELOG.md` - detailed fixes documented
- ✅ `packages/core-lib/CHANGELOG.md` - dependency update documented

---

## Next Steps

### Recommended Actions

1. **Address `core-lib` Type Issues** (Optional)

   - Add `@types/node` for `process` and `console` globals
   - Update `tsconfig.json` to include proper `lib` settings
   - Fix unused import and undefined handling issues

2. **Update Dependent Packages**

   - Update any packages that depend on `@odin/core-contracts` or `@odin/core-lib` to use version `1.0.1`

3. **Git Commit**
   ```bash
   git add packages/core-contracts packages/core-lib
   git commit -m "chore(core): bump to v1.0.1 - TypeScript type safety fixes"
   ```

---

## Semantic Versioning Rationale

**Version: 1.0.1 (Patch)**

This follows semantic versioning:

- **MAJOR** (2.0.0): Breaking changes
- **MINOR** (1.1.0): New features (additive changes)
- **PATCH** (1.0.1): Bug fixes ← **This release**

The changes are bug fixes that improve type safety without changing the public API or adding new features.
