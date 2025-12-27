import type { Database } from "bun:sqlite";
import {
  type AsyncResult,
  type TenantId,
  type UUID,
} from "@odin/core-contracts";
import {
  type ExtendedTenantSettings,
  type TenantSettingsId,
  type CreateExtendedTenantSettingsData,
  type UpdateExtendedTenantSettingsData,
  type ITenantSettingsRepository,
} from "@odin/domain";
import { mapDatabaseError } from "../../error-mapper";
import { DbTimestamp, JsonColumn, Pagination } from "../../types";


interface ExtendedTenantSettingsRow {
  id: string;
  tenant_id: string;
  name: string;
  description: string | null;
  timezone: string;
  locale: string;
  currency: string;
  created_at: string;
  updated_at: string;
}

export class SqliteTenantSettingsRepository implements ITenantSettingsRepository {
  constructor(private db: Database) {}

  async findById(id: TenantSettingsId, tenantId: TenantId): AsyncResult<ExtendedTenantSettings | null> {
    try {
      const row = this.db
        .query<ExtendedTenantSettingsRow, [string, string]>(
          "SELECT * FROM tenant_settings WHERE id = ? AND tenant_id = ?"
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

  async findByTenantId(tenantId: TenantId): AsyncResult<ExtendedTenantSettings | null> {
    try {
      const row = this.db
        .query<ExtendedTenantSettingsRow>(
          "SELECT * FROM tenant_settings WHERE tenant_id = ? AND tenant_id = ?"
        )
        .get(tenantId, tenantId);

      
      if (!row) {
        return { success: true, data: null };
      }
      return { success: true, data: this.mapRowToEntity(row) };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "findByTenantId") };
    }
  }

  async create(data: CreateExtendedTenantSettingsData): AsyncResult<ExtendedTenantSettings> {
    try {
      const id = (globalThis as any).crypto.randomUUID();
      const now = DbTimestamp.now();

      this.db
        .query(
          `INSERT INTO tenant_settings (
            id, tenant_id,
            name, description, timezone, locale, currency,
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .run(
          id,
          data.tenantId,
          data.name,
          data.description || null,
          data.timezone,
          data.locale,
          data.currency,
          now,
          now
        );

      const result = await this.findById(id as TenantSettingsId, data.tenantId);
      if (!result.success || !result.data) {
        return {
          success: false,
          error: mapDatabaseError(new Error("Failed to create ExtendedTenantSettings"), "create"),
        };
      }

      return { success: true, data: result.data };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "create") };
    }
  }

  async update(
    id: TenantSettingsId,
    data: UpdateExtendedTenantSettingsData,
    tenantId: TenantId
  ): AsyncResult<ExtendedTenantSettings> {
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
        return await this.findById(id, tenantId) as AsyncResult<ExtendedTenantSettings>;
      }

      updates.push("updated_at = ?");
      params.push(DbTimestamp.now());

      params.push(id);
      params.push(tenantId);

      this.db
        .query(
          `UPDATE tenant_settings SET ${updates.join(", ")} WHERE id = ? AND tenant_id = ?`
        )
        .run(...params);

      const result = await this.findById(id, tenantId);
      if (!result.success || !result.data) {
        return {
          success: false,
          error: mapDatabaseError(new Error("ExtendedTenantSettings not found after update"), "update"),
        };
      }

      return { success: true, data: result.data };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "update") };
    }
  }

  async delete(id: TenantSettingsId, tenantId: TenantId): AsyncResult<void> {
    try {
      this.db
        .query("DELETE FROM tenant_settings WHERE id = ? AND tenant_id = ?")
        .run(id, tenantId);

      return { success: true, data: undefined };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "delete") };
    }
  }

  private mapRowToEntity(row: ExtendedTenantSettingsRow): ExtendedTenantSettings {
    return {
      id: row.id as TenantSettingsId,
      tenantId: row.tenant_id as TenantId,
      name: row.name,
      description: row.description || undefined,
      timezone: row.timezone,
      locale: row.locale,
      currency: row.currency,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
