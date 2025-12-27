/**
 * Environment Repository Implementation - SQLite
 *
 * Implements IEnvironmentRepository using Bun's native SQLite driver
 */

import type { Database } from "bun:sqlite";
import type {
  TenantId,
  UUID,
  AsyncResult,
  PageRequest,
  PageResponse,
} from "@odin/core-contracts";
import { EntityStatus, type PositiveInt, type ISODateTime, createNotFoundError } from "@odin/core-contracts";
import type {
  Environment,
  EnvironmentType,
  EnvironmentConfig,
  ResourceLimits,
  CreateEnvironmentData,
  UpdateEnvironmentData,
  IEnvironmentRepository
} from "@odin/domain";


import { mapDatabaseError } from "../../error-mapper";
import { DbTimestamp, JsonColumn , Pagination } from "../../types";

// ============================================================================
// Database Row Type
// ============================================================================

interface EnvironmentRow {
  id: string;
  tenant_id: string;
  name: string;
  type: string;
  is_default: number;
  config: string; // JSON
  created_at: string;
}

// ============================================================================
// Internal Configuration Type (with metadata)
// ============================================================================

interface InternalConfig {
  config: EnvironmentConfig;
  promotedFrom?: UUID;
  isDefault?: boolean;
}

// ============================================================================
// Default Values
// ============================================================================

const DEFAULT_RESOURCE_LIMITS: ResourceLimits = {
  maxConcurrentJobs: 5 as PositiveInt,
  maxEventLogSize: 10 as PositiveInt, // 10 million events
  maxStorageGB: 50 as PositiveInt,
};

const DEFAULT_CONFIG: EnvironmentConfig = {
  dataPoolIds: [],
  featureOverrides: {},
  resourceLimits: DEFAULT_RESOURCE_LIMITS,
};

// ============================================================================
// Repository Implementation
// ============================================================================

export class SqliteEnvironmentRepository implements IEnvironmentRepository {
  constructor(private db: Database) {}

  // -------------------------------------------------------------------------
  // Queries
  // -------------------------------------------------------------------------

