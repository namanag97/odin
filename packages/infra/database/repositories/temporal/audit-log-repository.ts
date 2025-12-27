import type { Database } from "bun:sqlite";
import {
  type AsyncResult,
  type TenantId,
  type UUID,
  type PageRequest,
  type PageResponse,
} from "@odin/core-contracts";
import {
  type AuditLog,
  type AuditLogId,
  type CreateAuditLogData,
  type UpdateAuditLogData,
  type IAuditLogRepository,
  ActorType,
  AuditAction,
  AuditResourceType,
} from "@odin/domain";
import { mapDatabaseError } from "../../error-mapper";
import { DbTimestamp, JsonColumn, Pagination } from "../../types";


interface AuditLogRow {
  id: string;
  tenant_id: string;
  name: string;
  description: string | null;
  actor_type: string;
  actor_id: string;
  action: string;
  resource_type: string;
  resource_id: string;
  created_at: string;
  updated_at: string;
}

export class SqliteAuditLogRepository implements IAuditLogRepository {
  constructor(private db: Database) {}

  async findById(id: AuditLogId, tenantId: TenantId): AsyncResult<AuditLog | null> {
    try {
      const row = this.db
        .query<AuditLogRow, [string, string]>(
          "SELECT * FROM audit_logs WHERE id = ? AND tenant_id = ?"
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

  async findByTenantId(tenantId: TenantId, page: PageRequest): AsyncResult<PageResponse<AuditLog>> {
    try {
      const { limit, offset } = Pagination.toOffset(page);

      const rows = this.db
        .query<AuditLogRow>(
          "SELECT * FROM audit_logs WHERE tenant_id = ? AND tenant_id = ? LIMIT ? OFFSET ?"
        )
        .all(tenantId, tenantId, limit, offset);

      const countRow = this.db
        .query<{ count: number }>(
          "SELECT COUNT(*) as count FROM audit_logs WHERE tenant_id = ? AND tenant_id = ?"
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

  async findByActor(actorId: string, tenantId: TenantId, page: PageRequest): AsyncResult<PageResponse<AuditLog>> {
    try {
      const { limit, offset } = Pagination.toOffset(page);

      const rows = this.db
        .query<AuditLogRow>(
          "SELECT * FROM audit_logs WHERE actor_id = ? AND tenant_id = ? LIMIT ? OFFSET ?"
        )
        .all(actorId, tenantId, limit, offset);

      const countRow = this.db
        .query<{ count: number }>(
          "SELECT COUNT(*) as count FROM audit_logs WHERE actor_id = ? AND tenant_id = ?"
        )
        .get(actorId, tenantId);

      const items = rows.map(row => this.mapRowToEntity(row));
      const total = countRow?.count || 0;

      return {
        success: true,
        data: Pagination.buildResponse(items, total, page)
      };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "findByActor") };
    }
  }

  async findByResource(resourceType: AuditResourceType, resourceId: string, tenantId: TenantId): AsyncResult<readonly AuditLog[]> {
    try {
      const rows = this.db
        .query<AuditLogRow>(
          "SELECT * FROM audit_logs WHERE resource_type = ? AND tenant_id = ?"
        )
        .all(resourceType, tenantId);

      
      return {
        success: true,
        data: rows.map(row => this.mapRowToEntity(row))
      };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "findByResource") };
    }
  }

  async create(data: CreateAuditLogData): AsyncResult<AuditLog> {
    try {
      const id = (globalThis as any).crypto.randomUUID();
      const now = DbTimestamp.now();

      this.db
        .query(
          `INSERT INTO audit_logs (
            id, tenant_id,
            name, description, actor_type, actor_id, action, resource_type, resource_id,
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .run(
          id,
          data.tenantId,
          data.name,
          data.description || null,
          data.actorType,
          data.actorId,
          data.action,
          data.resourceType,
          data.resourceId,
          now,
          now
        );

      const result = await this.findById(id as AuditLogId, data.tenantId);
      if (!result.success || !result.data) {
        return {
          success: false,
          error: mapDatabaseError(new Error("Failed to create AuditLog"), "create"),
        };
      }

      return { success: true, data: result.data };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "create") };
    }
  }

  async update(
    id: AuditLogId,
    data: UpdateAuditLogData,
    tenantId: TenantId
  ): AsyncResult<AuditLog> {
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
        return await this.findById(id, tenantId) as AsyncResult<AuditLog>;
      }

      updates.push("updated_at = ?");
      params.push(DbTimestamp.now());

      params.push(id);
      params.push(tenantId);

      this.db
        .query(
          `UPDATE audit_logs SET ${updates.join(", ")} WHERE id = ? AND tenant_id = ?`
        )
        .run(...params);

      const result = await this.findById(id, tenantId);
      if (!result.success || !result.data) {
        return {
          success: false,
          error: mapDatabaseError(new Error("AuditLog not found after update"), "update"),
        };
      }

      return { success: true, data: result.data };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "update") };
    }
  }

  async delete(id: AuditLogId, tenantId: TenantId): AsyncResult<void> {
    try {
      this.db
        .query("DELETE FROM audit_logs WHERE id = ? AND tenant_id = ?")
        .run(id, tenantId);

      return { success: true, data: undefined };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "delete") };
    }
  }

  private mapRowToEntity(row: AuditLogRow): AuditLog {
    return {
      id: row.id as UUID as AuditLogId,
      tenantId: row.tenant_id as UUID as TenantId,
      name: row.name,
      description: row.description || undefined,
      actorType: row.actor_type,
      actorId: row.actor_id as UUID,
      action: row.action,
      resourceType: row.resource_type,
      resourceId: row.resource_id as UUID,
      createdAt: row.created_at as ISODateTime,
      updatedAt: row.updated_at as ISODateTime,
    };
  }
}
