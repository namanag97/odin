/**
 * User Repository Implementation - SQLite
 *
 * Implements IUserRepository using Bun's native SQLite driver
 */

import type { Database } from "bun:sqlite";
import type {
  TenantId,
  UserId,
  OrganizationId,
  Email,
  AsyncResult,
  PageRequest,
  PageResponse,
} from "@odin/core-contracts";
import type {
  User,
  UserStatus,
  AuthMethod,
  UserProfile,
  UserPreferences,
  CreateUserData,
  UpdateUserData,
  Role,
  RoleId,
  IUserRepository
} from "@odin/domain";
import { asUserId } from "@odin/core-contracts";

import { mapDatabaseError } from "../../error-mapper";
import { DbTimestamp, JsonColumn , Pagination } from "../../types";

// ============================================================================
// Database Row Types
// ============================================================================

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

interface UserProfileRow {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  display_name: string | null;
  avatar_url: string | null;
  timezone: string | null;
  locale: string | null;
  bio: string | null;
  job_title: string | null;
  department: string | null;
  custom_fields: string; // JSON
  updated_at: string;
}

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

// ============================================================================
// Default Values
// ============================================================================

const DEFAULT_PREFERENCES: UserPreferences = {
  theme: "system",
  emailNotifications: true,
  weeklyDigest: false,
};

// ============================================================================
// Repository Implementation
// ============================================================================

export class SqliteUserRepository implements IUserRepository {
  constructor(private db: Database) {}

  // -------------------------------------------------------------------------
  // Queries
  // -------------------------------------------------------------------------

