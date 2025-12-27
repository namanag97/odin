/**
 * Database Error Mapper
 *
 * Maps database-specific errors to domain AppError types
 */

import {
  createInternalError,
  createNotFoundError,
  createValidationError,
  createConflictError,
  type AppError,
} from "@odin/core-contracts";

/**
 * SQLite error codes
 */
export enum SqliteErrorCode {
  CONSTRAINT = "SQLITE_CONSTRAINT",
  CONSTRAINT_UNIQUE = "SQLITE_CONSTRAINT_UNIQUE",
  CONSTRAINT_FOREIGNKEY = "SQLITE_CONSTRAINT_FOREIGNKEY",
  CONSTRAINT_NOTNULL = "SQLITE_CONSTRAINT_NOTNULL",
  CONSTRAINT_CHECK = "SQLITE_CONSTRAINT_CHECK",
  BUSY = "SQLITE_BUSY",
  LOCKED = "SQLITE_LOCKED",
  NOTFOUND = "SQLITE_NOTFOUND",
}

/**
 * Extract table and column information from constraint error messages
 */
function parseConstraintError(message: string): {
  table?: string;
  column?: string;
  constraint?: string;
} {
  const result: {
    table?: string;
    column?: string;
    constraint?: string;
  } = {};

  // Try to extract table name
  const tableMatch = message.match(/table\s+(\w+)/i);
  if (tableMatch) {
    result.table = tableMatch[1];
  }

  // Try to extract column name
  const columnMatch = message.match(/column\s+(\w+)/i);
  if (columnMatch) {
    result.column = columnMatch[1];
  }

  // Try to extract constraint name
  const constraintMatch = message.match(/constraint\s+(\w+)/i);
  if (constraintMatch) {
    result.constraint = constraintMatch[1];
  }

  return result;
}

/**
 * Map database error to AppError
 */
export function mapDatabaseError(error: unknown, context?: string): AppError {
  if (!(error instanceof Error)) {
    return createInternalError("Unknown database error occurred");
  }

  const message = error.message.toLowerCase();

  // UNIQUE constraint violation
  if (
    message.includes("unique") ||
    message.includes("sqlite_constraint_unique")
  ) {
    const { table, column } = parseConstraintError(error.message);

    let friendlyMessage = "A record with this value already exists";
    if (column) {
      friendlyMessage = `A record with this ${column} already exists`;
    }

    return createConflictError(
      table || "record",
      friendlyMessage,
      column,
      undefined
    );
  }

  // FOREIGN KEY constraint violation
  if (
    message.includes("foreign key") ||
    message.includes("sqlite_constraint_foreignkey")
  ) {
    return createValidationError(
      [
        {
          field: "foreignKey",
          message: "Referenced record does not exist or cannot be deleted due to existing references",
        },
      ],
      "Foreign key constraint violation"
    );
  }

  // NOT NULL constraint violation
  if (
    message.includes("not null") ||
    message.includes("sqlite_constraint_notnull")
  ) {
    const { column } = parseConstraintError(error.message);

    return createValidationError(
      [
        {
          field: column || "unknown",
          message: "This field is required",
        },
      ],
      "Required field is missing"
    );
  }

  // CHECK constraint violation
  if (
    message.includes("check constraint") ||
    message.includes("sqlite_constraint_check")
  ) {
    const { constraint } = parseConstraintError(error.message);

    return createValidationError(
      [
        {
          field: constraint || "unknown",
          message: "Validation check failed",
        },
      ],
      "Value does not meet validation requirements"
    );
  }

  // Database locked/busy
  if (
    message.includes("locked") ||
    message.includes("busy") ||
    message.includes("sqlite_busy") ||
    message.includes("sqlite_locked")
  ) {
    return createInternalError(
      "Database is temporarily unavailable. Please try again."
    );
  }

  // Generic constraint error
  if (message.includes("constraint")) {
    return createValidationError(
      [
        {
          field: "unknown",
          message: "Constraint violation",
        },
      ],
      "Data validation failed"
    );
  }

  // Syntax errors (should not happen in production)
  if (message.includes("syntax error")) {
    return createInternalError("Database query error");
  }

  // Default: internal error
  return createInternalError("Database operation failed");
}

/**
 * Wrap a database operation with error mapping
 */
export async function withErrorMapping<T>(
  operation: () => T | Promise<T>,
  context?: string
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    throw mapDatabaseError(error, context);
  }
}
