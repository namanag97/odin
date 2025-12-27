/**
 * Guards & Assertions
 * L0 Core Lib - Runtime type guards and assertion utilities
 */

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Check if a value is defined (not null or undefined)
 */
export const isDefined = <T>(value: T | null | undefined): value is T => {
  return value !== null && value !== undefined;
};

/**
 * Check if a value is null or undefined
 */
export const isNullish = (value: unknown): value is null | undefined => {
  return value === null || value === undefined;
};

/**
 * Check if a value is null
 */
export const isNull = (value: unknown): value is null => {
  return value === null;
};

/**
 * Check if a value is undefined
 */
export const isUndefined = (value: unknown): value is undefined => {
  return value === undefined;
};

// ============================================================================
// Exhaustive Checks
// ============================================================================

/**
 * Exhaustive check for switch statements
 * Use in the default case to ensure all cases are handled
 * 
 * @example
 * switch (status) {
 *   case 'active': return 'Active';
 *   case 'inactive': return 'Inactive';
 *   default: assertNever(status); // Type error if cases are missing
 * }
 */
export const assertNever = (value: never, message?: string): never => {
  throw new Error(message ?? `Unexpected value: ${JSON.stringify(value)}`);
};

// ============================================================================
// Runtime Assertions
// ============================================================================

/**
 * Assert that a condition is true, throw if not
 * Use for runtime invariant checks
 * 
 * @example
 * ensure(user.role === 'admin', 'User must be admin');
 */
export const ensure = (condition: boolean, message: string): asserts condition => {
  if (!condition) {
    throw new Error(message);
  }
};

/**
 * Assert and return that a value is defined
 * Throws if value is null or undefined
 * 
 * @example
 * const user = ensureDefined(maybeUser, 'User not found');
 * // user is guaranteed to be defined
 */
export const ensureDefined = <T>(
  value: T | null | undefined,
  message: string
): T => {
  if (value === null || value === undefined) {
    throw new Error(message);
  }
  return value;
};

/**
 * Assert that a condition is true (alias for ensure)
 * Useful for documenting invariants
 */
export const invariant = ensure;

/**
 * Assert that code is unreachable
 * Useful for marking code paths that should never execute
 */
export const unreachable = (message?: string): never => {
  throw new Error(message ?? 'Code reached unreachable state');
};
