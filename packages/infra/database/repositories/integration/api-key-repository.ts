import type { Database } from "bun:sqlite";
import {
  type AsyncResult,
  type TenantId,
  type UUID,
} from "@odin/core-contracts";
import {
  type ApiKey,
  type ApiKeyId,
  type CreateApiKeyData,
  type UpdateApiKeyData,
  type IApiKeyRepository,
} from "@odin/domain";
import { mapDatabaseError } from "../../error-mapper";
import { DbTimestamp, JsonColumn, Pagination } from "../../types";


interface ApiKeyRow {
  id: string;
  tenant_id: string;
  name: string;
  description: string | null;
  key_prefix: string;
  key_hash: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export class SqliteApiKeyRepository implements IApiKeyRepository {
  constructor(private db: Database) {}

  async findById(id: ApiKeyId, tenantId: TenantId): AsyncResult<ApiKey | null> {
    try {
      const row = this.db
        .query<ApiKeyRow, [string, string]>(
          "SELECT * FROM api_keys WHERE id = ? AND tenant_id = ?"
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

  async findByTenantId(tenantId: TenantId): AsyncResult<readonly ApiKey[]> {
    try {
      const rows = this.db
        .query<ApiKeyRow>(
          "SELECT * FROM api_keys WHERE tenant_id = ? AND tenant_id = ?"
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

  async findByKeyHash(keyHash: string, tenantId: TenantId): AsyncResult<ApiKey | null> {
    try {
      const row = this.db
        .query<ApiKeyRow>(
          "SELECT * FROM api_keys WHERE key_hash = ? AND tenant_id = ?"
        )
        .get(keyHash, tenantId);

      
      if (!row) {
        return { success: true, data: null };
      }
      return { success: true, data: this.mapRowToEntity(row) };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "findByKeyHash") };
    }
  }

  async create(data: CreateApiKeyData): AsyncResult<ApiKey> {
    try {
      const id = (globalThis as any).crypto.randomUUID();
      const now = DbTimestamp.now();

      this.db
        .query(
          `INSERT INTO api_keys (
            id, tenant_id,
            name, description, key_prefix, key_hash, created_by,
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .run(
          id,
          data.tenantId,
          data.name,
          data.description || null,
          data.keyPrefix,
          data.keyHash,
          data.createdBy,
          now,
          now
        );

      const result = await this.findById(id as ApiKeyId, data.tenantId);
      if (!result.success || !result.data) {
        return {
          success: false,
          error: mapDatabaseError(new Error("Failed to create ApiKey"), "create"),
        };
      }

      return { success: true, data: result.data };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "create") };
    }
  }

  async update(
    id: ApiKeyId,
    data: UpdateApiKeyData,
    tenantId: TenantId
  ): AsyncResult<ApiKey> {
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
        return await this.findById(id, tenantId) as AsyncResult<ApiKey>;
      }

      updates.push("updated_at = ?");
      params.push(DbTimestamp.now());

      params.push(id);
      params.push(tenantId);

      this.db
        .query(
          `UPDATE api_keys SET ${updates.join(", ")} WHERE id = ? AND tenant_id = ?`
        )
        .run(...params);

      const result = await this.findById(id, tenantId);
      if (!result.success || !result.data) {
        return {
          success: false,
          error: mapDatabaseError(new Error("ApiKey not found after update"), "update"),
        };
      }

      return { success: true, data: result.data };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "update") };
    }
  }

  async delete(id: ApiKeyId, tenantId: TenantId): AsyncResult<void> {
    try {
      this.db
        .query("DELETE FROM api_keys WHERE id = ? AND tenant_id = ?")
        .run(id, tenantId);

      return { success: true, data: undefined };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "delete") };
    }
  }

  private mapRowToEntity(row: ApiKeyRow): ApiKey {
    return {
      id: row.id as UUID as ApiKeyId,
      tenantId: row.tenant_id as UUID as TenantId,
      name: row.name,
      description: row.description || undefined,
      keyPrefix: row.key_prefix,
      keyHash: row.key_hash,
      createdBy: row.created_by,
      createdAt: row.created_at as ISODateTime,
      updatedAt: row.updated_at as ISODateTime,
    };
  }
}
