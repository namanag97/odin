import type { Database } from "bun:sqlite";
import {
  type AsyncResult,
  type UUID,
} from "@odin/core-contracts";
import {
  type SystemConfig,
  type SystemConfigId,
  type CreateSystemConfigData,
  type UpdateSystemConfigData,
  type ISystemConfigRepository,
  type SystemConfigType,
} from "@odin/domain";
import { mapDatabaseError } from "../../error-mapper";
import { DbTimestamp, JsonColumn, Pagination } from "../../types";


interface SystemConfigRow {
  id: string;
  key: string;
  name: string;
  description: string | null;
  type: string;
  value: string;
  is_sensitive: number;
  created_at: string;
  updated_at: string;
  [key: string]: unknown;
}

export class SqliteSystemConfigRepository implements ISystemConfigRepository {
  constructor(private db: Database) {}

  async findById(id: SystemConfigId): AsyncResult<SystemConfig | null> {
    try {
      const row = this.db
        .query<SystemConfigRow, [string]>(
          "SELECT * FROM system_configs WHERE id = ?"
        )
        .get(id);

      if (!row) {
        return { success: true, data: null };
      }

      return { success: true, data: this.mapRowToEntity(row) };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "findById") };
    }
  }

  async findByKey(key: string): AsyncResult<SystemConfig | null> {
    try {
      const row = this.db
        .query<SystemConfigRow, [string, string]>(
          "SELECT * FROM system_configs WHERE key = ? ")
        .get(key);

      if (!row) {
        return { success: true, data: null };
      }

      return { success: true, data: this.mapRowToEntity(row) };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "findByKey") };
    }
  }


  async create(data: CreateSystemConfigData): AsyncResult<SystemConfig> {
    try {
      const id = (globalThis as any).crypto.randomUUID();
      const now = DbTimestamp.now();

      this.db
        .query(
          `INSERT INTO system_configs (
            id, key,
            name, description, type, value, is_sensitive,
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .run(
          id,
          data.key,
          data.name,
          data.description || null,
          data.type,
          data.value,
          data.isSensitive ? 1 : 0,
          now,
          now
        );

      const result = await this.findById(id as SystemConfigId);
      if (!result.success || !result.data) {
        return {
          success: false,
          error: mapDatabaseError(new Error("Failed to create SystemConfig"), "create"),
        };
      }

      return { success: true, data: result.data };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "create") };
    }
  }

  async update(
    id: SystemConfigId,
    data: UpdateSystemConfigData,
  ): AsyncResult<SystemConfig> {
    try {
      const updates: string[] = [];
      const params: unknown[] = [];

      if (data.name !== undefined) {
        updates.push("name = ?");
        params.push(data.name);
      }
      if (data.description !== undefined) {
        updates.push("description = ?");
        params.push(data.description);
      }

      if (updates.length === 0) {
        return await this.findById(id) as AsyncResult<SystemConfig>;
      }

      updates.push("updated_at = ?");
      params.push(DbTimestamp.now());

      params.push(id);

      this.db
        .query(
          `UPDATE system_configs SET ${updates.join(", ")} WHERE id = ?`
        )
        .run(...params);

      const result = await this.findById(id);
      if (!result.success || !result.data) {
        return {
          success: false,
          error: mapDatabaseError(new Error("SystemConfig not found after update"), "update"),
        };
      }

      return { success: true, data: result.data };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "update") };
    }
  }

  async delete(id: SystemConfigId): AsyncResult<void> {
    try {
      this.db
        .query("DELETE FROM system_configs WHERE id = ?")
        .run(id);

      return { success: true, data: undefined };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "delete") };
    }
  }

  private mapRowToEntity(row: SystemConfigRow): SystemConfig {
    return {
      id: row.id as UUID as SystemConfigId,
      key: row.key,
      name: row.name,
      description: row.description || undefined,
      type: row.type as SystemConfigType,
      value: row.value,
      isSensitive: row.is_sensitive,
      createdAt: row.created_at as ISODateTime,
      updatedAt: row.updated_at as ISODateTime,
    };
  }
}
