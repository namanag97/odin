import type { Database } from "bun:sqlite";
import {
  type AsyncResult,
  type TenantId,
  type UUID,
} from "@odin/core-contracts";
import {
  type Variant,
  type VariantId,
  type CreateVariantData,
  type UpdateVariantData,
  type IVariantRepository,
} from "@odin/domain";
import { mapDatabaseError } from "../../error-mapper";
import { DbTimestamp, JsonColumn, Pagination } from "../../types";


interface VariantRow {
  id: string;
  tenant_id: string;
  name: string;
  description: string | null;
  data_model_id: string;
  frequency: number;
  created_at: string;
  updated_at: string;
}

export class SqliteVariantRepository implements IVariantRepository {
  constructor(private db: Database) {}

  async findById(id: VariantId, tenantId: TenantId): AsyncResult<Variant | null> {
    try {
      const row = this.db
        .query<VariantRow, [string, string]>(
          "SELECT * FROM variants WHERE id = ? AND tenant_id = ?"
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

  async findByDataModelId(dataModelId: UUID, tenantId: TenantId): AsyncResult<readonly Variant[]> {
    try {
      const rows = this.db
        .query<VariantRow>(
          "SELECT * FROM variants WHERE data_model_id = ? AND tenant_id = ?"
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

  async create(data: CreateVariantData): AsyncResult<Variant> {
    try {
      const id = (globalThis as any).crypto.randomUUID();
      const now = DbTimestamp.now();

      this.db
        .query(
          `INSERT INTO variants (
            id, tenant_id,
            name, description, data_model_id, frequency,
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .run(
          id,
          data.tenantId,
          data.name,
          data.description || null,
          data.dataModelId,
          data.frequency,
          now,
          now
        );

      const result = await this.findById(id as VariantId, data.tenantId);
      if (!result.success || !result.data) {
        return {
          success: false,
          error: mapDatabaseError(new Error("Failed to create Variant"), "create"),
        };
      }

      return { success: true, data: result.data };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "create") };
    }
  }

  async update(
    id: VariantId,
    data: UpdateVariantData,
    tenantId: TenantId
  ): AsyncResult<Variant> {
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
        return await this.findById(id, tenantId) as AsyncResult<Variant>;
      }

      updates.push("updated_at = ?");
      params.push(DbTimestamp.now());

      params.push(id);
      params.push(tenantId);

      this.db
        .query(
          `UPDATE variants SET ${updates.join(", ")} WHERE id = ? AND tenant_id = ?`
        )
        .run(...params);

      const result = await this.findById(id, tenantId);
      if (!result.success || !result.data) {
        return {
          success: false,
          error: mapDatabaseError(new Error("Variant not found after update"), "update"),
        };
      }

      return { success: true, data: result.data };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "update") };
    }
  }

  async delete(id: VariantId, tenantId: TenantId): AsyncResult<void> {
    try {
      this.db
        .query("DELETE FROM variants WHERE id = ? AND tenant_id = ?")
        .run(id, tenantId);

      return { success: true, data: undefined };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "delete") };
    }
  }

  private mapRowToEntity(row: VariantRow): Variant {
    return {
      id: row.id as UUID as VariantId,
      tenantId: row.tenant_id as UUID as TenantId,
      name: row.name,
      description: row.description || undefined,
      dataModelId: row.data_model_id as UUID,
      frequency: row.frequency,
      createdAt: row.created_at as ISODateTime,
      updatedAt: row.updated_at as ISODateTime,
    };
  }
}
