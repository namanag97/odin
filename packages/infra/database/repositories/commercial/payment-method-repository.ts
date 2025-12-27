import type { Database } from "bun:sqlite";
import {
  type AsyncResult,
  type TenantId,
  type UUID,
  type ISODateTime,
} from "@odin/core-contracts";
import {
  type PaymentMethod,
  type PaymentMethodId,
  type CreatePaymentMethodData,
  type UpdatePaymentMethodData,
  type IPaymentMethodRepository,
  type PaymentMethodType,
  type PaymentProvider,
} from "@odin/domain";
import { mapDatabaseError } from "../../error-mapper";
import { DbTimestamp, JsonColumn, Pagination } from "../../types";


interface PaymentMethodRow {
  id: string;
  tenant_id: string;
  name: string;
  description: string | null;
  type: string;
  provider: string;
  is_default: number;
  created_at: string;
  updated_at: string;
}

export class SqlitePaymentMethodRepository implements IPaymentMethodRepository {
  constructor(private db: Database) {}

  async findById(id: PaymentMethodId): AsyncResult<PaymentMethod | null> {
    try {
      const row = this.db
        .query<PaymentMethodRow, [string, string]>(
          "SELECT * FROM payment_methods WHERE id = ? AND tenant_id = ?"
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

  async findByTenantId(tenantId: TenantId): AsyncResult<readonly PaymentMethod[]> {
    try {
      const rows = this.db
        .query<PaymentMethodRow>(
          "SELECT * FROM payment_methods WHERE tenant_id = ? AND tenant_id = ?"
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

  async findDefault(tenantId: TenantId): AsyncResult<PaymentMethod | null> {
    try {
      const row = this.db
        .query<PaymentMethodRow>(
          "SELECT * FROM payment_methods WHERE is_default = ? AND tenant_id = ?"
        )
        .get(1, tenantId);

      
      if (!row) {
        return { success: true, data: null };
      }
      return { success: true, data: this.mapRowToEntity(row) };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "findDefault") };
    }
  }

  async create(data: CreatePaymentMethodData): AsyncResult<PaymentMethod> {
    try {
      const id = (globalThis as any).crypto.randomUUID();
      const now = DbTimestamp.now();

      this.db
        .query(
          `INSERT INTO payment_methods (
            id, tenant_id,
            name, description, type, provider, is_default,
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .run(
          id,
          data.tenantId,
          data.name,
          data.description || null,
          data.type,
          data.provider,
          data.isDefault ? 1 : 0,
          now,
          now
        );

      const result = await this.findById(id as PaymentMethodId, data.tenantId);
      if (!result.success || !result.data) {
        return {
          success: false,
          error: mapDatabaseError(new Error("Failed to create PaymentMethod"), "create"),
        };
      }

      return { success: true, data: result.data };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "create") };
    }
  }

  async update(
    id: PaymentMethodId,
    data: UpdatePaymentMethodData,
    tenantId: TenantId
  ): AsyncResult<PaymentMethod> {
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
        return await this.findById(id, tenantId) as AsyncResult<PaymentMethod>;
      }

      updates.push("updated_at = ?");
      params.push(DbTimestamp.now());

      params.push(id);
      params.push(tenantId);

      this.db
        .query(
          `UPDATE payment_methods SET ${updates.join(", ")} WHERE id = ? AND tenant_id = ?`
        )
        .run(...params);

      const result = await this.findById(id, tenantId);
      if (!result.success || !result.data) {
        return {
          success: false,
          error: mapDatabaseError(new Error("PaymentMethod not found after update"), "update"),
        };
      }

      return { success: true, data: result.data };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "update") };
    }
  }

  async delete(id: PaymentMethodId): AsyncResult<void> {
    try {
      this.db
        .query("DELETE FROM payment_methods WHERE id = ? AND tenant_id = ?")
        .run(id, tenantId);

      return { success: true, data: undefined };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "delete") };
    }
  }

  private mapRowToEntity(row: PaymentMethodRow): PaymentMethod {
    return {
      id: row.id as UUID as PaymentMethodId,
      tenantId: row.tenant_id as UUID as TenantId,
      name: row.name,
      description: row.description || undefined,
      type: row.type as PaymentMethodType,
      provider: row.provider,
      isDefault: Boolean(row.is_default),
      createdAt: row.created_at as ISODateTime,
      updatedAt: row.updated_at as ISODateTime,
    };
  }
}
