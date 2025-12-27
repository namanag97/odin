import type { Database } from "bun:sqlite";
import {
  type AsyncResult,
  type UUID,
} from "@odin/core-contracts";
import {
  type EntityHistory,
  type EntityHistoryId,
  type CreateEntityHistoryData,
  type UpdateEntityHistoryData,
  type IEntityHistoryRepository,
  HistoryOperation,
} from "@odin/domain";
import { mapDatabaseError } from "../../error-mapper";
import { DbTimestamp, JsonColumn, Pagination } from "../../types";


interface EntityHistoryRow {
  id: string;
  name: string;
  description: string | null;
  entity_type: string;
  entity_id: string;
  version: number;
  operation: string;
  created_at: string;
  updated_at: string;
  [key: string]: unknown;
}

export class SqliteEntityHistoryRepository implements IEntityHistoryRepository {
  constructor(private db: Database) {}

  async findById(id: EntityHistoryId): AsyncResult<EntityHistory | null> {
    try {
      const row = this.db
        .query<EntityHistoryRow, [string]>(
          "SELECT * FROM entity_history WHERE id = ?"
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

  async findByEntityId(entityType: string, entityId: string): AsyncResult<readonly EntityHistory[]> {
    try {
      const rows = this.db
        .query<EntityHistoryRow>(
          "SELECT * FROM entity_history WHERE entity_type = ?"
        )
        .all(entityType);

      
      return {
        success: true,
        data: rows.map(row => this.mapRowToEntity(row))
      };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "findByEntityId") };
    }
  }

  async create(data: CreateEntityHistoryData): AsyncResult<EntityHistory> {
    try {
      const id = (globalThis as any).crypto.randomUUID();
      const now = DbTimestamp.now();

      this.db
        .query(
          `INSERT INTO entity_history (
            id,
            name, description, entity_type, entity_id, version, operation,
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .run(
          id,
          data.name,
          data.description || null,
          data.entityType,
          data.entityId,
          data.version,
          data.operation,
          now,
          now
        );

      const result = await this.findById(id as EntityHistoryId);
      if (!result.success || !result.data) {
        return {
          success: false,
          error: mapDatabaseError(new Error("Failed to create EntityHistory"), "create"),
        };
      }

      return { success: true, data: result.data };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "create") };
    }
  }

  async update(
    id: EntityHistoryId,
    data: UpdateEntityHistoryData,
  ): AsyncResult<EntityHistory> {
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
        return await this.findById(id) as AsyncResult<EntityHistory>;
      }

      updates.push("updated_at = ?");
      params.push(DbTimestamp.now());

      params.push(id);

      this.db
        .query(
          `UPDATE entity_history SET ${updates.join(", ")} WHERE id = ?`
        )
        .run(...params);

      const result = await this.findById(id);
      if (!result.success || !result.data) {
        return {
          success: false,
          error: mapDatabaseError(new Error("EntityHistory not found after update"), "update"),
        };
      }

      return { success: true, data: result.data };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "update") };
    }
  }

  async delete(id: EntityHistoryId): AsyncResult<void> {
    try {
      this.db
        .query("DELETE FROM entity_history WHERE id = ?")
        .run(id);

      return { success: true, data: undefined };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "delete") };
    }
  }

  private mapRowToEntity(row: EntityHistoryRow): EntityHistory {
    return {
      id: row.id as UUID as EntityHistoryId,
      name: row.name,
      description: row.description || undefined,
      entityType: row.entity_type,
      entityId: row.entity_id as UUID,
      version: row.version,
      operation: row.operation,
      createdAt: row.created_at as ISODateTime,
      updatedAt: row.updated_at as ISODateTime,
    };
  }
}
