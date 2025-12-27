/**
 * Organization Repository Implementation - SQLite
 *
 * Implements IOrganizationRepository using Bun's native SQLite driver
 */

import type { Database } from "bun:sqlite";
import type {
  TenantId,
  OrganizationId,
  UserId,
  AsyncResult,
  PageRequest,
  PageResponse,
} from "@odin/core-contracts";
import type {
  Organization,
  OrganizationSettings,
  CreateOrganizationData,
  UpdateOrganizationData,
  User,
  RoleId,
  IOrganizationRepository
} from "@odin/domain";
import { asOrganizationId, asUserId } from "@odin/core-contracts";




import { mapDatabaseError } from "../../error-mapper";
import { DbTimestamp, JsonColumn , Pagination } from "../../types";

// ============================================================================
// Database Row Types
// ============================================================================

interface OrganizationRow {
  id: string;
  tenant_id: string;
  parent_org_id: string | null;
  name: string;
  code: string; // Maps to slug
  type: string;
  hierarchy_path: string | null;
  metadata: string; // JSON - maps to settings
  is_active: number;
  created_at: string;
}

interface UserRow {
  id: string;
  tenant_id: string;
  external_id: string | null;
  email: string;
  email_verified_at: string | null;
  phone: string | null;
  phone_verified_at: string | null;
  password_hash: string | null;
  status: string;
  type: string;
  last_login_at: string | null;
  failed_login_attempts: number;
  locked_until: string | null;
  mfa_enabled: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

// ============================================================================
// Default Values
// ============================================================================

const DEFAULT_SETTINGS: OrganizationSettings = {
  inheritParentPermissions: true,
};

// ============================================================================
// Repository Implementation
// ============================================================================

export class SqliteOrganizationRepository implements IOrganizationRepository {
  constructor(private db: Database) {}

  // -------------------------------------------------------------------------
  // Queries
  // -------------------------------------------------------------------------

  async findById(id: OrganizationId): AsyncResult<Organization | null> {
    try {
      const row = this.db
        .query<OrganizationRow, [string]>(
          "SELECT * FROM organizations WHERE id = ? AND is_active = 1"
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

  async findByTenantId(
    tenantId: TenantId,
    options?: PageRequest
  ): AsyncResult<PageResponse<Organization>> {
    try {
      const { limit, offset } = Pagination.toOffset(options);

      // Get total count
      const countRow = this.db
        .query<{ count: number }, [string]>(
          "SELECT COUNT(*) as count FROM organizations WHERE tenant_id = ? AND is_active = 1"
        )
        .get(tenantId);

      const total = countRow?.count || 0;

      // Get paginated results
      const rows = this.db
        .query<OrganizationRow, [string, number, number]>(
          `SELECT * FROM organizations
           WHERE tenant_id = ? AND is_active = 1
           ORDER BY created_at DESC
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

  async findChildren(parentId: OrganizationId): AsyncResult<readonly Organization[]> {
    try {
      const rows = this.db
        .query<OrganizationRow, [string]>(
          `SELECT * FROM organizations
           WHERE parent_org_id = ? AND is_active = 1
           ORDER BY name ASC`
        )
        .all(parentId);

      const orgs = rows.map((row: any) => this.mapRowToEntity(row));

      return { success: true, data: orgs };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "findChildren") };
    }
  }

  async findAncestors(id: OrganizationId): AsyncResult<readonly Organization[]> {
    try {
      // Get the organization first to retrieve its hierarchy path
      const org = await this.findById(id);
      if (!org.success || !org.data) {
        return { success: true, data: [] };
      }

      // If no hierarchy path, no ancestors
      const current = org.data;
      if (!current.parentId) {
        return { success: true, data: [] };
      }

      // Use recursive CTE to find all ancestors
      const rows = this.db
        .query<OrganizationRow, [string]>(
          `WITH RECURSIVE ancestors AS (
            SELECT * FROM organizations WHERE id = ?
            UNION ALL
            SELECT o.* FROM organizations o
            INNER JOIN ancestors a ON o.id = a.parent_org_id
            WHERE o.is_active = 1
          )
          SELECT * FROM ancestors WHERE id != ?
          ORDER BY hierarchy_path ASC`
        )
        .all(id, id);

      const ancestors = rows.map((row: any) => this.mapRowToEntity(row));

      return { success: true, data: ancestors };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "findAncestors") };
    }
  }

  // -------------------------------------------------------------------------
  // Commands
  // -------------------------------------------------------------------------

  async create(data: CreateOrganizationData): AsyncResult<Organization> {
    try {
      const id = (globalThis as any).crypto.randomUUID();
      const now = DbTimestamp.now();

      // Merge settings with defaults
      const settings: OrganizationSettings = {
        ...DEFAULT_SETTINGS,
        ...data.settings,
      };

      // Calculate hierarchy path
      let hierarchyPath = id;
      if (data.parentId) {
        const parent = await this.findById(data.parentId);
        if (parent.success && parent.data) {
          // For SQLite, we use dot-separated paths like: parent.child
          const parentRow = this.db
            .query<{ hierarchy_path: string | null }, [string]>(
              "SELECT hierarchy_path FROM organizations WHERE id = ?"
            )
            .get(data.parentId);

          if (parentRow?.hierarchy_path) {
            hierarchyPath = `${parentRow.hierarchy_path}.${id}`;
          } else {
            hierarchyPath = `${data.parentId}.${id}`;
          }
        }
      }

      this.db
        .query(
          `INSERT INTO organizations (
            id, tenant_id, parent_org_id, name, code, type,
            hierarchy_path, metadata, is_active, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .run(
          id,
          data.tenantId,
          data.parentId || null,
          data.name,
          data.slug,
          "custom", // Default type
          hierarchyPath,
          JsonColumn.stringify(settings),
          1, // is_active = true
          now
        );

      const result = await this.findById(asOrganizationId(id));
      if (!result.success || !result.data) {
        return {
          success: false,
          error: mapDatabaseError(
            new Error("Failed to retrieve created organization"),
            "create"
          ),
        };
      }

      return { success: true, data: result.data };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "create") };
    }
  }

  async update(
    id: OrganizationId,
    data: UpdateOrganizationData
  ): AsyncResult<Organization> {
    try {
      const updates: string[] = [];
      const params: any[] = [];

      if (data.name !== undefined) {
        updates.push("name = ?");
        params.push(data.name);
      }

      if (data.settings !== undefined) {
        // Get current organization to merge settings
        const current = await this.findById(id);
        if (!current.success || !current.data) {
          return current;
        }

        const merged: OrganizationSettings = {
          ...current.data.settings,
          ...data.settings,
        };

        updates.push("metadata = ?");
        params.push(JsonColumn.stringify(merged));
      }

      if (updates.length === 0) {
        // No updates, just return current
        return this.findById(id);
      }

      params.push(id);

      this.db
        .query(`UPDATE organizations SET ${updates.join(", ")} WHERE id = ? AND is_active = 1`)
        .run(...params);

      return this.findById(id);
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "update") };
    }
  }

  async delete(id: OrganizationId): AsyncResult<void> {
    try {
      // Soft delete by setting is_active to 0
      this.db
        .query("UPDATE organizations SET is_active = 0 WHERE id = ?")
        .run(id);

      return { success: true, data: undefined };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "delete") };
    }
  }

