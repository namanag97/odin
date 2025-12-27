/**
 * Team Repository Implementation - SQLite
 *
 * Implements ITeamRepository using Bun's native SQLite driver
 */

import type { Database } from "bun:sqlite";
import type {
  TenantId,
  UserId,
  UUID,
  AsyncResult,
  PageRequest,
  PageResponse,
} from "@odin/core-contracts";
import type {
  Team,
  TeamMembership,
  TeamRole,
  CreateTeamData,
  UpdateTeamData,
  ITeamRepository
} from "@odin/domain";
import { mapDatabaseError } from "../../error-mapper";
import { DbTimestamp, Pagination } from "../../types";

// ============================================================================
// Database Row Types
// ============================================================================

interface TeamRow {
  id: string;
  tenant_id: string;
  organization_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  visibility: string;
  metadata: string; // JSON
  created_at: string;
}

interface TeamMembershipRow {
  id: string;
  team_id: string;
  user_id: string;
  role: string;
  joined_at: string;
  invited_by: string | null;
}

// ============================================================================
// Repository Implementation
// ============================================================================

export class SqliteTeamRepository implements ITeamRepository {
  constructor(private db: Database) {}

  // -------------------------------------------------------------------------
  // Queries
  // -------------------------------------------------------------------------

  async findById(id: UUID): AsyncResult<Team | null> {
    try {
      const row = this.db
        .query<TeamRow, [string]>("SELECT * FROM teams WHERE id = ?")
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
  ): AsyncResult<PageResponse<Team>> {
    try {
      const { limit, offset } = Pagination.toOffset(options);

      // Get total count
      const countRow = this.db
        .query<{ count: number }, [string]>(
          "SELECT COUNT(*) as count FROM teams WHERE tenant_id = ?"
        )
        .get(tenantId);

      const total = countRow?.count || 0;

      // Get paginated results
      const rows = this.db
        .query<TeamRow, [string, number, number]>(
          `SELECT * FROM teams
           WHERE tenant_id = ?
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

  async findByUser(userId: UserId): AsyncResult<readonly Team[]> {
    try {
      const rows = this.db
        .query<TeamRow, [string]>(
          `SELECT t.*
           FROM teams t
           INNER JOIN team_memberships tm ON tm.team_id = t.id
           WHERE tm.user_id = ?
           ORDER BY t.name ASC`
        )
        .all(userId);

      const teams = rows.map((row: any) => this.mapRowToEntity(row));

      return { success: true, data: teams };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "findByUser") };
    }
  }

  // -------------------------------------------------------------------------
  // Commands
  // -------------------------------------------------------------------------

  async create(data: CreateTeamData): AsyncResult<Team> {
    try {
      const id = (globalThis as any).crypto.randomUUID();
      const now = DbTimestamp.now();

      // Generate slug from name
      const slug = data.name.toLowerCase().replace(/\s+/g, "-");

      this.db
        .query(
          `INSERT INTO teams (
            id, tenant_id, organization_id, name, slug, description,
            visibility, metadata, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .run(
          id,
          data.tenantId,
          data.organizationId || null,
          data.name,
          slug,
          data.description || null,
          "private", // Default visibility
          "{}",
          now
        );

      const result = await this.findById(id);
      if (!result.success || !result.data) {
        return {
          success: false,
          error: mapDatabaseError(new Error("Failed to retrieve created team"), "create"),
        };
      }

      return { success: true, data: result.data };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "create") };
    }
  }

  async update(id: UUID, data: UpdateTeamData): AsyncResult<Team> {
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

      this.db.query(`UPDATE teams SET ${updates.join(", ")} WHERE id = ?`).run(...params);

      return this.findById(id);
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "update") };
    }
  }

  async delete(id: UUID): AsyncResult<void> {
    try {
      // Delete team (cascades to team_memberships)
      this.db.query("DELETE FROM teams WHERE id = ?").run(id);

      return { success: true, data: undefined };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "delete") };
    }
  }

  // -------------------------------------------------------------------------
  // Membership
  // -------------------------------------------------------------------------

  async getMembers(
    teamId: UUID,
    options?: PageRequest
  ): AsyncResult<PageResponse<TeamMembership>> {
    try {
      const { limit, offset } = Pagination.toOffset(options);

      // Get total count
      const countRow = this.db
        .query<{ count: number }, [string]>(
          "SELECT COUNT(*) as count FROM team_memberships WHERE team_id = ?"
        )
        .get(teamId);

      const total = countRow?.count || 0;

      // Get paginated results
      const rows = this.db
        .query<TeamMembershipRow, [string, number, number]>(
          `SELECT * FROM team_memberships
           WHERE team_id = ?
           ORDER BY joined_at DESC
           LIMIT ? OFFSET ?`
        )
        .all(teamId, limit, offset);

      const items = rows.map((row: any) => this.mapMembershipRowToEntity(row));

      const result = Pagination.buildResponse(items, total, options);
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "getMembers") };
    }
  }

  async addMember(teamId: UUID, userId: UserId, role: TeamRole): AsyncResult<void> {
    try {
      const membershipId = (globalThis as any).crypto.randomUUID();
      const now = DbTimestamp.now();

      this.db
        .query(
          `INSERT INTO team_memberships (
            id, team_id, user_id, role, joined_at
          ) VALUES (?, ?, ?, ?, ?)`
        )
        .run(membershipId, teamId, userId, role, now);

      return { success: true, data: undefined };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "addMember") };
    }
  }

  async removeMember(teamId: UUID, userId: UserId): AsyncResult<void> {
    try {
      this.db
        .query("DELETE FROM team_memberships WHERE team_id = ? AND user_id = ?")
        .run(teamId, userId);

      return { success: true, data: undefined };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "removeMember") };
    }
  }

  async updateMemberRole(teamId: UUID, userId: UserId, role: TeamRole): AsyncResult<void> {
    try {
      this.db
        .query("UPDATE team_memberships SET role = ? WHERE team_id = ? AND user_id = ?")
        .run(role, teamId, userId);

      return { success: true, data: undefined };
    } catch (error) {
      return { success: false, error: mapDatabaseError(error, "updateMemberRole") };
    }
  }

  // -------------------------------------------------------------------------
  // Mapping
  // -------------------------------------------------------------------------

  private mapRowToEntity(row: TeamRow): Team {
    // Get member count
    const countRow = this.db
      .query<{ count: number }, [string]>(
        "SELECT COUNT(*) as count FROM team_memberships WHERE team_id = ?"
      )
      .get(row.id);

    const memberCount = countRow?.count || 0;

    return {
      id: row.id,
      tenantId: row.tenant_id as TenantId,
      organizationId: row.organization_id ? (row.organization_id as any) : undefined,
      name: row.name,
      description: row.description || undefined,
      memberCount,
      createdAt: row.created_at,
      updatedAt: row.created_at, // No updated_at in schema
    };
  }

  private mapMembershipRowToEntity(row: TeamMembershipRow): TeamMembership {
    return {
      teamId: row.team_id,
      userId: row.user_id as UserId,
      role: row.role as TeamRole,
      joinedAt: row.joined_at,
    };
  }
}
