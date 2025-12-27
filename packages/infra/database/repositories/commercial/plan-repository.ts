import type { Database } from "bun:sqlite";
import {
  type AsyncResult,
  type UUID,
} from "@odin/core-contracts";
import {
  type Plan,
  type PlanId,
  type CreatePlanData,
  type UpdatePlanData,
  type IPlanRepository,
  type PlanTier,
  type BillingInterval,
} from "@odin/domain";
import { mapDatabaseError } from "../../error-mapper";
import { DbTimestamp, JsonColumn, Pagination } from "../../types";


interface PlanRow {
  id: string;
  key: string;
  name: string;
  description: string | null;
  tier: string;
  billing_interval: string;
  base_price: number;
  currency: string;
  created_at: string;
  updated_at: string;
  [key: string]: unknown;
}

export class SqlitePlanRepository implements IPlanRepository {
  constructor(private db: Database) {}

  async findById(id: PlanId): AsyncResult<Plan | null> {
    try {
      const row = this.db
        .query<PlanRow, [string]>(
          "SELECT * FROM plans WHERE id = ?"
        )
        .get(id);

      if (!row) {
        return { success: true, data: null };
      }

      return { success: true, data: this.mapRowToEntity(row) };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "findById") };
    }
  }

  async findByKey(key: string): AsyncResult<Plan | null> {
    try {
      const row = this.db
        .query<PlanRow, [string, string]>(
          "SELECT * FROM plans WHERE key = ? ")
        .get(key);

      if (!row) {
        return { success: true, data: null };
      }

      return { success: true, data: this.mapRowToEntity(row) };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "findByKey") };
    }
  }

  async findByTier(tier: PlanTier): AsyncResult<readonly Plan[]> {
    try {
      const rows = this.db
        .query<PlanRow>(
          "SELECT * FROM plans WHERE tier = ?"
        )
        .all(tier);

      
      return {
        success: true,
        data: rows.map(row => this.mapRowToEntity(row))
      };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "findByTier") };
    }
  }

  async findActive(): AsyncResult<readonly Plan[]> {
    try {
      const rows = this.db
        .query<PlanRow>(
          "SELECT * FROM plans WHERE is_active = ?"
        )
        .all(1);

      
      return {
        success: true,
        data: rows.map(row => this.mapRowToEntity(row))
      };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "findActive") };
    }
  }

  async create(data: CreatePlanData): AsyncResult<Plan> {
    try {
      const id = (globalThis as any).crypto.randomUUID();
      const now = DbTimestamp.now();

      this.db
        .query(
          `INSERT INTO plans (
            id, key,
            name, description, tier, billing_interval, base_price, currency,
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .run(
          id,
          data.key,
          data.name,
          data.description || null,
          data.tier,
          data.billingInterval,
          data.basePrice,
          data.currency,
          now,
          now
        );

      const result = await this.findById(id as PlanId);
      if (!result.success || !result.data) {
        return {
          success: false,
          error: mapDatabaseError(new Error("Failed to create Plan"), "create"),
        };
      }

      return { success: true, data: result.data };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "create") };
    }
  }

  async update(
    id: PlanId,
    data: UpdatePlanData,
  ): AsyncResult<Plan> {
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
        return await this.findById(id) as AsyncResult<Plan>;
      }

      updates.push("updated_at = ?");
      params.push(DbTimestamp.now());

      params.push(id);

      this.db
        .query(
          `UPDATE plans SET ${updates.join(", ")} WHERE id = ?`
        )
        .run(...params);

      const result = await this.findById(id);
      if (!result.success || !result.data) {
        return {
          success: false,
          error: mapDatabaseError(new Error("Plan not found after update"), "update"),
        };
      }

      return { success: true, data: result.data };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "update") };
    }
  }

  async delete(id: PlanId): AsyncResult<void> {
    try {
      this.db
        .query("DELETE FROM plans WHERE id = ?")
        .run(id);

      return { success: true, data: undefined };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "delete") };
    }
  }

  private mapRowToEntity(row: PlanRow): Plan {
    return {
      id: row.id as UUID as PlanId,
      key: row.key,
      name: row.name,
      description: row.description || undefined,
      tier: row.tier,
      billingInterval: row.billing_interval,
      basePrice: row.base_price,
      currency: row.currency,
      createdAt: row.created_at as ISODateTime,
      updatedAt: row.updated_at as ISODateTime,
    };
  }
}
