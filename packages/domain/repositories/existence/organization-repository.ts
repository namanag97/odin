/**
 * Organization Repository Interface - Existence Layer
 * 
 * Data access contract for Organization entities.
 */

import type { 
  TenantId,
  OrganizationId,
  UserId,
  AsyncResult,
  PageRequest,
  PageResponse
} from '@odin/core-contracts';

import type { 
  Organization,
  CreateOrganizationData, 
  UpdateOrganizationData 
} from '../../entities/existence/organization';

import type { User } from '../../entities/identity/user';
import type { RoleId } from '../../entities/identity/role';

// ============================================================================
// Repository Interface
// ============================================================================

/**
 * IOrganizationRepository - Organization data access contract
 */
export interface IOrganizationRepository {
  // -------------------------------------------------------------------------
  // Queries
  // -------------------------------------------------------------------------
  
  /**
   * Find an organization by ID
   */
  findById(id: OrganizationId): AsyncResult<Organization | null>;
  
  /**
   * Find organizations by tenant
   */
  findByTenantId(tenantId: TenantId, options?: PageRequest): AsyncResult<PageResponse<Organization>>;
  
  /**
   * Find child organizations
   */
  findChildren(parentId: OrganizationId): AsyncResult<readonly Organization[]>;
  
  /**
   * Find all ancestor organizations (up the hierarchy)
   */
  findAncestors(id: OrganizationId): AsyncResult<readonly Organization[]>;

  // -------------------------------------------------------------------------
  // Commands
  // -------------------------------------------------------------------------
  
  /**
   * Create a new organization
   */
  create(data: CreateOrganizationData): AsyncResult<Organization>;
  
  /**
   * Update organization fields
   */
  update(id: OrganizationId, data: UpdateOrganizationData): AsyncResult<Organization>;
  
  /**
   * Delete an organization
   */
  delete(id: OrganizationId): AsyncResult<void>;

  // -------------------------------------------------------------------------
  // Membership
  // -------------------------------------------------------------------------
  
  /**
   * Get members of an organization
   */
  getMembers(id: OrganizationId, options?: PageRequest): AsyncResult<PageResponse<User>>;
  
  /**
   * Add a member to an organization
   */
  addMember(orgId: OrganizationId, userId: UserId, role: RoleId): AsyncResult<void>;
  
  /**
   * Remove a member from an organization
   */
  removeMember(orgId: OrganizationId, userId: UserId): AsyncResult<void>;
}
