import type { Database } from "bun:sqlite";
import {
  type AsyncResult,
  type TenantId,
  type UUID,
  type PageRequest,
  type PageResponse,
} from "@odin/core-contracts";
import {
  type Case,
  type CaseId,
  type CreateCaseData,
  type UpdateCaseData,
  type ICaseRepository,
} from "@odin/domain";
import { mapDatabaseError } from "../../error-mapper";
import { DbTimestamp, JsonColumn, Pagination } from "../../types";


interface CaseRow {
  id: string;
  tenant_id: string;
  name: string;
  description: string | null;
  data_model_id: string;
  case_key: string;
  event_count: number;
  created_at: string;
  updated_at: string;
}

export class SqliteCaseRepository implements ICaseRepository {
  constructor(private db: Database) {}

  async findById(id: CaseId, tenantId: TenantId): AsyncResult<Case | null> {
    try {
      const row = this.db
        .query<CaseRow, [string, string]>(
          "SELECT * FROM cases WHERE id = ? AND tenant_id = ?"
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

  async findByDataModelId(dataModelId: UUID, tenantId: TenantId, page: PageRequest): AsyncResult<PageResponse<Case>> {
    try {
      const { limit, offset } = Pagination.toOffset(page);

      const rows = this.db
        .query<CaseRow>(
          "SELECT * FROM cases WHERE data_model_id = ? AND tenant_id = ? LIMIT ? OFFSET ?"
        )
        .all(dataModelId, tenantId, limit, offset);

      const countRow = this.db
        .query<{ count: number }>(
          "SELECT COUNT(*) as count FROM cases WHERE data_model_id = ? AND tenant_id = ?"
        )
        .get(dataModelId, tenantId);

      const items = rows.map(row => this.mapRowToEntity(row));
      const total = countRow?.count || 0;

      return {
        success: true,
        data: Pagination.buildResponse(items, total, page)
      };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "findByDataModelId") };
    }
  }

  async create(data: CreateCaseData): AsyncResult<Case> {
    try {
      const id = (globalThis as any).crypto.randomUUID();
      const now = DbTimestamp.now();

      this.db
        .query(
          `INSERT INTO cases (
            id, tenant_id,
            name, description, data_model_id, case_key, event_count,
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .run(
          id,
          data.tenantId,
          data.name,
          data.description || null,
          data.dataModelId,
          data.caseKey,
          data.eventCount,
          now,
          now
        );

      const result = await this.findById(id as CaseId, data.tenantId);
      if (!result.success || !result.data) {
        return {
          success: false,
          error: mapDatabaseError(new Error("Failed to create Case"), "create"),
        };
      }

      return { success: true, data: result.data };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "create") };
    }
  }

  async update(
    id: CaseId,
    data: UpdateCaseData,
    tenantId: TenantId
  ): AsyncResult<Case> {
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
        return await this.findById(id, tenantId) as AsyncResult<Case>;
      }

      updates.push("updated_at = ?");
      params.push(DbTimestamp.now());

      params.push(id);
      params.push(tenantId);

      this.db
        .query(
          `UPDATE cases SET ${updates.join(", ")} WHERE id = ? AND tenant_id = ?`
        )
        .run(...params);

      const result = await this.findById(id, tenantId);
      if (!result.success || !result.data) {
        return {
          success: false,
          error: mapDatabaseError(new Error("Case not found after update"), "update"),
        };
      }

      return { success: true, data: result.data };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "update") };
    }
  }

  async delete(id: CaseId, tenantId: TenantId): AsyncResult<void> {
    try {
      this.db
        .query("DELETE FROM cases WHERE id = ? AND tenant_id = ?")
        .run(id, tenantId);

      return { success: true, data: undefined };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "delete") };
    }
  }

  private mapRowToEntity(row: CaseRow): Case {
    return {
      id: row.id as UUID as CaseId,
      tenantId: row.tenant_id as UUID as TenantId,
      name: row.name,
      description: row.description || undefined,
      dataModelId: row.data_model_id as UUID,
      caseKey: row.case_key,
      eventCount: row.event_count,
      createdAt: row.created_at as ISODateTime,
      updatedAt: row.updated_at as ISODateTime,
    };
  }
}
