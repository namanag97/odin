import type { Database } from "bun:sqlite";
import {
  type AsyncResult,
  type TenantId,
  type UUID,
} from "@odin/core-contracts";
import {
  type UsageRecord,
  type UsageRecordId,
  type CreateUsageRecordData,
  type UpdateUsageRecordData,
  type IUsageRepository,
} from "@odin/domain";
import { mapDatabaseError } from "../../error-mapper";
import { DbTimestamp, JsonColumn, Pagination } from "../../types";


interface UsageRecordRow {
  id: string;
  tenant_id: string;
  name: string;
  description: string | null;
  subscription_id: string;
  resource_type: string;
  quantity: number;
  timestamp: string;
  created_at: string;
  updated_at: string;
}

export class SqliteUsageRepository implements IUsageRepository {
  constructor(private db: Database) {}

  async findById(id: UsageRecordId, tenantId: TenantId): AsyncResult<UsageRecord | null> {
    try {
      const row = this.db
        .query<UsageRecordRow, [string, string]>(
          "SELECT * FROM usage_records WHERE id = ? AND tenant_id = ?"
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

  async findBySubscriptionId(subscriptionId: UUID, tenantId: TenantId): AsyncResult<readonly UsageRecord[]> {
    try {
      const rows = this.db
        .query<UsageRecordRow>(
          "SELECT * FROM usage_records WHERE subscription_id = ? AND tenant_id = ?"
        )
        .all(subscriptionId, tenantId);

      
      return {
        success: true,
        data: rows.map(row => this.mapRowToEntity(row))
      };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "findBySubscriptionId") };
    }
  }

  async findByResourceType(resourceType: string, tenantId: TenantId): AsyncResult<readonly UsageRecord[]> {
    try {
      const rows = this.db
        .query<UsageRecordRow>(
          "SELECT * FROM usage_records WHERE resource_type = ? AND tenant_id = ?"
        )
        .all(resourceType, tenantId);

      
      return {
        success: true,
        data: rows.map(row => this.mapRowToEntity(row))
      };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "findByResourceType") };
    }
  }

  async create(data: CreateUsageRecordData): AsyncResult<UsageRecord> {
    try {
      const id = (globalThis as any).crypto.randomUUID();
      const now = DbTimestamp.now();

      this.db
        .query(
          `INSERT INTO usage_records (
            id, tenant_id,
            name, description, subscription_id, resource_type, quantity, timestamp,
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .run(
          id,
          data.tenantId,
          data.name,
          data.description || null,
          data.subscriptionId,
          data.resourceType,
          data.quantity,
          data.timestamp,
          now,
          now
        );

      const result = await this.findById(id as UsageRecordId, data.tenantId);
      if (!result.success || !result.data) {
        return {
          success: false,
          error: mapDatabaseError(new Error("Failed to create UsageRecord"), "create"),
        };
      }

      return { success: true, data: result.data };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "create") };
    }
  }

  async update(
    id: UsageRecordId,
    data: UpdateUsageRecordData,
    tenantId: TenantId
  ): AsyncResult<UsageRecord> {
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
        return await this.findById(id, tenantId) as AsyncResult<UsageRecord>;
      }

      updates.push("updated_at = ?");
      params.push(DbTimestamp.now());

      params.push(id);
      params.push(tenantId);

      this.db
        .query(
          `UPDATE usage_records SET ${updates.join(", ")} WHERE id = ? AND tenant_id = ?`
        )
        .run(...params);

      const result = await this.findById(id, tenantId);
      if (!result.success || !result.data) {
        return {
          success: false,
          error: mapDatabaseError(new Error("UsageRecord not found after update"), "update"),
        };
      }

      return { success: true, data: result.data };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "update") };
    }
  }

  async delete(id: UsageRecordId, tenantId: TenantId): AsyncResult<void> {
    try {
      this.db
        .query("DELETE FROM usage_records WHERE id = ? AND tenant_id = ?")
        .run(id, tenantId);

      return { success: true, data: undefined };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "delete") };
    }
  }

  private mapRowToEntity(row: UsageRecordRow): UsageRecord {
    return {
      id: row.id as UsageRecordId,
      tenantId: row.tenant_id as TenantId,
      name: row.name,
      description: row.description || undefined,
      subscriptionId: row.subscription_id,
      resourceType: row.resource_type,
      quantity: row.quantity,
      timestamp: row.timestamp,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
