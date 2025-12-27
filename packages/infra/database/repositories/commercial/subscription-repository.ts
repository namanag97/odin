import type { Database } from "bun:sqlite";
import {
  type AsyncResult,
  type TenantId,
  type UUID,
} from "@odin/core-contracts";
import {
  type Subscription,
  type SubscriptionId,
  type CreateSubscriptionData,
  type UpdateSubscriptionData,
  type ISubscriptionRepository,
  type SubscriptionStatus,
} from "@odin/domain";
import { mapDatabaseError } from "../../error-mapper";
import { DbTimestamp, JsonColumn, Pagination } from "../../types";


interface SubscriptionRow {
  id: string;
  tenant_id: string;
  name: string;
  description: string | null;
  status: string;
  plan_id: string;
  current_period_start: string;
  current_period_end: string;
  created_at: string;
  updated_at: string;
}

export class SqliteSubscriptionRepository implements ISubscriptionRepository {
  constructor(private db: Database) {}

  async findById(id: SubscriptionId, tenantId: TenantId): AsyncResult<Subscription | null> {
    try {
      const row = this.db
        .query<SubscriptionRow, [string, string]>(
          "SELECT * FROM subscriptions WHERE id = ? AND tenant_id = ?"
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

  async findByTenantId(tenantId: TenantId): AsyncResult<readonly Subscription[]> {
    try {
      const rows = this.db
        .query<SubscriptionRow>(
          "SELECT * FROM subscriptions WHERE tenant_id = ? AND tenant_id = ?"
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

  async findByPlanId(planId: UUID, tenantId: TenantId): AsyncResult<readonly Subscription[]> {
    try {
      const rows = this.db
        .query<SubscriptionRow>(
          "SELECT * FROM subscriptions WHERE plan_id = ? AND tenant_id = ?"
        )
        .all(planId, tenantId);

      
      return {
        success: true,
        data: rows.map(row => this.mapRowToEntity(row))
      };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "findByPlanId") };
    }
  }

  async findByStatus(status: SubscriptionStatus, tenantId: TenantId): AsyncResult<readonly Subscription[]> {
    try {
      const rows = this.db
        .query<SubscriptionRow>(
          "SELECT * FROM subscriptions WHERE status = ? AND tenant_id = ?"
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

  async create(data: CreateSubscriptionData): AsyncResult<Subscription> {
    try {
      const id = (globalThis as any).crypto.randomUUID();
      const now = DbTimestamp.now();

      this.db
        .query(
          `INSERT INTO subscriptions (
            id, tenant_id,
            name, description, status, plan_id, current_period_start, current_period_end,
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .run(
          id,
          data.tenantId,
          data.name,
          data.description || null,
          data.status || "draft",
          data.planId,
          data.currentPeriodStart,
          data.currentPeriodEnd,
          now,
          now
        );

      const result = await this.findById(id as SubscriptionId, data.tenantId);
      if (!result.success || !result.data) {
        return {
          success: false,
          error: mapDatabaseError(new Error("Failed to create Subscription"), "create"),
        };
      }

      return { success: true, data: result.data };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "create") };
    }
  }

  async update(
    id: SubscriptionId,
    data: UpdateSubscriptionData,
    tenantId: TenantId
  ): AsyncResult<Subscription> {
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
        return await this.findById(id, tenantId) as AsyncResult<Subscription>;
      }

      updates.push("updated_at = ?");
      params.push(DbTimestamp.now());

      params.push(id);
      params.push(tenantId);

      this.db
        .query(
          `UPDATE subscriptions SET ${updates.join(", ")} WHERE id = ? AND tenant_id = ?`
        )
        .run(...params);

      const result = await this.findById(id, tenantId);
      if (!result.success || !result.data) {
        return {
          success: false,
          error: mapDatabaseError(new Error("Subscription not found after update"), "update"),
        };
      }

      return { success: true, data: result.data };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "update") };
    }
  }

  async delete(id: SubscriptionId, tenantId: TenantId): AsyncResult<void> {
    try {
      this.db
        .query("DELETE FROM subscriptions WHERE id = ? AND tenant_id = ?")
        .run(id, tenantId);

      return { success: true, data: undefined };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "delete") };
    }
  }

  private mapRowToEntity(row: SubscriptionRow): Subscription {
    return {
      id: row.id as UUID as SubscriptionId,
      tenantId: row.tenant_id as UUID as TenantId,
      name: row.name,
      description: row.description || undefined,
      status: row.status as SubscriptionStatus,
      planId: row.plan_id as UUID,
      currentPeriodStart: row.current_period_start as ISODateTime,
      currentPeriodEnd: row.current_period_end as ISODateTime,
      createdAt: row.created_at as ISODateTime,
      updatedAt: row.updated_at as ISODateTime,
    };
  }
}
