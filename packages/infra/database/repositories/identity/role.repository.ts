/**
 * Role Repository Implementation - SQLite
 *
 * Implements IRoleRepository using Bun's native SQLite driver
 */

import type { Database } from "bun:sqlite";
import type { TenantId, AsyncResult } from "@odin/core-contracts";
import type {
  Role,
  RoleId,
  Permission,
  PermissionId,
  PermissionResourceType,
  ActionType,
  PermissionScope,
  PermissionCondition,
  CreateRoleData,
  UpdateRoleData,
  asRoleId,
  asPermissionId,
  User,
  IRoleRepository
} from "@odin/domain";

import { asUserId } from "@odin/core-contracts";

import { mapDatabaseError } from "../../error-mapper";
import { DbTimestamp, JsonColumn } from "../../types";

// ============================================================================
// Database Row Types
// ============================================================================

interface RoleRow {
  id: string;
  tenant_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  type: string;
  scope: string;
  is_default: number;
  metadata: string; // JSON
  created_at: string;
}

interface PermissionRow {
  id: string;
  resource: string;
  action: string;
  description: string | null;
  category: string | null;
  is_sensitive: number;
}

interface RolePermissionRow {
  id: string;
  role_id: string;
  permission_id: string;
  conditions: string | null; // JSON
  granted_at: string;
}

interface UserRow {
  id: string;
  tenant_id: string;
  email: string;
  status: string;
  type: string;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Repository Implementation
// ============================================================================

export class SqliteRoleRepository implements IRoleRepository {
  constructor(private db: Database) {}

  // -------------------------------------------------------------------------
  // Queries
  // -------------------------------------------------------------------------

