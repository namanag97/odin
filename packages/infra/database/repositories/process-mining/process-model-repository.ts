import type { Database } from "bun:sqlite";
import {
  type AsyncResult,
  type TenantId,
  type UUID,
} from "@odin/core-contracts";
import {
  type ProcessModel,
  type ProcessModelId,
  type CreateProcessModelData,
  type UpdateProcessModelData,
  type IProcessModelRepository,
  type ProcessModelType,
  ProcessModelType,
} from "@odin/domain";
import { mapDatabaseError } from "../../error-mapper";
import { DbTimestamp, JsonColumn, Pagination } from "../../types";


interface ProcessModelRow {
  id: string;
  tenant_id: string;
  name: string;
  description: string | null;
  type: string;
  data_model_id: string;
  model_type: string;
  created_at: string;
  updated_at: string;
}

export class SqliteProcessModelRepository implements IProcessModelRepository {
  constructor(private db: Database) {}

  async findById(id: ProcessModelId, tenantId: TenantId): AsyncResult<ProcessModel | null> {
    try {
      const row = this.db
        .query<ProcessModelRow, [string, string]>(
          "SELECT * FROM process_models WHERE id = ? AND tenant_id = ?"
        )
        .get(id, tenantId);

      if (!row) {
        return { success: true, data: null };
      }

      return { success: true, data: this.mapRowToEntity(row) };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "findById") };
    }
  }

  async findByDataModelId(dataModelId: UUID, tenantId: TenantId): AsyncResult<readonly ProcessModel[]> {
    try {
      const rows = this.db
        .query<ProcessModelRow>(
          "SELECT * FROM process_models WHERE data_model_id = ? AND tenant_id = ?"
        )
        .all(dataModelId, tenantId);

      
      return {
        success: true,
        data: rows.map(row => this.mapRowToEntity(row))
      };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "findByDataModelId") };
    }
  }

  async findByType(modelType: ProcessModelType, tenantId: TenantId): AsyncResult<readonly ProcessModel[]> {
    try {
      const rows = this.db
        .query<ProcessModelRow>(
          "SELECT * FROM process_models WHERE model_type = ? AND tenant_id = ?"
        )
        .all(modelType, tenantId);

      
      return {
        success: true,
        data: rows.map(row => this.mapRowToEntity(row))
      };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "findByType") };
    }
  }

  async create(data: CreateProcessModelData): AsyncResult<ProcessModel> {
    try {
      const id = (globalThis as any).crypto.randomUUID();
      const now = DbTimestamp.now();

      this.db
        .query(
          `INSERT INTO process_models (
            id, tenant_id,
            name, description, type, data_model_id, model_type,
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .run(
          id,
          data.tenantId,
          data.name,
          data.description || null,
          data.type,
          data.dataModelId,
          data.modelType,
          now,
          now
        );

      const result = await this.findById(id as ProcessModelId, data.tenantId);
      if (!result.success || !result.data) {
        return {
          success: false,
          error: mapDatabaseError(new Error("Failed to create ProcessModel"), "create"),
        };
      }

      return { success: true, data: result.data };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "create") };
    }
  }

  async update(
    id: ProcessModelId,
    data: UpdateProcessModelData,
    tenantId: TenantId
  ): AsyncResult<ProcessModel> {
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
        return await this.findById(id, tenantId) as AsyncResult<ProcessModel>;
      }

      updates.push("updated_at = ?");
      params.push(DbTimestamp.now());

      params.push(id);
      params.push(tenantId);

      this.db
        .query(
          `UPDATE process_models SET ${updates.join(", ")} WHERE id = ? AND tenant_id = ?`
        )
        .run(...params);

      const result = await this.findById(id, tenantId);
      if (!result.success || !result.data) {
        return {
          success: false,
          error: mapDatabaseError(new Error("ProcessModel not found after update"), "update"),
        };
      }

      return { success: true, data: result.data };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "update") };
    }
  }

  async delete(id: ProcessModelId, tenantId: TenantId): AsyncResult<void> {
    try {
      this.db
        .query("DELETE FROM process_models WHERE id = ? AND tenant_id = ?")
        .run(id, tenantId);

      return { success: true, data: undefined };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "delete") };
    }
  }

  private mapRowToEntity(row: ProcessModelRow): ProcessModel {
    return {
      id: row.id as UUID as ProcessModelId,
      tenantId: row.tenant_id as UUID as TenantId,
      name: row.name,
      description: row.description || undefined,
      type: row.type as ProcessModelType,
      dataModelId: row.data_model_id as UUID,
      modelType: row.model_type,
      createdAt: row.created_at as ISODateTime,
      updatedAt: row.updated_at as ISODateTime,
    };
  }
}
