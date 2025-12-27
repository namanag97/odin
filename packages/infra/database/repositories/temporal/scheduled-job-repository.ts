import type { Database } from "bun:sqlite";
import {
  type AsyncResult,
  type TenantId,
  type UUID,
  type PageRequest,
  type PageResponse,
} from "@odin/core-contracts";
import {
  type ScheduledJob,
  type ScheduledJobId,
  type CreateScheduledJobData,
  type UpdateScheduledJobData,
  type IScheduledJobRepository,
  type ScheduledJobStatus,
  type ScheduledJobType,
} from "@odin/domain";
import { mapDatabaseError } from "../../error-mapper";
import { DbTimestamp, JsonColumn, Pagination } from "../../types";


interface ScheduledJobRow {
  id: string;
  tenant_id: string;
  name: string;
  description: string | null;
  status: string;
  type: string;
  schedule: string;
  next_run_at: string | null;
  created_at: string;
  updated_at: string;
}

export class SqliteScheduledJobRepository implements IScheduledJobRepository {
  constructor(private db: Database) {}

  async findById(id: ScheduledJobId, tenantId: TenantId): AsyncResult<ScheduledJob | null> {
    try {
      const row = this.db
        .query<ScheduledJobRow, [string, string]>(
          "SELECT * FROM scheduled_jobs WHERE id = ? AND tenant_id = ?"
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

  async findByTenantId(tenantId: TenantId, page: PageRequest): AsyncResult<PageResponse<ScheduledJob>> {
    try {
      const { limit, offset } = Pagination.toOffset(page);

      const rows = this.db
        .query<ScheduledJobRow>(
          "SELECT * FROM scheduled_jobs WHERE tenant_id = ? AND tenant_id = ? LIMIT ? OFFSET ?"
        )
        .all(tenantId, tenantId, limit, offset);

      const countRow = this.db
        .query<{ count: number }>(
          "SELECT COUNT(*) as count FROM scheduled_jobs WHERE tenant_id = ? AND tenant_id = ?"
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

  async findByStatus(status: ScheduledJobStatus, tenantId: TenantId): AsyncResult<readonly ScheduledJob[]> {
    try {
      const rows = this.db
        .query<ScheduledJobRow>(
          "SELECT * FROM scheduled_jobs WHERE status = ? AND tenant_id = ?"
        )
        .all(status, tenantId);

      
      return {
        success: true,
        data: rows.map(row => this.mapRowToEntity(row))
      };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "findByStatus") };
    }
  }

  async findDue(tenantId: TenantId): AsyncResult<readonly ScheduledJob[]> {
    try {
      const rows = this.db
        .query<ScheduledJobRow>(
          "SELECT * FROM scheduled_jobs WHERE tenant_id = ? AND tenant_id = ?"
        )
        .all(tenantId, tenantId);

      
      return {
        success: true,
        data: rows.map(row => this.mapRowToEntity(row))
      };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "findDue") };
    }
  }

  async create(data: CreateScheduledJobData): AsyncResult<ScheduledJob> {
    try {
      const id = (globalThis as any).crypto.randomUUID();
      const now = DbTimestamp.now();

      this.db
        .query(
          `INSERT INTO scheduled_jobs (
            id, tenant_id,
            name, description, status, type, schedule, next_run_at,
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
          data.schedule,
          data.nextRunAt,
          now,
          now
        );

      const result = await this.findById(id as ScheduledJobId, data.tenantId);
      if (!result.success || !result.data) {
        return {
          success: false,
          error: mapDatabaseError(new Error("Failed to create ScheduledJob"), "create"),
        };
      }

      return { success: true, data: result.data };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "create") };
    }
  }

  async update(
    id: ScheduledJobId,
    data: UpdateScheduledJobData,
    tenantId: TenantId
  ): AsyncResult<ScheduledJob> {
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
        return await this.findById(id, tenantId) as AsyncResult<ScheduledJob>;
      }

      updates.push("updated_at = ?");
      params.push(DbTimestamp.now());

      params.push(id);
      params.push(tenantId);

      this.db
        .query(
          `UPDATE scheduled_jobs SET ${updates.join(", ")} WHERE id = ? AND tenant_id = ?`
        )
        .run(...params);

      const result = await this.findById(id, tenantId);
      if (!result.success || !result.data) {
        return {
          success: false,
          error: mapDatabaseError(new Error("ScheduledJob not found after update"), "update"),
        };
      }

      return { success: true, data: result.data };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "update") };
    }
  }

  async delete(id: ScheduledJobId, tenantId: TenantId): AsyncResult<void> {
    try {
      this.db
        .query("DELETE FROM scheduled_jobs WHERE id = ? AND tenant_id = ?")
        .run(id, tenantId);

      return { success: true, data: undefined };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "delete") };
    }
  }

  private mapRowToEntity(row: ScheduledJobRow): ScheduledJob {
    return {
      id: row.id as ScheduledJobId,
      tenantId: row.tenant_id as TenantId,
      name: row.name,
      description: row.description || undefined,
      status: row.status as ScheduledJobStatus,
      type: row.type as ScheduledJobType,
      schedule: row.schedule,
      nextRunAt: row.next_run_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