  async findById(id: RoleId): AsyncResult<Role | null> {
    try {
      const row = this.db
        .query<RoleRow, [string]>("SELECT * FROM roles WHERE id = ?")
        .get(id);

      if (!row) {
        return { success: true, data: null };
      }

      const permissions = await this.getPermissionsForRole(id);

      return { success: true, data: this.mapRowToEntity(row, permissions) };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "findById") };
    }
  }

  async findByTenantId(tenantId: TenantId): AsyncResult<readonly Role[]> {
    try {
      const rows = this.db
        .query<RoleRow, [string]>(
          `SELECT * FROM roles
           WHERE tenant_id = ?
           ORDER BY name ASC`
        )
        .all(tenantId);

      const roles: Role[] = [];
      for (const row of rows) {
        const permissions = await this.getPermissionsForRole(asRoleId(row.id));
        roles.push(this.mapRowToEntity(row, permissions));
      }

      return { success: true, data: roles };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "findByTenantId") };
    }
  }

  async findSystemRoles(): AsyncResult<readonly Role[]> {
    try {
      const rows = this.db
        .query<RoleRow, []>(
          `SELECT * FROM roles
           WHERE type = 'system'
           ORDER BY name ASC`
        )
        .all();

      const roles: Role[] = [];
      for (const row of rows) {
        const permissions = await this.getPermissionsForRole(asRoleId(row.id));
        roles.push(this.mapRowToEntity(row, permissions));
      }

      return { success: true, data: roles };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "findSystemRoles") };
    }
  }

  // -------------------------------------------------------------------------
  // Commands
  // -------------------------------------------------------------------------

  async create(data: CreateRoleData): AsyncResult<Role> {
    try {
      const id = (globalThis as any).crypto.randomUUID();
      const now = DbTimestamp.now();

      // Generate slug from name (lowercase, replace spaces with hyphens)
      const slug = data.name.toLowerCase().replace(/\s+/g, "-");

      this.db
        .query(
          `INSERT INTO roles (
            id, tenant_id, name, slug, description, type, scope,
            is_default, metadata, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .run(
          id,
          data.tenantId,
          data.name,
          slug,
          data.description || null,
          "custom", // Type
          "global", // Default scope
          0, // is_default
          JsonColumn.stringify({}),
          now
        );

      // Add permissions if provided
      if (data.permissions && data.permissions.length > 0) {
        for (const permission of data.permissions) {
          // Ensure permission exists
          await this.ensurePermissionExists(permission);

          // Link to role
          const rpId = (globalThis as any).crypto.randomUUID();
          this.db
            .query(
              `INSERT INTO role_permissions (
                id, role_id, permission_id, conditions, granted_at
              ) VALUES (?, ?, ?, ?, ?)`
            )
            .run(
              rpId,
              id,
              permission.id,
              permission.conditions ? JsonColumn.stringify(permission.conditions) : null,
              now
            );
        }
      }

      const result = await this.findById(asRoleId(id));
      if (!result.success || !result.data) {
        return {
          success: false,
          error: mapDatabaseError(new Error("Failed to retrieve created role"), "create"),
        };
      }

      return { success: true, data: result.data };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "create") };
    }
  }

  async update(id: RoleId, data: UpdateRoleData): AsyncResult<Role> {
    try {
      const updates: string[] = [];
      const params: any[] = [];

      if (data.name !== undefined) {
        updates.push("name = ?");
        params.push(data.name);

        // Update slug as well
        const slug = data.name.toLowerCase().replace(/\s+/g, "-");
        updates.push("slug = ?");
        params.push(slug);
      }

      if (data.description !== undefined) {
        updates.push("description = ?");
        params.push(data.description);
      }

      if (updates.length === 0) {
        // No updates, just return current
        return this.findById(id);
      }

      params.push(id);

      this.db.query(`UPDATE roles SET ${updates.join(", ")} WHERE id = ?`).run(...params);

      return this.findById(id);
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "update") };
    }
  }

  async delete(id: RoleId): AsyncResult<void> {
    try {
      // Check if it's a system role
      const role = await this.findById(id);
      if (role.success && role.data?.isSystem) {
        return {
          success: false,
          error: {
            code: "INSUFFICIENT_PERMISSIONS",
            message: "Cannot delete system role",
            status: 403,
          },
        };
      }

      // Delete role (cascades to role_permissions and role_assignments)
      this.db.query("DELETE FROM roles WHERE id = ?").run(id);

      return { success: true, data: undefined };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "delete") };
    }
  }

  // -------------------------------------------------------------------------
  // Permissions
  // -------------------------------------------------------------------------

  async addPermission(roleId: RoleId, permission: Permission): AsyncResult<void> {
    try {
      const now = DbTimestamp.now();

      // Ensure permission exists
      await this.ensurePermissionExists(permission);

      // Check if already assigned
      const existing = this.db
        .query<RolePermissionRow, [string, string]>(
          "SELECT * FROM role_permissions WHERE role_id = ? AND permission_id = ?"
        )
        .get(roleId, permission.id);

      if (existing) {
        return { success: true, data: undefined }; // Already assigned
      }

      // Add permission to role
      const rpId = (globalThis as any).crypto.randomUUID();
      this.db
        .query(
          `INSERT INTO role_permissions (
            id, role_id, permission_id, conditions, granted_at
          ) VALUES (?, ?, ?, ?, ?)`
        )
        .run(
          rpId,
          roleId,
          permission.id,
          permission.conditions ? JsonColumn.stringify(permission.conditions) : null,
          now
        );

      return { success: true, data: undefined };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "addPermission") };
    }
  }

  async removePermission(roleId: RoleId, permissionId: PermissionId): AsyncResult<void> {
    try {
      this.db
        .query("DELETE FROM role_permissions WHERE role_id = ? AND permission_id = ?")
        .run(roleId, permissionId);

      return { success: true, data: undefined };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "removePermission") };
    }
  }

  // -------------------------------------------------------------------------
  // User Queries
  // -------------------------------------------------------------------------

  async getUsersWithRole(roleId: RoleId): AsyncResult<readonly User[]> {
    try {
      const rows = this.db
        .query<UserRow, [string]>(
          `SELECT DISTINCT u.id, u.tenant_id, u.email, u.status, u.type, u.created_at, u.updated_at
           FROM users u
           INNER JOIN role_assignments ra ON ra.principal_id = u.id AND ra.principal_type = 'user'
           WHERE ra.role_id = ?
             AND u.deleted_at IS NULL
           ORDER BY u.email ASC`
        )
        .all(roleId);

      const users = rows.map((row: any) => this.mapUserRowToEntity(row));

      return { success: true, data: users };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "getUsersWithRole") };
    }
  }

  // -------------------------------------------------------------------------
  // Helper Methods
  // -------------------------------------------------------------------------

  private async getPermissionsForRole(roleId: RoleId): Promise<Permission[]> {
    const rows = this.db
      .query<PermissionRow & { conditions: string | null }, [string]>(
        `SELECT p.*, rp.conditions
         FROM permissions p
         INNER JOIN role_permissions rp ON rp.permission_id = p.id
         WHERE rp.role_id = ?
         ORDER BY p.resource, p.action`
      )
      .all(roleId);

    return rows.map((row: any) => this.mapPermissionRowToEntity(row));
  }

  private async ensurePermissionExists(permission: Permission): Promise<void> {
    const existing = this.db
      .query<PermissionRow, [string]>("SELECT * FROM permissions WHERE id = ?")
      .get(permission.id);

    if (!existing) {
      // Create permission
      this.db
        .query(
          `INSERT INTO permissions (
            id, resource, action, description, category, is_sensitive
          ) VALUES (?, ?, ?, ?, ?, ?)`
        )
        .run(
          permission.id,
          permission.resource,
          permission.action,
          `${permission.action} ${permission.resource}`, // Description
          permission.resource, // Category
          0 // is_sensitive
        );
    }
  }

  // -------------------------------------------------------------------------
  // Mapping
  // -------------------------------------------------------------------------

  private mapRowToEntity(row: RoleRow, permissions: Permission[]): Role {
    return {
      id: asRoleId(row.id),
      tenantId: row.tenant_id ? (row.tenant_id as TenantId) : ("" as TenantId),
      name: row.name,
      description: row.description || undefined,
      isSystem: row.type === "system",
      permissions,
      createdAt: row.created_at,
    };
  }

  private mapPermissionRowToEntity(
    row: PermissionRow & { conditions: string | null }
  ): Permission {
    const conditions = row.conditions
      ? JsonColumn.parse<PermissionCondition[]>(row.conditions)
      : undefined;

    return {
      id: asPermissionId(row.id),
      resource: row.resource as PermissionResourceType,
      action: row.action as ActionType,
      scope: "tenant" as PermissionScope, // Default scope
      conditions,
    };
  }

  private mapUserRowToEntity(row: UserRow): User {
    return {
      id: asUserId(row.id),
      tenantId: row.tenant_id as TenantId,
      email: row.email as any,
      emailVerified: false,
      name: row.email, // Simplified, would need profile join
      status: row.status as any,
      authMethod: "password" as any,
      mfaEnabled: false,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
