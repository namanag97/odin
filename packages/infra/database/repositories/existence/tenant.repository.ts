/**
 * Tenant Repository Implementation - SQLite
 *
 * Implements ITenantRepository using Bun's native SQLite driver
 */

import type { Database } from "bun:sqlite";
import type {
  TenantId,
  AsyncResult,
  PageRequest,
  PageResponse,
} from "@odin/core-contracts";
import type {
  Tenant,
  TenantStatus,
  TenantSettings,
  TenantFeatures,
  TenantMetadata,
  TenantTier,
  CreateTenantData,
  UpdateTenantData,
  ITenantRepository
} from "@odin/domain";
import { asTenantId } from "@odin/core-contracts";


import { mapDatabaseError } from "../../error-mapper";
import { DbTimestamp, JsonColumn, WhereBuilder, buildPagination } from "../../types";

// ============================================================================
// Database Row Type
// ============================================================================

interface TenantRow {
  id: string;
  external_id: string | null;
  name: string;
  slug: string;
  type: string;
  status: string;
  tier: string;
  settings: string; // JSON
  metadata: string; // JSON
  storage_quota_gb: number;
  event_quota_monthly: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

// ============================================================================
// Default Values
// ============================================================================

const DEFAULT_FEATURES: TenantFeatures = {
  ocelSupport: false,
  advancedConformance: false,
  customIntegrations: false,
  sso: false,
  auditLogs: false,
  apiAccess: false,
};

const TIER_FEATURES: Record<TenantTier, TenantFeatures> = {
  free: {
    ...DEFAULT_FEATURES,
  },
  starter: {
    ...DEFAULT_FEATURES,
    ocelSupport: true,
    apiAccess: true,
  },
  professional: {
    ...DEFAULT_FEATURES,
    ocelSupport: true,
    advancedConformance: true,
    customIntegrations: true,
    apiAccess: true,
    auditLogs: true,
  },
  enterprise: {
    ocelSupport: true,
    advancedConformance: true,
    customIntegrations: true,
    sso: true,
    auditLogs: true,
    apiAccess: true,
  },
};

const DEFAULT_SETTINGS: TenantSettings = {
  locale: "en-US",
  timezone: "UTC",
  dataRetentionDays: 365,
  maxUsers: 5,
  maxDataPools: 1,
  maxStorageGB: 10,
  features: DEFAULT_FEATURES,
};

const TIER_SETTINGS: Record<TenantTier, Partial<TenantSettings>> = {
  free: {
    maxUsers: 5,
    maxDataPools: 1,
    maxStorageGB: 10,
  },
  starter: {
    maxUsers: 20,
    maxDataPools: 5,
    maxStorageGB: 50,
  },
  professional: {
    maxUsers: 100,
    maxDataPools: 20,
    maxStorageGB: 500,
  },
  enterprise: {
    maxUsers: 1000,
    maxDataPools: 100,
    maxStorageGB: 5000,
  },
};

// ============================================================================
// Repository Implementation
// ============================================================================

export class SqliteTenantRepository implements ITenantRepository {
  constructor(private db: Database) {}

  // -------------------------------------------------------------------------
  // Queries
  // -------------------------------------------------------------------------

