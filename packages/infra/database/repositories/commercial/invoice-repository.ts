import type { Database } from "bun:sqlite";
import {
  type AsyncResult,
  type TenantId,
  type UUID,
  type PageRequest,
  type PageResponse,
} from "@odin/core-contracts";
import {
  type Invoice,
  type InvoiceId,
  type CreateInvoiceData,
  type UpdateInvoiceData,
  type IInvoiceRepository,
  type InvoiceStatus,
} from "@odin/domain";
import { mapDatabaseError } from "../../error-mapper";
import { DbTimestamp, JsonColumn, Pagination } from "../../types";


interface InvoiceRow {
  id: string;
  tenant_id: string;
  name: string;
  description: string | null;
  status: string;
  number: string;
  total: number;
  amount_due: number;
  due_date: string;
  created_at: string;
  updated_at: string;
}

export class SqliteInvoiceRepository implements IInvoiceRepository {
  constructor(private db: Database) {}

  async findById(id: InvoiceId, tenantId: TenantId): AsyncResult<Invoice | null> {
    try {
      const row = this.db
        .query<InvoiceRow, [string, string]>(
          "SELECT * FROM invoices WHERE id = ? AND tenant_id = ?"
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

  async findByTenantId(tenantId: TenantId, page: PageRequest): AsyncResult<PageResponse<Invoice>> {
    try {
      const { limit, offset } = Pagination.toOffset(page);

      const rows = this.db
        .query<InvoiceRow>(
          "SELECT * FROM invoices WHERE tenant_id = ? AND tenant_id = ? LIMIT ? OFFSET ?"
        )
        .all(tenantId, tenantId, limit, offset);

      const countRow = this.db
        .query<{ count: number }>(
          "SELECT COUNT(*) as count FROM invoices WHERE tenant_id = ? AND tenant_id = ?"
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

  async findByStatus(status: InvoiceStatus, tenantId: TenantId): AsyncResult<readonly Invoice[]> {
    try {
      const rows = this.db
        .query<InvoiceRow>(
          "SELECT * FROM invoices WHERE status = ? AND tenant_id = ?"
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

  async create(data: CreateInvoiceData): AsyncResult<Invoice> {
    try {
      const id = (globalThis as any).crypto.randomUUID();
      const now = DbTimestamp.now();

      this.db
        .query(
          `INSERT INTO invoices (
            id, tenant_id,
            name, description, status, number, total, amount_due, due_date,
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .run(
          id,
          data.tenantId,
          data.name,
          data.description || null,
          data.status || "draft",
          data.number,
          data.total,
          data.amountDue,
          data.dueDate,
          now,
          now
        );

      const result = await this.findById(id as InvoiceId, data.tenantId);
      if (!result.success || !result.data) {
        return {
          success: false,
          error: mapDatabaseError(new Error("Failed to create Invoice"), "create"),
        };
      }

      return { success: true, data: result.data };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "create") };
    }
  }

  async update(
    id: InvoiceId,
    data: UpdateInvoiceData,
    tenantId: TenantId
  ): AsyncResult<Invoice> {
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
        return await this.findById(id, tenantId) as AsyncResult<Invoice>;
      }

      updates.push("updated_at = ?");
      params.push(DbTimestamp.now());

      params.push(id);
      params.push(tenantId);

      this.db
        .query(
          `UPDATE invoices SET ${updates.join(", ")} WHERE id = ? AND tenant_id = ?`
        )
        .run(...params);

      const result = await this.findById(id, tenantId);
      if (!result.success || !result.data) {
        return {
          success: false,
          error: mapDatabaseError(new Error("Invoice not found after update"), "update"),
        };
      }

      return { success: true, data: result.data };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "update") };
    }
  }

  async delete(id: InvoiceId, tenantId: TenantId): AsyncResult<void> {
    try {
      this.db
        .query("DELETE FROM invoices WHERE id = ? AND tenant_id = ?")
        .run(id, tenantId);

      return { success: true, data: undefined };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "delete") };
    }
  }

  private mapRowToEntity(row: InvoiceRow): Invoice {
    return {
      id: row.id as InvoiceId,
      tenantId: row.tenant_id as TenantId,
      name: row.name,
      description: row.description || undefined,
      status: row.status as InvoiceStatus,
      number: row.number,
      total: row.total,
      amountDue: row.amount_due,
      dueDate: row.due_date,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
