import type { Database } from "bun:sqlite";
import {
  type AsyncResult,
  type TenantId,
  type UUID,
} from "@odin/core-contracts";
import {
  type Table,
  type TableId,
  type CreateTableData,
  type UpdateTableData,
  type ITableRepository,
  type TableType,
  TableType,
} from "@odin/domain";
import { mapDatabaseError } from "../../error-mapper";
import { DbTimestamp, JsonColumn, Pagination } from "../../types";


interface TableRow {
  id: string;
  tenant_id: string;
  name: string;
  description: string | null;
  type: string;
  data_pool_id: string;
  row_count: number;
  created_at: string;
  updated_at: string;
}

export class SqliteTableRepository implements ITableRepository {
  constructor(private db: Database) {}

  async findById(id: TableId, tenantId: TenantId): AsyncResult<Table | null> {
    try {
      const row = this.db
        .query<TableRow, [string, string]>(
          "SELECT * FROM tables WHERE id = ? AND tenant_id = ?"
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

  async findByDataPoolId(dataPoolId: UUID, tenantId: TenantId): AsyncResult<readonly Table[]> {
    try {
      const rows = this.db
        .query<TableRow>(
          "SELECT * FROM tables WHERE data_pool_id = ? AND tenant_id = ?"
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

  async findByType(tableType: TableType, tenantId: TenantId): AsyncResult<readonly Table[]> {
    try {
      const rows = this.db
        .query<TableRow>(
          "SELECT * FROM tables WHERE type = ? AND tenant_id = ?"
        )
        .all(tableType, tenantId);

      
      return {
        success: true,
        data: rows.map(row => this.mapRowToEntity(row))
      };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "findByType") };
    }
  }

  async create(data: CreateTableData): AsyncResult<Table> {
    try {
      const id = (globalThis as any).crypto.randomUUID();
      const now = DbTimestamp.now();

      this.db
        .query(
          `INSERT INTO tables (
            id, tenant_id,
            name, description, type, data_pool_id, row_count,
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .run(
          id,
          data.tenantId,
          data.name,
          data.description || null,
          data.type,
          data.dataPoolId,
          data.rowCount,
          now,
          now
        );

      const result = await this.findById(id as TableId, data.tenantId);
      if (!result.success || !result.data) {
        return {
          success: false,
          error: mapDatabaseError(new Error("Failed to create Table"), "create"),
        };
      }

      return { success: true, data: result.data };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "create") };
    }
  }

  async update(
    id: TableId,
    data: UpdateTableData,
    tenantId: TenantId
  ): AsyncResult<Table> {
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
        return await this.findById(id, tenantId) as AsyncResult<Table>;
      }

      updates.push("updated_at = ?");
      params.push(DbTimestamp.now());

      params.push(id);
      params.push(tenantId);

      this.db
        .query(
          `UPDATE tables SET ${updates.join(", ")} WHERE id = ? AND tenant_id = ?`
        )
        .run(...params);

      const result = await this.findById(id, tenantId);
      if (!result.success || !result.data) {
        return {
          success: false,
          error: mapDatabaseError(new Error("Table not found after update"), "update"),
        };
      }

      return { success: true, data: result.data };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "update") };
    }
  }

  async delete(id: TableId, tenantId: TenantId): AsyncResult<void> {
    try {
      this.db
        .query("DELETE FROM tables WHERE id = ? AND tenant_id = ?")
        .run(id, tenantId);

      return { success: true, data: undefined };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "delete") };
    }
  }

  private mapRowToEntity(row: TableRow): Table {
    return {
      id: row.id as UUID as TableId,
      tenantId: row.tenant_id as UUID as TenantId,
      name: row.name,
      description: row.description || undefined,
      type: row.type as TableType,
      dataPoolId: row.data_pool_id as UUID,
      rowCount: row.row_count,
      createdAt: row.created_at as ISODateTime,
      updatedAt: row.updated_at as ISODateTime,
    };
  }
}
