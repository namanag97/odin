/**
 * Identity Provider Repository Implementation - SQLite
 *
 * Implements IIdentityProviderRepository using Bun's native SQLite driver
 */

import type { Database } from "bun:sqlite";
import type { TenantId, UUID, AsyncResult } from "@odin/core-contracts";
import type {
  IdentityProvider,
  IdPType,
  IdPConfig,
  IdPMetadata,
  CreateIdentityProviderData,
  UpdateIdentityProviderData,
  IIdentityProviderRepository
} from "@odin/domain";


import { mapDatabaseError } from "../../error-mapper";
import { DbTimestamp, JsonColumn } from "../../types";

// ============================================================================
// Database Row Type
// ============================================================================

interface IdentityProviderRow {
  id: string;
  tenant_id: string;
  name: string;
  type: string;
  is_enabled: number;
  is_default: number;
  config_encrypted: string; // JSON
  metadata_url: string | null;
  domain_hints: string | null; // JSON array
  auto_provision: number;
  default_role_id: string | null;
  created_at: string;
}

// ============================================================================
// Default Values
// ============================================================================

const DEFAULT_METADATA: IdPMetadata = {
  domainVerified: false,
  domains: [],
};

// ============================================================================
// Repository Implementation
// ============================================================================

export class SqliteIdentityProviderRepository implements IIdentityProviderRepository {
  constructor(private db: Database) {}

  // -------------------------------------------------------------------------
  // Queries
  // -------------------------------------------------------------------------

  async findById(id: UUID): AsyncResult<IdentityProvider | null> {
    try {
      const row = this.db
        .query<IdentityProviderRow, [string]>("SELECT * FROM identity_providers WHERE id = ?")
        .get(id);

      if (!row) {
        return { success: true, data: null };
      }

      return { success: true, data: this.mapRowToEntity(row) };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "findById") };
    }
  }

  async findByTenantId(tenantId: TenantId): AsyncResult<readonly IdentityProvider[]> {
    try {
      const rows = this.db
        .query<IdentityProviderRow, [string]>(
          `SELECT * FROM identity_providers
           WHERE tenant_id = ?
           ORDER BY is_default DESC, name ASC`
        )
        .all(tenantId);

      const providers = rows.map((row: any) => this.mapRowToEntity(row));

      return { success: true, data: providers };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "findByTenantId") };
    }
  }

  async findByType(tenantId: TenantId, type: IdPType): AsyncResult<readonly IdentityProvider[]> {
    try {
      // Map domain type to DB type
      const dbType = this.mapDomainTypeToDb(type);

      const rows = this.db
        .query<IdentityProviderRow, [string, string]>(
          `SELECT * FROM identity_providers
           WHERE tenant_id = ? AND type = ?
           ORDER BY name ASC`
        )
        .all(tenantId, dbType);

      const providers = rows.map((row: any) => this.mapRowToEntity(row));

      return { success: true, data: providers };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "findByType") };
    }
  }

  async findByDomain(domain: string): AsyncResult<IdentityProvider | null> {
    try {
      // Search in domain_hints JSON array
      const rows = this.db
        .query<IdentityProviderRow, []>(
          "SELECT * FROM identity_providers WHERE is_enabled = 1"
        )
        .all();

      // Filter by domain in domain_hints
      for (const row of rows) {
        if (row.domain_hints) {
          const domains = JsonColumn.parse<string[]>(row.domain_hints) || [];
          if (domains.includes(domain)) {
            return { success: true, data: this.mapRowToEntity(row) };
          }
        }
      }

      return { success: true, data: null };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "findByDomain") };
    }
  }

  // -------------------------------------------------------------------------
  // Commands
  // -------------------------------------------------------------------------

  async create(data: CreateIdentityProviderData): AsyncResult<IdentityProvider> {
    try {
      const id = (globalThis as any).crypto.randomUUID();
      const now = DbTimestamp.now();

      // Map domain type to DB type
      const dbType = this.mapDomainTypeToDb(data.type);

      // Store config as encrypted JSON (in production, this would be encrypted)
      const configJson = JsonColumn.stringify(data.config);

      this.db
        .query(
          `INSERT INTO identity_providers (
            id, tenant_id, name, type, is_enabled, is_default,
            config_encrypted, domain_hints, auto_provision, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .run(
          id,
          data.tenantId,
          data.name,
          dbType,
          1, // is_enabled = true
          0, // is_default = false
          configJson,
          null, // domain_hints
          1, // auto_provision = true
          now
        );

      const result = await this.findById(id);
      if (!result.success || !result.data) {
        return {
          success: false,
          error: mapDatabaseError(
            new Error("Failed to retrieve created identity provider"),
            "create"
          ),
        };
      }

      return { success: true, data: result.data };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "create") };
    }
  }

  async update(id: UUID, data: UpdateIdentityProviderData): AsyncResult<IdentityProvider> {
    try {
      const updates: string[] = [];
      const params: any[] = [];

      if (data.name !== undefined) {
        updates.push("name = ?");
        params.push(data.name);
      }

      if (data.config !== undefined) {
        // Get current provider to merge config
        const current = await this.findById(id);
        if (!current.success || !current.data) {
          return current;
        }

        const merged: IdPConfig = {
          ...current.data.config,
          ...data.config,
          attributeMapping: {
            ...current.data.config.attributeMapping,
            ...data.config.attributeMapping,
          },
        };

        updates.push("config_encrypted = ?");
        params.push(JsonColumn.stringify(merged));
      }

      if (data.metadata !== undefined) {
        // Update domain_hints if domains are provided
        if (data.metadata.domains !== undefined) {
          updates.push("domain_hints = ?");
          params.push(JsonColumn.stringify(data.metadata.domains));
        }
      }

      if (updates.length === 0) {
        // No updates, just return current
        return this.findById(id);
      }

      params.push(id);

      this.db
        .query(`UPDATE identity_providers SET ${updates.join(", ")} WHERE id = ?`)
        .run(...params);

      return this.findById(id);
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "update") };
    }
  }

  async delete(id: UUID): AsyncResult<void> {
    try {
      this.db.query("DELETE FROM identity_providers WHERE id = ?").run(id);

      return { success: true, data: undefined };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "delete") };
    }
  }

  // -------------------------------------------------------------------------
  // Mapping
  // -------------------------------------------------------------------------

  private mapRowToEntity(row: IdentityProviderRow): IdentityProvider {
    const config = JsonColumn.parse<IdPConfig>(row.config_encrypted) || ({} as IdPConfig);
    const domains = row.domain_hints
      ? JsonColumn.parse<string[]>(row.domain_hints) || []
      : [];

    const metadata: IdPMetadata = {
      ...DEFAULT_METADATA,
      domains,
    };

    return {
      id: row.id as UUID,
      tenantId: row.tenant_id as UUID as TenantId,
      name: row.name,
      type: this.mapDbTypeToDomain(row.type),
      status: row.is_enabled === 1 ? "active" : "inactive",
      config,
      metadata,
      createdAt: row.created_at as ISODateTime,
    };
  }

  private mapDomainTypeToDb(type: IdPType): string {
    // Map domain types to DB types
    switch (type) {
      case "google":
      case "microsoft":
      case "okta":
        return "oauth2"; // Generic OAuth2 in DB
      case "saml":
      case "oidc":
        return type;
      default:
        return type;
    }
  }

  private mapDbTypeToDomain(type: string): IdPType {
    // Map DB types to domain types
    // Default OAuth2 to OIDC
    if (type === "oauth2" || type === "ldap") {
      return "oidc";
    }
    return type as IdPType;
  }
}
