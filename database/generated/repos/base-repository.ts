/**
 * Base Repository
 * Provides common CRUD operations for all entities
 */

import { Database } from "bun:sqlite";

export interface QueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDir?: "asc" | "desc";
}

export interface BaseRepository<T, TInsert, TUpdate> {
  findById(id: string, tenantId?: string): T | null;
  findAll(tenantId?: string, options?: QueryOptions): T[];
  create(data: TInsert): T;
  update(id: string, data: TUpdate, tenantId?: string): T | null;
  delete(id: string, tenantId?: string): boolean;
  count(tenantId?: string): number;
}

export function createBaseQueries(tableName: string, hasTenant: boolean) {
  const tenantFilter = hasTenant ? "tenant_id = ?" : "";
  
  return {
    selectById: hasTenant 
      ? `SELECT * FROM ${tableName} WHERE id = ? AND tenant_id = ?`
      : `SELECT * FROM ${tableName} WHERE id = ?`,
    
    selectAll: (options: QueryOptions = {}) => {
      const { limit, offset, orderBy, orderDir = "asc" } = options;
      let sql = `SELECT * FROM ${tableName}`;
      if (hasTenant) sql += " WHERE tenant_id = ?";
      if (orderBy) sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`;
      if (limit) sql += ` LIMIT ${limit}`;
      if (offset) sql += ` OFFSET ${offset}`;
      return sql;
    },
    
    count: hasTenant
      ? `SELECT COUNT(*) as count FROM ${tableName} WHERE tenant_id = ?`
      : `SELECT COUNT(*) as count FROM ${tableName}`,
    
    deleteById: hasTenant
      ? `DELETE FROM ${tableName} WHERE id = ? AND tenant_id = ?`
      : `DELETE FROM ${tableName} WHERE id = ?`,
  };
}
