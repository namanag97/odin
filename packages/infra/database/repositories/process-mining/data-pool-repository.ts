import type { Database } from "bun:sqlite";
import {
  type AsyncResult,
  type TenantId,
  type UUID,
  type PageRequest,
  type PageResponse,
} from "@odin/core-contracts";
import {
  type DataPool,
  type DataPoolId,
  type CreateDataPoolData,
  type UpdateDataPoolData,
  type IDataPoolRepository,
  type DataPoolStatus,
  type DataPoolType,
  DataPoolType,
} from "@odin/domain";
import { mapDatabaseError } from "../../error-mapper";
import { DbTimestamp, JsonColumn, Pagination } from "../../types";


interface DataPoolRow {
  id: string;
  tenant_id: string;
  name: string;
  description: string | null;
  status: string;
  type: string;
  pool_type: string;
  created_at: string;
  updated_at: string;
}

export class SqliteDataPoolRepository implements IDataPoolRepository {
  constructor(private db: Database) {}

  async findById(id: DataPoolId, tenantId: TenantId): AsyncResult<DataPool | null> {
    try {
      const row = this.db
        .query<DataPoolRow, [string, string]>(
          "SELECT * FROM data_pools WHERE id = ? AND tenant_id = ?"
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

  async findByTenantId(tenantId: TenantId, page: PageRequest): AsyncResult<PageResponse<DataPool>> {
    try {
      const { limit, offset } = Pagination.toOffset(page);

      const rows = this.db
        .query<DataPoolRow>(
          "SELECT * FROM data_pools WHERE tenant_id = ? AND tenant_id = ? LIMIT ? OFFSET ?"
        )
        .all(tenantId, tenantId, limit, offset);

      const countRow = this.db
        .query<{ count: number }>(
          "SELECT COUNT(*) as count FROM data_pools WHERE tenant_id = ? AND tenant_id = ?"
        )
        .get(tenantId, tenantId);

      const items = rows.map(row => this.mapRowToEntity(row));
      const total = countRow?.count || 0;

      return {
        success: true,
        data: Pagination.buildResponse(items, total, page)
      };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "findByTenantId") };
    }
  }

  async findByType(poolType: DataPoolType, tenantId: TenantId): AsyncResult<readonly DataPool[]> {
    try {
      const rows = this.db
        .query<DataPoolRow>(
          "SELECT * FROM data_pools WHERE pool_type = ? AND tenant_id = ?"
        )
        .all(poolType, tenantId);

      
      return {
        success: true,
        data: rows.map(row => this.mapRowToEntity(row))
      };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "findByType") };
    }
  }

  async create(data: CreateDataPoolData): AsyncResult<DataPool> {
    try {
      const id = (globalThis as any).crypto.randomUUID();
      const now = DbTimestamp.now();

      this.db
        .query(
          `INSERT INTO data_pools (
            id, tenant_id,
            name, description, status, type, pool_type,
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .run(
          id,
          data.tenantId,
          data.name,
          data.description || null,
          data.status || "draft",
          data.type,
          data.poolType,
          now,
          now
        );

      const result = await this.findById(id as DataPoolId, data.tenantId);
      if (!result.success || !result.data) {
        return {
          success: false,
          error: mapDatabaseError(new Error("Failed to create DataPool"), "create"),
        };
      }

      return { success: true, data: result.data };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "create") };
    }
  }

  async update(
    id: DataPoolId,
    data: UpdateDataPoolData,
    tenantId: TenantId
  ): AsyncResult<DataPool> {
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
        return await this.findById(id, tenantId) as AsyncResult<DataPool>;
      }

      updates.push("updated_at = ?");
      params.push(DbTimestamp.now());

      params.push(id);
      params.push(tenantId);

      this.db
        .query(
          `UPDATE data_pools SET ${updates.join(", ")} WHERE id = ? AND tenant_id = ?`
        )
        .run(...params);

      const result = await this.findById(id, tenantId);
      if (!result.success || !result.data) {
        return {
          success: false,
          error: mapDatabaseError(new Error("DataPool not found after update"), "update"),
        };
      }

      return { success: true, data: result.data };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "update") };
    }
  }

  async delete(id: DataPoolId, tenantId: TenantId): AsyncResult<void> {
    try {
      this.db
        .query("DELETE FROM data_pools WHERE id = ? AND tenant_id = ?")
        .run(id, tenantId);

      return { success: true, data: undefined };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "delete") };
    }
  }

  private mapRowToEntity(row: DataPoolRow): DataPool {
    return {
      id: row.id as DataPoolId,
      tenantId: row.tenant_id as TenantId,
      name: row.name,
      description: row.description || undefined,
      status: row.status as DataPoolStatus,
      type: row.type as DataPoolType,
      poolType: row.pool_type,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
