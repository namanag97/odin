/**
 * Session Repository Implementation - SQLite
 *
 * Implements ISessionRepository using Bun's native SQLite driver
 */

import type { Database } from "bun:sqlite";
import type { UserId, UUID, TenantId, AsyncResult } from "@odin/core-contracts";
import type {
  Session,
  CreateSessionData,
  ISessionRepository
} from "@odin/domain";
import { mapDatabaseError } from "../../error-mapper";
import { DbTimestamp } from "../../types";

// ============================================================================
// Database Row Type
// ============================================================================

interface SessionRow {
  id: string;
  user_id: string;
  token_hash: string;
  ip_address: string | null;
  user_agent: string | null;
  device_fingerprint: string | null;
  location: string | null; // JSON
  created_at: string;
  expires_at: string;
  last_active_at: string;
  revoked_at: string | null;
}

// ============================================================================
// Repository Implementation
// ============================================================================

export class SqliteSessionRepository implements ISessionRepository {
  constructor(private db: Database) {}

  // -------------------------------------------------------------------------
  // Queries
  // -------------------------------------------------------------------------

  async findById(id: UUID): AsyncResult<Session | null> {
    try {
      const row = this.db
        .query<SessionRow, [string]>("SELECT * FROM sessions WHERE id = ?")
        .get(id);

      if (!row) {
        return { success: true, data: null };
      }

      const session = await this.mapRowToEntity(row);
      return { success: true, data: session };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "findById") };
    }
  }

  async findByToken(tokenHash: string): AsyncResult<Session | null> {
    try {
      const row = this.db
        .query<SessionRow, [string]>("SELECT * FROM sessions WHERE token_hash = ? AND revoked_at IS NULL")
        .get(tokenHash);

      if (!row) {
        return { success: true, data: null };
      }

      const session = await this.mapRowToEntity(row);
      return { success: true, data: session };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "findByToken") };
    }
  }

  async findActiveByUser(userId: UserId): AsyncResult<readonly Session[]> {
    try {
      const now = DbTimestamp.now();

      const rows = this.db
        .query<SessionRow, [string, string]>(
          `SELECT * FROM sessions
           WHERE user_id = ?
             AND revoked_at IS NULL
             AND expires_at > ?
           ORDER BY last_active_at DESC`
        )
        .all(userId, now);

      const sessions = await Promise.all(rows.map((row: any) => this.mapRowToEntity(row)));

      return { success: true, data: sessions };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "findActiveByUser") };
    }
  }

  // -------------------------------------------------------------------------
  // Commands
  // -------------------------------------------------------------------------

  async create(data: CreateSessionData): AsyncResult<Session> {
    try {
      const id = (globalThis as any).crypto.randomUUID();
      const now = DbTimestamp.now();

      this.db
        .query(
          `INSERT INTO sessions (
            id, user_id, token_hash, ip_address, user_agent,
            created_at, expires_at, last_active_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .run(
          id,
          data.userId,
          data.tokenHash,
          data.ipAddress,
          data.userAgent,
          now,
          data.expiresAt,
          now
        );

      const result = await this.findById(id);
      if (!result.success || !result.data) {
        return {
          success: false,
          error: mapDatabaseError(
            new Error("Failed to retrieve created session"),
            "create"
          ),
        };
      }

      return { success: true, data: result.data };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "create") };
    }
  }

  async updateActivity(id: UUID): AsyncResult<void> {
    try {
      const now = DbTimestamp.now();

      this.db
        .query("UPDATE sessions SET last_active_at = ? WHERE id = ?")
        .run(now, id);

      return { success: true, data: undefined };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "updateActivity") };
    }
  }

  async verifyMfa(id: UUID): AsyncResult<void> {
    try {
      // Note: DB schema doesn't have mfa_verified field
      // This would need to be stored in device_fingerprint or location JSON
      // For now, we'll just update last_active_at as a placeholder
      const now = DbTimestamp.now();

      this.db
        .query("UPDATE sessions SET last_active_at = ? WHERE id = ?")
        .run(now, id);

      return { success: true, data: undefined };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "verifyMfa") };
    }
  }

  async revoke(id: UUID): AsyncResult<void> {
    try {
      const now = DbTimestamp.now();

      this.db
        .query("UPDATE sessions SET revoked_at = ? WHERE id = ?")
        .run(now, id);

      return { success: true, data: undefined };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "revoke") };
    }
  }

  async revokeAllForUser(userId: UserId): AsyncResult<number> {
    try {
      const now = DbTimestamp.now();

      const result = this.db
        .query("UPDATE sessions SET revoked_at = ? WHERE user_id = ? AND revoked_at IS NULL")
        .run(now, userId);

      // Get the number of affected rows
      const count = result.changes || 0;

      return { success: true, data: count };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "revokeAllForUser") };
    }
  }

  async deleteExpired(): AsyncResult<number> {
    try {
      const now = DbTimestamp.now();

      const result = this.db
        .query("DELETE FROM sessions WHERE expires_at < ?")
        .run(now);

      const count = result.changes || 0;

      return { success: true, data: count };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "deleteExpired") };
    }
  }

  // -------------------------------------------------------------------------
  // Mapping
  // -------------------------------------------------------------------------

  private async mapRowToEntity(row: SessionRow): Promise<Session> {
    // Get tenant_id from user
    const userRow = this.db
      .query<{ tenant_id: string }, [string]>("SELECT tenant_id FROM users WHERE id = ?")
      .get(row.user_id);

    const tenantId = userRow?.tenant_id || ("" as TenantId);

    return {
      id: row.id as UUID,
      userId: row.user_id as UUID as UserId,
      tenantId,
      token: row.token_hash,
      refreshToken: undefined, // Not in schema
      expiresAt: row.expires_at as ISODateTime,
      lastActivityAt: row.last_active_at,
      ipAddress: row.ip_address || "",
      userAgent: row.user_agent || "",
      mfaVerified: false, // Not in schema, default to false
      createdAt: row.created_at as ISODateTime,
      revokedAt: row.revoked_at || undefined,
    };
  }
}
