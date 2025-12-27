import type { Database } from "bun:sqlite";
import {
  type AsyncResult,
  type TenantId,
  type UUID,
} from "@odin/core-contracts";
import {
  type Webhook,
  type WebhookId,
  type CreateWebhookData,
  type UpdateWebhookData,
  type IWebhookRepository,
} from "@odin/domain";
import { mapDatabaseError } from "../../error-mapper";
import { DbTimestamp, JsonColumn, Pagination } from "../../types";


interface WebhookRow {
  id: string;
  tenant_id: string;
  name: string;
  description: string | null;
  url: string;
  is_active: number;
  created_at: string;
  updated_at: string;
}

export class SqliteWebhookRepository implements IWebhookRepository {
  constructor(private db: Database) {}

  async findById(id: WebhookId, tenantId: TenantId): AsyncResult<Webhook | null> {
    try {
      const row = this.db
        .query<WebhookRow, [string, string]>(
          "SELECT * FROM webhooks WHERE id = ? AND tenant_id = ?"
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

  async findByTenantId(tenantId: TenantId): AsyncResult<readonly Webhook[]> {
    try {
      const rows = this.db
        .query<WebhookRow>(
          "SELECT * FROM webhooks WHERE tenant_id = ? AND tenant_id = ?"
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

  async findActive(tenantId: TenantId): AsyncResult<readonly Webhook[]> {
    try {
      const rows = this.db
        .query<WebhookRow>(
          "SELECT * FROM webhooks WHERE is_active = ? AND tenant_id = ?"
        )
        .all(1, tenantId);

      
      return {
        success: true,
        data: rows.map(row => this.mapRowToEntity(row))
      };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "findActive") };
    }
  }

  async create(data: CreateWebhookData): AsyncResult<Webhook> {
    try {
      const id = (globalThis as any).crypto.randomUUID();
      const now = DbTimestamp.now();

      this.db
        .query(
          `INSERT INTO webhooks (
            id, tenant_id,
            name, description, url, is_active,
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .run(
          id,
          data.tenantId,
          data.name,
          data.description || null,
          data.url,
          data.isActive ? 1 : 0,
          now,
          now
        );

      const result = await this.findById(id as WebhookId, data.tenantId);
      if (!result.success || !result.data) {
        return {
          success: false,
          error: mapDatabaseError(new Error("Failed to create Webhook"), "create"),
        };
      }

      return { success: true, data: result.data };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "create") };
    }
  }

  async update(
    id: WebhookId,
    data: UpdateWebhookData,
    tenantId: TenantId
  ): AsyncResult<Webhook> {
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
        return await this.findById(id, tenantId) as AsyncResult<Webhook>;
      }

      updates.push("updated_at = ?");
      params.push(DbTimestamp.now());

      params.push(id);
      params.push(tenantId);

      this.db
        .query(
          `UPDATE webhooks SET ${updates.join(", ")} WHERE id = ? AND tenant_id = ?`
        )
        .run(...params);

      const result = await this.findById(id, tenantId);
      if (!result.success || !result.data) {
        return {
          success: false,
          error: mapDatabaseError(new Error("Webhook not found after update"), "update"),
        };
      }

      return { success: true, data: result.data };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "update") };
    }
  }

  async delete(id: WebhookId, tenantId: TenantId): AsyncResult<void> {
    try {
      this.db
        .query("DELETE FROM webhooks WHERE id = ? AND tenant_id = ?")
        .run(id, tenantId);

      return { success: true, data: undefined };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "delete") };
    }
  }

  private mapRowToEntity(row: WebhookRow): Webhook {
    return {
      id: row.id as WebhookId,
      tenantId: row.tenant_id as TenantId,
      name: row.name,
      description: row.description || undefined,
      url: row.url,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
