/**
 * MFA Device Repository Implementation - SQLite
 *
 * Implements IMfaDeviceRepository using Bun's native SQLite driver
 */

import type { Database } from "bun:sqlite";
import type { UserId, UUID, AsyncResult } from "@odin/core-contracts";
import type {
  MfaDevice,
  MfaType,
  CreateMfaDeviceData,
  IMfaDeviceRepository
} from "@odin/domain";


import { mapDatabaseError } from "../../error-mapper";
import { DbTimestamp } from "../../types";

// ============================================================================
// Database Row Type
// ============================================================================

interface MfaDeviceRow {
  id: string;
  user_id: string;
  type: string;
  name: string;
  secret_encrypted: string;
  is_primary: number;
  is_verified: number;
  last_used_at: string | null;
  created_at: string;
}

// ============================================================================
// Repository Implementation
// ============================================================================

export class SqliteMfaDeviceRepository implements IMfaDeviceRepository {
  constructor(private db: Database) {}

  // -------------------------------------------------------------------------
  // Queries
  // -------------------------------------------------------------------------

  async findById(id: UUID): AsyncResult<MfaDevice | null> {
    try {
      const row = this.db
        .query<MfaDeviceRow, [string]>("SELECT * FROM mfa_devices WHERE id = ?")
        .get(id);

      if (!row) {
        return { success: true, data: null };
      }

      return { success: true, data: this.mapRowToEntity(row) };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "findById") };
    }
  }

  async findByUserId(userId: UserId): AsyncResult<readonly MfaDevice[]> {
    try {
      const rows = this.db
        .query<MfaDeviceRow, [string]>(
          `SELECT * FROM mfa_devices
           WHERE user_id = ?
           ORDER BY is_primary DESC, created_at DESC`
        )
        .all(userId);

      const devices = rows.map((row: any) => this.mapRowToEntity(row));

      return { success: true, data: devices };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "findByUserId") };
    }
  }

  async findDefault(userId: UserId): AsyncResult<MfaDevice | null> {
    try {
      const row = this.db
        .query<MfaDeviceRow, [string]>(
          "SELECT * FROM mfa_devices WHERE user_id = ? AND is_primary = 1"
        )
        .get(userId);

      if (!row) {
        return { success: true, data: null };
      }

      return { success: true, data: this.mapRowToEntity(row) };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "findDefault") };
    }
  }

  // -------------------------------------------------------------------------
  // Commands
  // -------------------------------------------------------------------------

  async create(data: CreateMfaDeviceData): AsyncResult<MfaDevice> {
    try {
      const id = (globalThis as any).crypto.randomUUID();
      const now = DbTimestamp.now();

      // If this is set as default, unset other defaults
      if (data.isDefault) {
        this.db
          .query("UPDATE mfa_devices SET is_primary = 0 WHERE user_id = ?")
          .run(data.userId);
      }

      // Map domain type to DB type
      const dbType = data.type === "recovery_codes" ? "backup_codes" : data.type;

      this.db
        .query(
          `INSERT INTO mfa_devices (
            id, user_id, type, name, secret_encrypted,
            is_primary, is_verified, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .run(
          id,
          data.userId,
          dbType,
          data.name,
          data.secretEncrypted,
          data.isDefault ? 1 : 0,
          1, // Auto-verify on creation
          now
        );

      const result = await this.findById(id);
      if (!result.success || !result.data) {
        return {
          success: false,
          error: mapDatabaseError(
            new Error("Failed to retrieve created MFA device"),
            "create"
          ),
        };
      }

      return { success: true, data: result.data };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "create") };
    }
  }

  async setDefault(userId: UserId, deviceId: UUID): AsyncResult<void> {
    try {
      // Unset all other defaults for this user
      this.db
        .query("UPDATE mfa_devices SET is_primary = 0 WHERE user_id = ?")
        .run(userId);

      // Set this device as default
      this.db
        .query("UPDATE mfa_devices SET is_primary = 1 WHERE id = ? AND user_id = ?")
        .run(deviceId, userId);

      return { success: true, data: undefined };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "setDefault") };
    }
  }

  async updateLastUsed(id: UUID): AsyncResult<void> {
    try {
      const now = DbTimestamp.now();

      this.db
        .query("UPDATE mfa_devices SET last_used_at = ? WHERE id = ?")
        .run(now, id);

      return { success: true, data: undefined };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "updateLastUsed") };
    }
  }

  async delete(id: UUID): AsyncResult<void> {
    try {
      this.db.query("DELETE FROM mfa_devices WHERE id = ?").run(id);

      return { success: true, data: undefined };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "delete") };
    }
  }

  async deleteAllForUser(userId: UserId): AsyncResult<void> {
    try {
      this.db.query("DELETE FROM mfa_devices WHERE user_id = ?").run(userId);

      return { success: true, data: undefined };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "deleteAllForUser") };
    }
  }

  // -------------------------------------------------------------------------
  // Mapping
  // -------------------------------------------------------------------------

  private mapRowToEntity(row: MfaDeviceRow): MfaDevice {
    // Map DB type to domain type
    const type: MfaType = row.type === "backup_codes" ? "recovery_codes" : (row.type as MfaType);

    return {
      id: row.id,
      userId: row.user_id as UserId,
      type,
      name: row.name,
      secretEncrypted: row.secret_encrypted,
      isDefault: row.is_primary === 1,
      lastUsedAt: row.last_used_at || undefined,
      createdAt: row.created_at,
    };
  }
}