  // -------------------------------------------------------------------------
  // Membership
  // -------------------------------------------------------------------------

  async getMembers(
    id: OrganizationId,
    options?: PageRequest
  ): AsyncResult<PageResponse<User>> {
    try {
      const { limit, offset } = Pagination.toOffset(options);

      // Get total count of members
      const countRow = this.db
        .query<{ count: number }, [string]>(
          `SELECT COUNT(DISTINCT u.id) as count
           FROM users u
           INNER JOIN role_assignments ra ON ra.principal_id = u.id AND ra.principal_type = 'user'
           WHERE ra.scope_type = 'organization'
             AND ra.scope_id = ?
             AND u.deleted_at IS NULL`
        )
        .get(id);

      const total = countRow?.count || 0;

      // Get paginated members
      const rows = this.db
        .query<UserRow, [string, number, number]>(
          `SELECT DISTINCT u.*
           FROM users u
           INNER JOIN role_assignments ra ON ra.principal_id = u.id AND ra.principal_type = 'user'
           WHERE ra.scope_type = 'organization'
             AND ra.scope_id = ?
             AND u.deleted_at IS NULL
           ORDER BY u.created_at DESC
           LIMIT ? OFFSET ?`
        )
        .all(id, limit, offset);

      const items = rows.map((row: any) => this.mapUserRowToEntity(row));

      const result = Pagination.buildResponse(items, total, options);
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "getMembers") };
    }
  }

  async addMember(
    orgId: OrganizationId,
    userId: UserId,
    role: RoleId
  ): AsyncResult<void> {
    try {
      const assignmentId = (globalThis as any).crypto.randomUUID();
      const now = DbTimestamp.now();

      this.db
        .query(
          `INSERT INTO role_assignments (
            id, role_id, principal_type, principal_id,
            scope_type, scope_id, granted_by, granted_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .run(
          assignmentId,
          role,
          "user",
          userId,
          "organization",
          orgId,
          userId, // Self-granted for now, should be passed as parameter
          now
        );

      return { success: true, data: undefined };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "addMember") };
    }
  }

  async removeMember(orgId: OrganizationId, userId: UserId): AsyncResult<void> {
    try {
      this.db
        .query(
          `DELETE FROM role_assignments
           WHERE scope_type = 'organization'
             AND scope_id = ?
             AND principal_type = 'user'
             AND principal_id = ?`
        )
        .run(orgId, userId);

      return { success: true, data: undefined };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "removeMember") };
    }
  }

  // -------------------------------------------------------------------------
  // Mapping
  // -------------------------------------------------------------------------

  private mapRowToEntity(row: OrganizationRow): Organization {
    const settings = JsonColumn.parse<OrganizationSettings>(row.metadata) || DEFAULT_SETTINGS;

    return {
      id: asOrganizationId(row.id),
      tenantId: row.tenant_id as TenantId,
      name: row.name,
      slug: row.code,
      parentId: row.parent_org_id ? asOrganizationId(row.parent_org_id) : undefined,
      status: row.is_active === 1 ? "active" : "inactive",
      settings,
      createdAt: row.created_at,
      updatedAt: row.created_at, // No updated_at in schema, use created_at
    };
  }

  private mapUserRowToEntity(row: UserRow): User {
    return {
      id: asUserId(row.id),
      tenantId: row.tenant_id as TenantId,
      email: row.email,
      emailVerifiedAt: row.email_verified_at || undefined,
      phone: row.phone || undefined,
      phoneVerifiedAt: row.phone_verified_at || undefined,
      status: row.status as any,
      type: row.type as any,
      lastLoginAt: row.last_login_at || undefined,
      failedLoginAttempts: row.failed_login_attempts,
      lockedUntil: row.locked_until || undefined,
      mfaEnabled: row.mfa_enabled === 1,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