  async findById(id: UUID): AsyncResult<Environment | null> {
    try {
      const row = this.db
        .query<EnvironmentRow, [string]>("SELECT * FROM environments WHERE id = ?")
        .get(id);

      if (!row) {
        return { success: true, data: null };
      }

      return { success: true, data: this.mapRowToEntity(row) };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "findById") };
    }
  }

  async findByTenantId(
    tenantId: TenantId,
    options?: PageRequest
  ): AsyncResult<PageResponse<Environment>> {
    try {
      const { limit, offset } = Pagination.toOffset(options);

      // Get total count
      const countRow = this.db
        .query<{ count: number }, [string]>(
          "SELECT COUNT(*) as count FROM environments WHERE tenant_id = ?"
        )
        .get(tenantId);

      const total = countRow?.count || 0;

      // Get paginated results
      const rows = this.db
        .query<EnvironmentRow, [string, number, number]>(
          `SELECT * FROM environments
           WHERE tenant_id = ?
           ORDER BY is_default DESC, created_at DESC
           LIMIT ? OFFSET ?`
        )
        .all(tenantId, limit, offset);

      const items = rows.map((row: any) => this.mapRowToEntity(row));

      const result = Pagination.buildResponse(items, total, options);
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "findByTenantId") };
    }
  }

  async findByType(
    tenantId: TenantId,
    type: EnvironmentType
  ): AsyncResult<readonly Environment[]> {
    try {
      // Map domain type to database type
      const dbType = this.mapDomainTypeToDb(type);

      const rows = this.db
        .query<EnvironmentRow, [string, string]>(
          `SELECT * FROM environments
           WHERE tenant_id = ? AND type = ?
           ORDER BY created_at DESC`
        )
        .all(tenantId, dbType);

      const envs = rows.map((row: any) => this.mapRowToEntity(row));

      return { success: true, data: envs };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "findByType") };
    }
  }

  // -------------------------------------------------------------------------
  // Commands
  // -------------------------------------------------------------------------

  async create(data: CreateEnvironmentData): AsyncResult<Environment> {
    try {
      const id = (globalThis as any).crypto.randomUUID();
      const now = DbTimestamp.now();

      // Merge configuration with defaults
      const config: InternalEnvironmentConfig = {
        ...DEFAULT_CONFIG,
        ...data.configuration,
        resourceLimits: {
          ...DEFAULT_RESOURCE_LIMITS,
          ...data.configuration?.resourceLimits,
        },
        promotedFrom: data.promotedFrom,
      };

      // Map domain type to database type
      const dbType = this.mapDomainTypeToDb(data.type);

      this.db
        .query(
          `INSERT INTO environments (
            id, tenant_id, name, type, is_default, config, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?)`
        )
        .run(
          id,
          data.tenantId,
          data.name,
          dbType,
          0, // is_default = false by default
          JsonColumn.stringify(config),
          now
        );

      const result = await this.findById(id);
      if (!result.success || !result.data) {
        return {
          success: false,
          error: mapDatabaseError(
            new Error("Failed to retrieve created environment"),
            "create"
          ),
        };
      }

      return { success: true, data: result.data };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "create") };
    }
  }

  async update(id: UUID, data: UpdateEnvironmentData): AsyncResult<Environment> {
    try {
      const updates: string[] = [];
      const params: any[] = [];

      if (data.name !== undefined) {
        updates.push("name = ?");
        params.push(data.name);
      }

      if (data.configuration !== undefined) {
        // Get current environment to merge configuration
        const current = await this.findById(id);
        if (!current.success) {
          return current;
        }
        if (!current.data) {
          return { success: false, error: createNotFoundError("Environment", id) };
        }

        const merged: EnvironmentConfig = {
          ...current.data.configuration,
          ...data.configuration,
          resourceLimits: {
            ...current.data.configuration.resourceLimits,
            ...data.configuration.resourceLimits,
          },
          featureOverrides: {
            ...current.data.configuration.featureOverrides,
            ...data.configuration.featureOverrides,
          },
        };

        updates.push("config = ?");
        params.push(JsonColumn.stringify(merged));
      }

      if (updates.length === 0) {
        // No updates, just return current
        const result = await this.findById(id);
        if (!result.success) {
          return result;
        }
        if (!result.data) {
          return { success: false, error: createNotFoundError("Environment", id) };
        }
        return { success: true, data: result.data };
      }

      params.push(id);

      this.db
        .query(`UPDATE environments SET ${updates.join(", ")} WHERE id = ?`)
        .run(...params);

      const result = await this.findById(id);
      if (!result.success) {
        return result;
      }
      if (!result.data) {
        return { success: false, error: createNotFoundError("Environment", id) };
      }
      return { success: true, data: result.data };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "update") };
    }
  }

  async delete(id: UUID): AsyncResult<void> {
    try {
      this.db.query("DELETE FROM environments WHERE id = ?").run(id);

      return { success: true, data: undefined };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "delete") };
    }
  }

  async promote(sourceId: UUID, targetType: EnvironmentType): AsyncResult<Environment> {
    try {
      // Get source environment
      const sourceResult = await this.findById(sourceId);
      if (!sourceResult.success) {
        return sourceResult;
      }
      if (!sourceResult.data) {
        return { success: false, error: createNotFoundError("Environment", sourceId) };
      }

      const source = sourceResult.data;

      // Create new environment with source configuration
      const createData: CreateEnvironmentData = {
        tenantId: source.tenantId,
        name: `${source.name} (${targetType})`,
        type: targetType,
        configuration: source.configuration,
        promotedFrom: sourceId,
      };

      return this.create(createData);
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "promote") };
    }
  }

  // -------------------------------------------------------------------------
  // Mapping
  // -------------------------------------------------------------------------

  private mapRowToEntity(row: EnvironmentRow): Environment {
    const internalConfig = JsonColumn.parse<InternalConfig>(row.config) || {
      config: DEFAULT_CONFIG,
    };

    return {
      id: row.id as UUID as UUID,
      tenantId: row.tenant_id as UUID as TenantId,
      name: row.name,
      type: this.mapDbTypeToDomain(row.type),
      status: EntityStatus.Active, // No status in DB schema, default to active
      configuration: {
        ...DEFAULT_CONFIG,
        ...internalConfig.config,
      },
      promotedFrom: internalConfig.promotedFrom,
      createdAt: row.created_at as ISODateTime as ISODateTime,
    };
  }

  private mapDomainTypeToDb(type: EnvironmentType): string {
    // Domain uses: development, staging, production
    // DB supports: development, staging, production, sandbox
    // Map development to development (sandbox is a separate concept)
    return type;
  }

  private mapDbTypeToDomain(type: string): EnvironmentType {
    // Map sandbox to development for domain
    if (type === "sandbox") {
      return "development";
    }
    return type as EnvironmentType;
  }
}
