/**
 * Core Lib - L0 Shared Implementations
 * 
 * This package provides default implementations and utilities
 * for the contracts defined in @odin/core-contracts.
 */

// ============================================================================
// Implementations
// ============================================================================

export {
  // Result helpers
  success,
  failure,
  isSuccess,
  isFailure,
  mapResult,
  mapError,
  flatMapResult,
  unwrap,
  unwrapOr,
  unwrapOrElse,
  resultToOption,
  // Option helpers
  some,
  none,
  fromNullable,
  isSome,
  isNone,
  mapOption,
  flatMapOption,
  getOrDefault,
  toNullable,
  // Async helpers
  tryCatch,
  combineResults,
  sequenceAsync,
} from './implementations/result';

export {
  // Logger implementations
  ConsoleLogger,
  NoopLogger,
  noopLogger,
  createLogger,
  createRequestLogger,
  createServiceLogger,
} from './implementations/logger';

// ============================================================================
// Utilities
// ============================================================================

export {
  // Date utilities
  toISOString,
  fromISOString,
  now,
  nowMs,
  nowSec,
  formatDuration,
  parseDuration,
  addDays,
  addHours,
  addMinutes,
  addSeconds,
  diffMs,
  isPast,
  isFuture,
  isExpired,
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
} from './utils/date';

export {
  // String utilities
  toPascalCase,
  toCamelCase,
  toSnakeCase,
  toKebabCase,
  toConstantCase,
  slugify,
  slugifyWithSuffix,
  truncate,
  truncateWords,
  padZeros,
  padCenter,
  escapeHtml,
  stripHtml,
  normalizeWhitespace,
  equalsIgnoreCase,
  containsIgnoreCase,
  randomString,
  shortId,
} from './utils/string';

export {
  // Validation utilities
  isEmail,
  isUrl,
  isHttpUrl,
  isUuid,
  isNonEmpty,
  hasMinLength,
  hasMaxLength,
  hasLengthBetween,
  matchesPattern,
  isValidNumber,
  isPositive,
  isNonNegative,
  isInteger,
  isInRange,
  isSlug,
  isPhoneNumber,
  isIsoDate,
  isDateString,
  isValidJson,
  tryParseJson,
} from './utils/validation';

export {
  // Guards & Assertions
  isDefined,
  isNullish,
  isNull,
  isUndefined,
  assertNever,
  ensure,
  ensureDefined,
  invariant,
  unreachable,
} from './utils/guards';
