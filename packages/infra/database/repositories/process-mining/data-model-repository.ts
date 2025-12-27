import type { Database } from "bun:sqlite";
import {
  type AsyncResult,
  type TenantId,
  type UUID,
} from "@odin/core-contracts";
import {
  type DataModel,
  type DataModelId,
  type CreateDataModelData,
  type UpdateDataModelData,
  type IDataModelRepository,
  type DataModelStatus,
  type DataModelType,
  DataModelType,
} from "@odin/domain";
import { mapDatabaseError } from "../../error-mapper";
import { DbTimestamp, JsonColumn, Pagination } from "../../types";


interface DataModelRow {
  id: string;
  tenant_id: string;
  name: string;
  description: string | null;
  status: string;
  type: string;
  data_pool_id: string;
  model_type: string;
  created_at: string;
  updated_at: string;
}

export class SqliteDataModelRepository implements IDataModelRepository {
  constructor(private db: Database) {}

  async findById(id: DataModelId, tenantId: TenantId): AsyncResult<DataModel | null> {
    try {
      const row = this.db
        .query<DataModelRow, [string, string]>(
          "SELECT * FROM data_models WHERE id = ? AND tenant_id = ?"
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

  async findByDataPoolId(dataPoolId: UUID, tenantId: TenantId): AsyncResult<readonly DataModel[]> {
    try {
      const rows = this.db
        .query<DataModelRow>(
          "SELECT * FROM data_models WHERE data_pool_id = ? AND tenant_id = ?"
        )
        .all(dataPoolId, tenantId);

      
      return {
        success: true,
        data: rows.map(row => this.mapRowToEntity(row))
      };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "findByDataPoolId") };
    }
  }

  async findByType(modelType: DataModelType, tenantId: TenantId): AsyncResult<readonly DataModel[]> {
    try {
      const rows = this.db
        .query<DataModelRow>(
          "SELECT * FROM data_models WHERE model_type = ? AND tenant_id = ?"
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

  async create(data: CreateDataModelData): AsyncResult<DataModel> {
    try {
      const id = (globalThis as any).crypto.randomUUID();
      const now = DbTimestamp.now();

      this.db
        .query(
          `INSERT INTO data_models (
            id, tenant_id,
            name, description, status, type, data_pool_id, model_type,
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .run(
          id,
          data.tenantId,
          data.name,
          data.description || null,
          data.status || "draft",
          data.type,
          data.dataPoolId,
          data.modelType,
          now,
          now
        );

      const result = await this.findById(id as DataModelId, data.tenantId);
      if (!result.success || !result.data) {
        return {
          success: false,
          error: mapDatabaseError(new Error("Failed to create DataModel"), "create"),
        };
      }

      return { success: true, data: result.data };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "create") };
    }
  }

  async update(
    id: DataModelId,
    data: UpdateDataModelData,
    tenantId: TenantId
  ): AsyncResult<DataModel> {
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
      if (data.status !== undefined) {
        updates.push("status = ?");
        params.push(data.status);
      }

      if (updates.length === 0) {
        return await this.findById(id, tenantId) as AsyncResult<DataModel>;
      }

      updates.push("updated_at = ?");
      params.push(DbTimestamp.now());

      params.push(id);
      params.push(tenantId);

      this.db
        .query(
          `UPDATE data_models SET ${updates.join(", ")} WHERE id = ? AND tenant_id = ?`
        )
        .run(...params);

      const result = await this.findById(id, tenantId);
      if (!result.success || !result.data) {
        return {
          success: false,
          error: mapDatabaseError(new Error("DataModel not found after update"), "update"),
        };
      }

      return { success: true, data: result.data };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "update") };
    }
  }

  async delete(id: DataModelId, tenantId: TenantId): AsyncResult<void> {
    try {
      this.db
        .query("DELETE FROM data_models WHERE id = ? AND tenant_id = ?")
        .run(id, tenantId);

      return { success: true, data: undefined };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "delete") };
    }
  }

  private mapRowToEntity(row: DataModelRow): DataModel {
    return {
      id: row.id as UUID as DataModelId,
      tenantId: row.tenant_id as UUID as TenantId,
      name: row.name,
      description: row.description || undefined,
      status: row.status as DataModelStatus,
      type: row.type as DataModelType,
      dataPoolId: row.data_pool_id as UUID,
      modelType: row.model_type,
      createdAt: row.created_at as ISODateTime,
      updatedAt: row.updated_at as ISODateTime,
    };
  }
}
