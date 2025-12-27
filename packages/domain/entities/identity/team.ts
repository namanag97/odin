/**
 * Team Entity - Identity Layer
 * 
 * Groups of users for easier permission management.
 */

import type { 
  TenantId, 
  OrganizationId,
  UserId,
  UUID,
  ISODateTime,
  NonNegativeInt
} from '@odin/core-contracts';

// ============================================================================
// Types
// ============================================================================

/** Team member role */
export type TeamRole = 'member' | 'maintainer' | 'owner';

// ============================================================================
// Membership
// ============================================================================

/**
 * Team membership record
 */
export interface TeamMembership {
  readonly teamId: UUID;
  readonly userId: UserId;
  readonly role: TeamRole;
  readonly joinedAt: ISODateTime;
}

// ============================================================================
// Entity
// ============================================================================

/**
 * Team - Group of users
 */
export interface Team {
  readonly id: UUID;
  readonly tenantId: TenantId;
  readonly organizationId?: OrganizationId;
  readonly name: string;
  readonly description?: string;
  readonly memberCount: NonNegativeInt;
  readonly createdAt: ISODateTime;
  readonly updatedAt: ISODateTime;
}

// ============================================================================
// DTOs
// ============================================================================

/**
 * Data required to create a new team
 */
export interface CreateTeamData {
  readonly tenantId: TenantId;
  readonly organizationId?: OrganizationId;
  readonly name: string;
  readonly description?: string;
}

/**
 * Data for updating a team
 */
export interface UpdateTeamData {
  readonly name?: string;
  readonly description?: string;
}
