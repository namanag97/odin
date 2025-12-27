import type { Database } from "bun:sqlite";
import {
  type AsyncResult,
  type TenantId,
  type UUID,
} from "@odin/core-contracts";
import {
  type Integration,
  type IntegrationId,
  type CreateIntegrationData,
  type UpdateIntegrationData,
  type IIntegrationRepository,
  type IntegrationStatus,
  type IntegrationType,
} from "@odin/domain";
import { mapDatabaseError } from "../../error-mapper";
import { DbTimestamp, JsonColumn, Pagination } from "../../types";


interface IntegrationRow {
  id: string;
  tenant_id: string;
  name: string;
  description: string | null;
  status: string;
  type: string;
  provider: string;
  created_at: string;
  updated_at: string;
}

export class SqliteIntegrationRepository implements IIntegrationRepository {
  constructor(private db: Database) {}

  async findById(id: IntegrationId, tenantId: TenantId): AsyncResult<Integration | null> {
    try {
      const row = this.db
        .query<IntegrationRow, [string, string]>(
          "SELECT * FROM integrations WHERE id = ? AND tenant_id = ?"
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

  async findByTenantId(tenantId: TenantId): AsyncResult<readonly Integration[]> {
    try {
      const rows = this.db
        .query<IntegrationRow>(
          "SELECT * FROM integrations WHERE tenant_id = ? AND tenant_id = ?"
        )
        .all(tenantId, tenantId);

      
      return {
        success: true,
        data: rows.map(row => this.mapRowToEntity(row))
      };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "findByTenantId") };
    }
  }

  async findByProvider(provider: string, tenantId: TenantId): AsyncResult<readonly Integration[]> {
    try {
      const rows = this.db
        .query<IntegrationRow>(
          "SELECT * FROM integrations WHERE provider = ? AND tenant_id = ?"
        )
        .all(provider, tenantId);

      
      return {
        success: true,
        data: rows.map(row => this.mapRowToEntity(row))
      };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "findByProvider") };
    }
  }

  async findByStatus(status: IntegrationStatus, tenantId: TenantId): AsyncResult<readonly Integration[]> {
    try {
      const rows = this.db
        .query<IntegrationRow>(
          "SELECT * FROM integrations WHERE status = ? AND tenant_id = ?"
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

  async create(data: CreateIntegrationData): AsyncResult<Integration> {
    try {
      const id = (globalThis as any).crypto.randomUUID();
      const now = DbTimestamp.now();

      this.db
        .query(
          `INSERT INTO integrations (
            id, tenant_id,
            name, description, status, type, provider,
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
          data.provider,
          now,
          now
        );

      const result = await this.findById(id as IntegrationId, data.tenantId);
      if (!result.success || !result.data) {
        return {
          success: false,
          error: mapDatabaseError(new Error("Failed to create Integration"), "create"),
        };
      }

      return { success: true, data: result.data };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "create") };
    }
  }

  async update(
    id: IntegrationId,
    data: UpdateIntegrationData,
    tenantId: TenantId
  ): AsyncResult<Integration> {
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
        return await this.findById(id, tenantId) as AsyncResult<Integration>;
      }

      updates.push("updated_at = ?");
      params.push(DbTimestamp.now());

      params.push(id);
      params.push(tenantId);

      this.db
        .query(
          `UPDATE integrations SET ${updates.join(", ")} WHERE id = ? AND tenant_id = ?`
        )
        .run(...params);

      const result = await this.findById(id, tenantId);
      if (!result.success || !result.data) {
        return {
          success: false,
          error: mapDatabaseError(new Error("Integration not found after update"), "update"),
        };
      }

      return { success: true, data: result.data };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "update") };
    }
  }

  async delete(id: IntegrationId, tenantId: TenantId): AsyncResult<void> {
    try {
      this.db
        .query("DELETE FROM integrations WHERE id = ? AND tenant_id = ?")
        .run(id, tenantId);

      return { success: true, data: undefined };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "delete") };
    }
  }

  private mapRowToEntity(row: IntegrationRow): Integration {
    return {
      id: row.id as IntegrationId,
      tenantId: row.tenant_id as TenantId,
      name: row.name,
      description: row.description || undefined,
      status: row.status as IntegrationStatus,
      type: row.type as IntegrationType,
      provider: row.provider,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
