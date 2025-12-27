import type { Database } from "bun:sqlite";
import {
  type AsyncResult,
  type UUID,
} from "@odin/core-contracts";
import {
  type OAuthToken,
  type OAuthTokenId,
  type CreateOAuthTokenData,
  type UpdateOAuthTokenData,
  type IOAuthTokenRepository,
} from "@odin/domain";
import { mapDatabaseError } from "../../error-mapper";
import { DbTimestamp, JsonColumn, Pagination } from "../../types";


interface OAuthTokenRow {
  id: string;
  name: string;
  description: string | null;
  integration_id: string;
  token_type: string;
  expires_at: string;
  created_at: string;
  updated_at: string;
  [key: string]: unknown;
}

export class SqliteOAuthTokenRepository implements IOAuthTokenRepository {
  constructor(private db: Database) {}

  async findById(id: OAuthTokenId): AsyncResult<OAuthToken | null> {
    try {
      const row = this.db
        .query<OAuthTokenRow, [string]>(
          "SELECT * FROM oauth_tokens WHERE id = ?"
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

  async findByIntegrationId(integrationId: UUID): AsyncResult<readonly OAuthToken[]> {
    try {
      const rows = this.db
        .query<OAuthTokenRow>(
          "SELECT * FROM oauth_tokens WHERE integration_id = ?"
        )
        .all(integrationId);

      
      return {
        success: true,
        data: rows.map(row => this.mapRowToEntity(row))
      };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "findByIntegrationId") };
    }
  }

  async create(data: CreateOAuthTokenData): AsyncResult<OAuthToken> {
    try {
      const id = (globalThis as any).crypto.randomUUID();
      const now = DbTimestamp.now();

      this.db
        .query(
          `INSERT INTO oauth_tokens (
            id,
            name, description, integration_id, token_type, expires_at,
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .run(
          id,
          data.name,
          data.description || null,
          data.integrationId,
          data.tokenType,
          data.expiresAt,
          now,
          now
        );

      const result = await this.findById(id as OAuthTokenId);
      if (!result.success || !result.data) {
        return {
          success: false,
          error: mapDatabaseError(new Error("Failed to create OAuthToken"), "create"),
        };
      }

      return { success: true, data: result.data };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "create") };
    }
  }

  async update(
    id: OAuthTokenId,
    data: UpdateOAuthTokenData,
  ): AsyncResult<OAuthToken> {
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
        return await this.findById(id) as AsyncResult<OAuthToken>;
      }

      updates.push("updated_at = ?");
      params.push(DbTimestamp.now());

      params.push(id);

      this.db
        .query(
          `UPDATE oauth_tokens SET ${updates.join(", ")} WHERE id = ?`
        )
        .run(...params);

      const result = await this.findById(id);
      if (!result.success || !result.data) {
        return {
          success: false,
          error: mapDatabaseError(new Error("OAuthToken not found after update"), "update"),
        };
      }

      return { success: true, data: result.data };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "update") };
    }
  }

  async delete(id: OAuthTokenId): AsyncResult<void> {
    try {
      this.db
        .query("DELETE FROM oauth_tokens WHERE id = ?")
        .run(id);

      return { success: true, data: undefined };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "delete") };
    }
  }

  private mapRowToEntity(row: OAuthTokenRow): OAuthToken {
    return {
      id: row.id as OAuthTokenId,
      name: row.name,
      description: row.description || undefined,
      integrationId: row.integration_id,
      tokenType: row.token_type,
      expiresAt: row.expires_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
