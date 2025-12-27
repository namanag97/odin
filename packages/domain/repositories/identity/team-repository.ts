/**
 * Team Repository Interface - Identity Layer
 * 
 * Data access contract for Team entities.
 */

import type { 
  TenantId,
  UserId,
  UUID,
  AsyncResult,
  PageRequest,
  PageResponse
} from '@odin/core-contracts';

import type { 
  Team,
  TeamMembership,
  TeamRole,
  CreateTeamData, 
  UpdateTeamData 
} from '../../entities/identity/team';

// ============================================================================
// Repository Interface
// ============================================================================

/**
 * ITeamRepository - Team data access contract
 */
export interface ITeamRepository {
  // -------------------------------------------------------------------------
  // Queries
  // -------------------------------------------------------------------------
  
  /**
   * Find a team by ID
   */
  findById(id: UUID): AsyncResult<Team | null>;
  
  /**
   * Find teams by tenant
   */
  findByTenantId(tenantId: TenantId, options?: PageRequest): AsyncResult<PageResponse<Team>>;
  
  /**
   * Find teams a user belongs to
   */
  findByUser(userId: UserId): AsyncResult<readonly Team[]>;

  // -------------------------------------------------------------------------
  // Commands
  // -------------------------------------------------------------------------
  
  /**
   * Create a new team
   */
  create(data: CreateTeamData): AsyncResult<Team>;
  
  /**
   * Update team fields
   */
  update(id: UUID, data: UpdateTeamData): AsyncResult<Team>;
  
  /**
   * Delete a team
   */
  delete(id: UUID): AsyncResult<void>;

  // -------------------------------------------------------------------------
  // Membership
  // -------------------------------------------------------------------------
  
  /**
   * Get team members
   */
  getMembers(teamId: UUID, options?: PageRequest): AsyncResult<PageResponse<TeamMembership>>;
  
  /**
   * Add a member to a team
   */
  addMember(teamId: UUID, userId: UserId, role: TeamRole): AsyncResult<void>;
  
  /**
   * Remove a member from a team
   */
  removeMember(teamId: UUID, userId: UserId): AsyncResult<void>;
  
  /**
   * Update a member's role
   */
  updateMemberRole(teamId: UUID, userId: UserId, role: TeamRole): AsyncResult<void>;
}