  async findById(id: UserId): AsyncResult<User | null> {
    try {
      const row = this.db
        .query<UserRow, [string]>("SELECT * FROM users WHERE id = ? AND deleted_at IS NULL")
        .get(id);

      if (!row) {
        return { success: true, data: null };
      }

      return { success: true, data: await this.mapRowToEntity(row) };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "findById") };
    }
  }

  async findByEmail(tenantId: TenantId, email: Email): AsyncResult<User | null> {
    try {
      const row = this.db
        .query<UserRow, [string, string]>(
          "SELECT * FROM users WHERE tenant_id = ? AND email = ? AND deleted_at IS NULL"
        )
        .get(tenantId, email);

      if (!row) {
        return { success: true, data: null };
      }

      return { success: true, data: await this.mapRowToEntity(row) };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "findByEmail") };
    }
  }

  async findByTenantId(
    tenantId: TenantId,
    options?: PageRequest
  ): AsyncResult<PageResponse<User>> {
    try {
      const { limit, offset } = Pagination.toOffset(options);

      // Get total count
      const countRow = this.db
        .query<{ count: number }, [string]>(
          "SELECT COUNT(*) as count FROM users WHERE tenant_id = ? AND deleted_at IS NULL"
        )
        .get(tenantId);

      const total = countRow?.count || 0;

      // Get paginated results
      const rows = this.db
        .query<UserRow, [string, number, number]>(
          `SELECT * FROM users
           WHERE tenant_id = ? AND deleted_at IS NULL
           ORDER BY created_at DESC
           LIMIT ? OFFSET ?`
        )
        .all(tenantId, limit, offset);

      const items = await Promise.all(rows.map((row: any) => this.mapRowToEntity(row)));

      const result = Pagination.buildResponse(items, total, options);
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "findByTenantId") };
    }
  }

  async findByOrganization(
    orgId: OrganizationId,
    options?: PageRequest
  ): AsyncResult<PageResponse<User>> {
    try {
      const { limit, offset } = Pagination.toOffset(options);

      // Get total count
      const countRow = this.db
        .query<{ count: number }, [string]>(
          `SELECT COUNT(DISTINCT u.id) as count
           FROM users u
           INNER JOIN role_assignments ra ON ra.principal_id = u.id AND ra.principal_type = 'user'
           WHERE ra.scope_type = 'organization'
             AND ra.scope_id = ?
             AND u.deleted_at IS NULL`
        )
        .get(orgId);

      const total = countRow?.count || 0;

      // Get paginated results
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
        .all(orgId, limit, offset);

      const items = await Promise.all(rows.map((row: any) => this.mapRowToEntity(row)));

      const result = Pagination.buildResponse(items, total, options);
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "findByOrganization") };
    }
  }

  // -------------------------------------------------------------------------
  // Commands
  // -------------------------------------------------------------------------

  async create(data: CreateUserData): AsyncResult<User> {
    try {
      const id = (globalThis as any).crypto.randomUUID();
      const now = DbTimestamp.now();

      // Determine auth method - if passwordHash is provided, use password, otherwise SSO
      const hasPassword = !!data.passwordHash;

      this.db
        .query(
          `INSERT INTO users (
            id, tenant_id, email, password_hash, status, type,
            mfa_enabled, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .run(
          id,
          data.tenantId,
          data.email,
          data.passwordHash || null,
          "pending", // Default status
          "human", // Default type
          0, // mfa_enabled = false
          now,
          now
        );

      // Create default profile
      const profileId = (globalThis as any).crypto.randomUUID();
      this.db
        .query(
          `INSERT INTO user_profiles (
            id, user_id, display_name, timezone, locale, custom_fields, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?)`
        )
        .run(
          profileId,
          id,
          data.name,
          "UTC",
          "en",
          JsonColumn.stringify({ preferences: DEFAULT_PREFERENCES }),
          now
        );

      const result = await this.findById(asUserId(id));
      if (!result.success || !result.data) {
        return {
          success: false,
          error: mapDatabaseError(new Error("Failed to retrieve created user"), "create"),
        };
      }

      return { success: true, data: result.data };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "create") };
    }
  }

  async update(id: UserId, data: UpdateUserData): AsyncResult<User> {
    try {
      const now = DbTimestamp.now();
      const updates: string[] = [];
      const params: any[] = [];

      if (data.emailVerified !== undefined) {
        updates.push("email_verified_at = ?");
        params.push(data.emailVerified ? now : null);
      }

      if (updates.length > 0) {
        updates.push("updated_at = ?");
        params.push(now);
        params.push(id);

        this.db
          .query(`UPDATE users SET ${updates.join(", ")} WHERE id = ? AND deleted_at IS NULL`)
          .run(...params);
      }

      // Update profile fields
      const profileUpdates: string[] = [];
      const profileParams: any[] = [];

      if (data.name !== undefined) {
        profileUpdates.push("display_name = ?");
        profileParams.push(data.name);
      }

      if (data.avatarUrl !== undefined) {
        profileUpdates.push("avatar_url = ?");
        profileParams.push(data.avatarUrl);
      }

      if (profileUpdates.length > 0) {
        profileUpdates.push("updated_at = ?");
        profileParams.push(now);
        profileParams.push(id);

        this.db
          .query(`UPDATE user_profiles SET ${profileUpdates.join(", ")} WHERE user_id = ?`)
          .run(...profileParams);
      }

      return this.findById(id);
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "update") };
    }
  }

  async updateStatus(id: UserId, status: UserStatus): AsyncResult<User> {
    try {
      const now = DbTimestamp.now();

      this.db
        .query("UPDATE users SET status = ?, updated_at = ? WHERE id = ? AND deleted_at IS NULL")
        .run(status, now, id);

      return this.findById(id);
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "updateStatus") };
    }
  }

  async updatePassword(id: UserId, hashedPassword: string): AsyncResult<void> {
    try {
      const now = DbTimestamp.now();

      this.db
        .query("UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ? AND deleted_at IS NULL")
        .run(hashedPassword, now, id);

      return { success: true, data: undefined };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "updatePassword") };
    }
  }

  async updateLastLogin(id: UserId): AsyncResult<void> {
    try {
      const now = DbTimestamp.now();

      this.db
        .query(
          "UPDATE users SET last_login_at = ?, updated_at = ? WHERE id = ? AND deleted_at IS NULL"
        )
        .run(now, now, id);

      return { success: true, data: undefined };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "updateLastLogin") };
    }
  }

  async delete(id: UserId): AsyncResult<void> {
    try {
      const now = DbTimestamp.now();

      this.db
        .query("UPDATE users SET deleted_at = ?, updated_at = ? WHERE id = ?")
        .run(now, now, id);

      return { success: true, data: undefined };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "delete") };
    }
  }

  // -------------------------------------------------------------------------
  // Profile
  // -------------------------------------------------------------------------

  async getProfile(userId: UserId): AsyncResult<UserProfile | null> {
    try {
      const row = this.db
        .query<UserProfileRow, [string]>("SELECT * FROM user_profiles WHERE user_id = ?")
        .get(userId);

      if (!row) {
        return { success: true, data: null };
      }

      return { success: true, data: this.mapProfileRowToEntity(row) };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "getProfile") };
    }
  }

  async updateProfile(userId: UserId, data: Partial<UserProfile>): AsyncResult<UserProfile> {
    try {
      const now = DbTimestamp.now();
      const updates: string[] = [];
      const params: any[] = [];

      if (data.displayName !== undefined) {
        updates.push("display_name = ?");
        params.push(data.displayName);
      }

      if (data.jobTitle !== undefined) {
        updates.push("job_title = ?");
        params.push(data.jobTitle);
      }

      if (data.department !== undefined) {
        updates.push("department = ?");
        params.push(data.department);
      }

      if (data.timezone !== undefined) {
        updates.push("timezone = ?");
        params.push(data.timezone);
      }

      if (data.locale !== undefined) {
        updates.push("locale = ?");
        params.push(data.locale);
      }

      if (data.preferences !== undefined) {
        // Get current custom_fields to merge preferences
        const current = await this.getProfile(userId);
        if (current.success && current.data) {
          const customFields = {
            preferences: {
              ...current.data.preferences,
              ...data.preferences,
            },
          };

          updates.push("custom_fields = ?");
          params.push(JsonColumn.stringify(customFields));
        }
      }

      if (updates.length > 0) {
        updates.push("updated_at = ?");
        params.push(now);
        params.push(userId);

        this.db
          .query(`UPDATE user_profiles SET ${updates.join(", ")} WHERE user_id = ?`)
          .run(...params);
      }

      const result = await this.getProfile(userId);
      if (!result.success || !result.data) {
        return {
          success: false,
          error: mapDatabaseError(new Error("Failed to retrieve updated profile"), "updateProfile"),
        };
      }

      return { success: true, data: result.data };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "updateProfile") };
    }
  }

  // -------------------------------------------------------------------------
  // Roles
  // -------------------------------------------------------------------------

  async getRoles(userId: UserId): AsyncResult<readonly Role[]> {
    try {
      const rows = this.db
        .query<RoleRow, [string]>(
          `SELECT r.*
           FROM roles r
           INNER JOIN role_assignments ra ON ra.role_id = r.id
           WHERE ra.principal_type = 'user'
             AND ra.principal_id = ?
           ORDER BY r.name ASC`
        )
        .all(userId);

      const roles = rows.map((row: any) => this.mapRoleRowToEntity(row));

      return { success: true, data: roles };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "getRoles") };
    }
  }

  async assignRole(userId: UserId, roleId: RoleId): AsyncResult<void> {
    try {
      const assignmentId = (globalThis as any).crypto.randomUUID();
      const now = DbTimestamp.now();

      this.db
        .query(
          `INSERT INTO role_assignments (
            id, role_id, principal_type, principal_id,
            scope_type, granted_by, granted_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?)`
        )
        .run(assignmentId, roleId, "user", userId, "global", userId, now);

      return { success: true, data: undefined };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "assignRole") };
    }
  }

  async revokeRole(userId: UserId, roleId: RoleId): AsyncResult<void> {
    try {
      this.db
        .query(
          `DELETE FROM role_assignments
           WHERE role_id = ?
             AND principal_type = 'user'
             AND principal_id = ?`
        )
        .run(roleId, userId);

      return { success: true, data: undefined };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "revokeRole") };
    }
  }

  // -------------------------------------------------------------------------
  // Mapping
  // -------------------------------------------------------------------------

  private async mapRowToEntity(row: UserRow): Promise<User> {
    // Get profile to retrieve name and avatar
    const profileRow = this.db
      .query<UserProfileRow, [string]>("SELECT * FROM user_profiles WHERE user_id = ?")
      .get(row.id);

    const displayName = profileRow?.display_name || profileRow?.first_name || row.email;

    // Determine auth method
    const authMethod: AuthMethod = row.password_hash ? "password" : "sso";

    return {
      id: asUserId(row.id),
      tenantId: row.tenant_id as TenantId,
      email: row.email as Email,
      emailVerified: !!row.email_verified_at,
      name: displayName,
      avatarUrl: profileRow?.avatar_url || undefined,
      status: row.status as UserStatus,
      authMethod,
      mfaEnabled: row.mfa_enabled === 1,
      lastLoginAt: row.last_login_at || undefined,
      passwordChangedAt: undefined, // Not tracked in current schema
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private mapProfileRowToEntity(row: UserProfileRow): UserProfile {
    const customFields = JsonColumn.parse<{ preferences?: UserPreferences }>(row.custom_fields) || {};

    return {
      userId: asUserId(row.user_id),
      displayName: row.display_name || undefined,
      jobTitle: row.job_title || undefined,
      department: row.department || undefined,
      timezone: row.timezone || undefined,
      locale: row.locale || undefined,
      preferences: {
        ...DEFAULT_PREFERENCES,
        ...customFields.preferences,
      },
    };
  }

  private mapRoleRowToEntity(row: RoleRow): Role {
    const metadata = JsonColumn.parse<Record<string, any>>(row.metadata) || {};

    return {
      id: row.id as RoleId,
      tenantId: row.tenant_id ? (row.tenant_id as TenantId) : undefined,
      name: row.name,
      slug: row.slug,
      description: row.description || undefined,
      type: row.type as any,
      scope: row.scope as any,
      permissions: [], // Permissions would require another join
      metadata,
      createdAt: row.created_at,
    };
  }
}