  async findById(id: TenantId): AsyncResult<Tenant | null> {
    try {
      const row = this.db
        .query<TenantRow, [string]>("SELECT * FROM tenants WHERE id = ? AND deleted_at IS NULL")
        .get(id);

      if (!row) {
        return { success: true, data: null };
      }

      return { success: true, data: this.mapRowToEntity(row) };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "findById") };
    }
  }

  async findBySlug(slug: string): AsyncResult<Tenant | null> {
    try {
      const row = this.db
        .query<TenantRow, [string]>("SELECT * FROM tenants WHERE slug = ? AND deleted_at IS NULL")
        .get(slug);

      if (!row) {
        return { success: true, data: null };
      }

      return { success: true, data: this.mapRowToEntity(row) };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "findBySlug") };
    }
  }

  async findAll(options?: PageRequest): AsyncResult<PageResponse<Tenant>> {
    try {
      const { limit, offset } = Pagination.toOffset(options);

      // Get total count
      const countRow = this.db
        .query<{ count: number }, []>("SELECT COUNT(*) as count FROM tenants WHERE deleted_at IS NULL")
        .get();

      const total = countRow?.count || 0;

      // Get paginated results
      const rows = this.db
        .query<TenantRow, [number, number]>(
          `SELECT * FROM tenants
           WHERE deleted_at IS NULL
           ORDER BY created_at DESC
           LIMIT ? OFFSET ?`
        )
        .all(limit, offset);

      const items = rows.map((row: any) => this.mapRowToEntity(row));

      const result = Pagination.buildResponse(items, total, options);
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "findAll") };
    }
  }

  async exists(id: TenantId): AsyncResult<boolean> {
    try {
      const row = this.db
        .query<{ count: number }, [string]>(
          "SELECT COUNT(*) as count FROM tenants WHERE id = ? AND deleted_at IS NULL"
        )
        .get(id);

      return { success: true, data: (row?.count || 0) > 0 };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "exists") };
    }
  }

  async slugExists(slug: string): AsyncResult<boolean> {
    try {
      const row = this.db
        .query<{ count: number }, [string]>(
          "SELECT COUNT(*) as count FROM tenants WHERE slug = ? AND deleted_at IS NULL"
        )
        .get(slug);

      return { success: true, data: (row?.count || 0) > 0 };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "slugExists") };
    }
  }

  // -------------------------------------------------------------------------
  // Commands
  // -------------------------------------------------------------------------

  async create(data: CreateTenantData): AsyncResult<Tenant> {
    try {
      const id = (globalThis as any).crypto.randomUUID();
      const now = DbTimestamp.now();

      // Merge settings with tier defaults
      const tierDefaults = TIER_SETTINGS[data.tier];
      const tierFeatures = TIER_FEATURES[data.tier];
      const settings: TenantSettings = {
        ...DEFAULT_SETTINGS,
        ...tierDefaults,
        ...data.settings,
        features: {
          ...tierFeatures,
          ...data.settings?.features,
        },
      };

      const metadata: TenantMetadata = data.metadata || {};

      this.db
        .query(
          `INSERT INTO tenants (
            id, name, slug, type, status, tier,
            settings, metadata,
            storage_quota_gb, event_quota_monthly,
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .run(
          id,
          data.name,
          data.slug,
          "team", // Default type
          "active", // Default status
          data.tier,
          JsonColumn.stringify(settings),
          JsonColumn.stringify(metadata),
          settings.maxStorageGB,
          1000000, // Default event quota
          now,
          now
        );

      const result = await this.findById(asTenantId(id));
      if (!result.success || !result.data) {
        return {
          success: false,
          error: mapDatabaseError(new Error("Failed to retrieve created tenant"), "create"),
        };
      }

      return { success: true, data: result.data };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "create") };
    }
  }

  async update(id: TenantId, data: UpdateTenantData): AsyncResult<Tenant> {
    try {
      const now = DbTimestamp.now();
      const updates: string[] = [];
      const params: any[] = [];

      if (data.name !== undefined) {
        updates.push("name = ?");
        params.push(data.name);
      }

      if (data.metadata !== undefined) {
        updates.push("metadata = ?");
        params.push(JsonColumn.stringify(data.metadata));
      }

      if (updates.length === 0) {
        // No updates, just return current
        return this.findById(id);
      }

      updates.push("updated_at = ?");
      params.push(now);
      params.push(id);

      this.db
        .query(`UPDATE tenants SET ${updates.join(", ")} WHERE id = ? AND deleted_at IS NULL`)
        .run(...params);

      return this.findById(id);
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "update") };
    }
  }

  async updateStatus(id: TenantId, status: TenantStatus): AsyncResult<Tenant> {
    try {
      const now = DbTimestamp.now();
      const updates = ["status = ?", "updated_at = ?"];
      const params: any[] = [status, now];

      // Map domain status to database status
      const dbStatus = status === "pending" ? "provisioning" : status === "deleted" ? "terminated" : status;

      // If suspending, set suspended_at timestamp
      // Note: This field doesn't exist in schema yet, but domain requires it
      // For now, we'll track in metadata

      this.db
        .query(`UPDATE tenants SET ${updates.join(", ")} WHERE id = ? AND deleted_at IS NULL`)
        .run(dbStatus, now, id);

      return this.findById(id);
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "updateStatus") };
    }
  }

  async updateSettings(id: TenantId, settingsUpdate: Partial<TenantSettings>): AsyncResult<Tenant> {
    try {
      // Get current tenant
      const current = await this.findById(id);
      if (!current.success || !current.data) {
        return current;
      }

      // Merge settings
      const merged: TenantSettings = {
        ...current.data.settings,
        ...settingsUpdate,
        features: {
          ...current.data.settings.features,
          ...settingsUpdate.features,
        },
      };

      const now = DbTimestamp.now();

      this.db
        .query(
          `UPDATE tenants
           SET settings = ?,
               storage_quota_gb = ?,
               updated_at = ?
           WHERE id = ? AND deleted_at IS NULL`
        )
        .run(JsonColumn.stringify(merged), merged.maxStorageGB, now, id);

      return this.findById(id);
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "updateSettings") };
    }
  }

  async softDelete(id: TenantId): AsyncResult<void> {
    try {
      const now = DbTimestamp.now();

      this.db
        .query("UPDATE tenants SET deleted_at = ?, updated_at = ? WHERE id = ?")
        .run(now, now, id);

      return { success: true, data: undefined };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "softDelete") };
    }
  }

  async hardDelete(id: TenantId): AsyncResult<void> {
    try {
      this.db.query("DELETE FROM tenants WHERE id = ?").run(id);

      return { success: true, data: undefined };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "hardDelete") };
    }
  }

  // -------------------------------------------------------------------------
  // Mapping
  // -------------------------------------------------------------------------

  private mapRowToEntity(row: TenantRow): Tenant {
    const settings = JsonColumn.parse<TenantSettings>(row.settings) || DEFAULT_SETTINGS;
    const metadata = JsonColumn.parse<TenantMetadata>(row.metadata) || {};

    // Map database status to domain status
    const status: TenantStatus =
      row.status === "provisioning"
        ? "pending"
        : row.status === "terminated"
        ? "deleted"
        : (row.status as TenantStatus);

    return {
      id: asTenantId(row.id),
      slug: row.slug,
      name: row.name,
      status,
      tier: row.tier as TenantTier,
      settings,
      metadata,
      createdAt: row.created_at as ISODateTime,
      updatedAt: row.updated_at as ISODateTime,
      suspendedAt: row.status === "suspended" ? row.updated_at : undefined,
      deletedAt: row.deleted_at || undefined,
    };
  }
}
