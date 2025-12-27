import type { Database } from "bun:sqlite";
import {
  type AsyncResult,
  type UUID,
} from "@odin/core-contracts";
import {
  type FeatureFlag,
  type FeatureFlagId,
  type CreateFeatureFlagData,
  type UpdateFeatureFlagData,
  type IFeatureFlagRepository,
  type FeatureFlagType,
} from "@odin/domain";
import { mapDatabaseError } from "../../error-mapper";
import { DbTimestamp, JsonColumn, Pagination } from "../../types";


interface FeatureFlagRow {
  id: string;
  key: string;
  name: string;
  description: string | null;
  type: string;
  default_value: string;
  is_enabled: number;
  created_at: string;
  updated_at: string;
  [key: string]: unknown;
}

export class SqliteFeatureFlagRepository implements IFeatureFlagRepository {
  constructor(private db: Database) {}

  async findById(id: FeatureFlagId): AsyncResult<FeatureFlag | null> {
    try {
      const row = this.db
        .query<FeatureFlagRow, [string]>(
          "SELECT * FROM feature_flags WHERE id = ?"
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

  async findByKey(key: string): AsyncResult<FeatureFlag | null> {
    try {
      const row = this.db
        .query<FeatureFlagRow, [string, string]>(
          "SELECT * FROM feature_flags WHERE key = ? ")
        .get(key);

      if (!row) {
        return { success: true, data: null };
      }

      return { success: true, data: this.mapRowToEntity(row) };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "findByKey") };
    }
  }

  async findEnabled(): AsyncResult<readonly FeatureFlag[]> {
    try {
      const rows = this.db
        .query<FeatureFlagRow>(
          "SELECT * FROM feature_flags WHERE is_enabled = ?"
        )
        .all(1);

      
      return {
        success: true,
        data: rows.map(row => this.mapRowToEntity(row))
      };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "findEnabled") };
    }
  }

  async create(data: CreateFeatureFlagData): AsyncResult<FeatureFlag> {
    try {
      const id = (globalThis as any).crypto.randomUUID();
      const now = DbTimestamp.now();

      this.db
        .query(
          `INSERT INTO feature_flags (
            id, key,
            name, description, type, default_value, is_enabled,
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .run(
          id,
          data.key,
          data.name,
          data.description || null,
          data.type,
          data.defaultValue,
          data.isEnabled ? 1 : 0,
          now,
          now
        );

      const result = await this.findById(id as FeatureFlagId);
      if (!result.success || !result.data) {
        return {
          success: false,
          error: mapDatabaseError(new Error("Failed to create FeatureFlag"), "create"),
        };
      }

      return { success: true, data: result.data };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "create") };
    }
  }

  async update(
    id: FeatureFlagId,
    data: UpdateFeatureFlagData,
  ): AsyncResult<FeatureFlag> {
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
        return await this.findById(id) as AsyncResult<FeatureFlag>;
      }

      updates.push("updated_at = ?");
      params.push(DbTimestamp.now());

      params.push(id);

      this.db
        .query(
          `UPDATE feature_flags SET ${updates.join(", ")} WHERE id = ?`
        )
        .run(...params);

      const result = await this.findById(id);
      if (!result.success || !result.data) {
        return {
          success: false,
          error: mapDatabaseError(new Error("FeatureFlag not found after update"), "update"),
        };
      }

      return { success: true, data: result.data };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "update") };
    }
  }

  async delete(id: FeatureFlagId): AsyncResult<void> {
    try {
      this.db
        .query("DELETE FROM feature_flags WHERE id = ?")
        .run(id);

      return { success: true, data: undefined };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "delete") };
    }
  }

  private mapRowToEntity(row: FeatureFlagRow): FeatureFlag {
    return {
      id: row.id as FeatureFlagId,
      key: row.key,
      name: row.name,
      description: row.description || undefined,
      type: row.type as FeatureFlagType,
      defaultValue: row.default_value,
      isEnabled: row.is_enabled,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
