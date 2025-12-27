/**
 * Database utility types and helpers
 */

import type { Database } from "bun:sqlite";
import type { PageRequest, PageResponse } from "@odin/core-contracts";

/**
 * Database row type (generic SQL result)
 */
export type DbRow = Record<string, any>;

/**
 * Query builder helper types
 */
export interface QueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: "ASC" | "DESC";
}

/**
 * Transaction function type
 */
export type TransactionFn<T> = (db: Database) => T;

/**
 * Database timestamp helpers
 */
export const DbTimestamp = {
  now(): string {
    return new Date().toISOString();
  },

  fromDate(date: Date): string {
    return date.toISOString();
  },

  toDate(timestamp: string): Date {
    return new Date(timestamp);
  },
};

/**
 * SQL parameter value types
 */
export type SqlValue = string | number | boolean | null | Uint8Array;

/**
 * SQL parameter array
 */
export type SqlParams = SqlValue[];

/**
 * Helper to build WHERE clauses
 */
export class WhereBuilder {
  private conditions: string[] = [];
  private params: SqlValue[] = [];

  add(condition: string, ...params: SqlValue[]): this {
    this.conditions.push(condition);
    this.params.push(...params);
    return this;
  }

  addIf(
    shouldAdd: boolean,
    condition: string,
    ...params: SqlValue[]
  ): this {
    if (shouldAdd) {
      this.add(condition, ...params);
    }
    return this;
  }

  build(): { sql: string; params: SqlValue[] } {
    if (this.conditions.length === 0) {
      return { sql: "", params: [] };
    }

    return {
      sql: "WHERE " + this.conditions.join(" AND "),
      params: this.params,
    };
  }

  buildWithoutKeyword(): { sql: string; params: SqlValue[] } {
    return {
      sql: this.conditions.join(" AND "),
      params: this.params,
    };
  }
}

/**
 * Helper to build ORDER BY clauses
 */
export function buildOrderBy(
  column?: string,
  direction: "ASC" | "DESC" = "ASC"
): string {
  if (!column) return "";
  return `ORDER BY ${column} ${direction}`;
}

/**
 * Helper to build LIMIT/OFFSET clauses
 */
export function buildPagination(limit?: number, offset?: number): string {
  const parts: string[] = [];

  if (limit !== undefined) {
    parts.push(`LIMIT ${limit}`);
  }

  if (offset !== undefined) {
    parts.push(`OFFSET ${offset}`);
  }

  return parts.join(" ");
}

/**
 * JSON column helpers for SQLite
 */
export const JsonColumn = {
  stringify<T>(value: T): string {
    return JSON.stringify(value);
  },

  parse<T>(value: string | null): T | null {
    if (value === null) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  },
};

/**
 * Pagination helpers for converting between page-based and offset-based pagination
 */
export const Pagination = {
  /**
   * Convert page-based request to offset
   */
  toOffset(request?: PageRequest): { limit: number; offset: number; page: number } {
    const page = request?.page || 1;
    const limit = request?.limit || 20;
    const offset = (page - 1) * limit;

    return { limit, offset, page };
  },

  /**
   * Build PageResponse from data and total count
   */
  buildResponse<T>(data: T[], total: number, request?: PageRequest): PageResponse<T> {
    const page = request?.page || 1;
    const limit = request?.limit || 20;
    const totalPages = Math.ceil(total / limit);

    return {
      data,
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  },
};
