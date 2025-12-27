import type { Database } from "bun:sqlite";
import {
  type AsyncResult,
  type UUID,
  type ISODateTime,
} from "@odin/core-contracts";
import {
  type Coupon,
  type CouponId,
  type CreateCouponData,
  type UpdateCouponData,
  type ICouponRepository,
  type DiscountType,
} from "@odin/domain";
import { mapDatabaseError } from "../../error-mapper";
import { DbTimestamp, JsonColumn, Pagination } from "../../types";


interface CouponRow {
  id: string;
  key: string;
  name: string;
  description: string | null;
  discount_type: string;
  discount_value: number;
  is_active: number;
  created_at: string;
  updated_at: string;
  [key: string]: unknown;
}

export class SqliteCouponRepository implements ICouponRepository {
  constructor(private db: Database) {}

  async findById(id: CouponId): AsyncResult<Coupon | null> {
    try {
      const row = this.db
        .query<CouponRow, [string]>(
          "SELECT * FROM coupons WHERE id = ?"
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

  async findByKey(key: string): AsyncResult<Coupon | null> {
    try {
      const row = this.db
        .query<CouponRow, [string, string]>(
          "SELECT * FROM coupons WHERE key = ? ")
        .get(key);

      if (!row) {
        return { success: true, data: null };
      }

      return { success: true, data: this.mapRowToEntity(row) };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "findByKey") };
    }
  }

  async findActive(): AsyncResult<readonly Coupon[]> {
    try {
      const rows = this.db
        .query<CouponRow>(
          "SELECT * FROM coupons WHERE is_active = ?"
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

  async create(data: CreateCouponData): AsyncResult<Coupon> {
    try {
      const id = (globalThis as any).crypto.randomUUID();
      const now = DbTimestamp.now();

      this.db
        .query(
          `INSERT INTO coupons (
            id, key,
            name, description, discount_type, discount_value, is_active,
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .run(
          id,
          data.key,
          data.name,
          data.description || null,
          data.discountType,
          data.discountValue,
          data.isActive ? 1 : 0,
          now,
          now
        );

      const result = await this.findById(id as CouponId);
      if (!result.success || !result.data) {
        return {
          success: false,
          error: mapDatabaseError(new Error("Failed to create Coupon"), "create"),
        };
      }

      return { success: true, data: result.data };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "create") };
    }
  }

  async update(
    id: CouponId,
    data: UpdateCouponData,
  ): AsyncResult<Coupon> {
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
        return await this.findById(id) as AsyncResult<Coupon>;
      }

      updates.push("updated_at = ?");
      params.push(DbTimestamp.now());

      params.push(id);

      this.db
        .query(
          `UPDATE coupons SET ${updates.join(", ")} WHERE id = ?`
        )
        .run(...params);

      const result = await this.findById(id);
      if (!result.success || !result.data) {
        return {
          success: false,
          error: mapDatabaseError(new Error("Coupon not found after update"), "update"),
        };
      }

      return { success: true, data: result.data };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "update") };
    }
  }

  async delete(id: CouponId): AsyncResult<void> {
    try {
      this.db
        .query("DELETE FROM coupons WHERE id = ?")
        .run(id);

      return { success: true, data: undefined };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "delete") };
    }
  }

  private mapRowToEntity(row: CouponRow): Coupon {
    return {
      id: row.id as UUID as CouponId,
      key: row.key,
      name: row.name,
      description: row.description || undefined,
      discountType: row.discount_type,
      discountValue: row.discount_value,
      isActive: Boolean(row.is_active),
      createdAt: row.created_at as ISODateTime,
      updatedAt: row.updated_at as ISODateTime,
    };
  }
}
