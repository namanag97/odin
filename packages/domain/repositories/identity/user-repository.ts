/**
 * User Repository Interface - Identity Layer
 * 
 * Data access contract for User entities.
 */

import type { 
  TenantId,
  UserId,
  OrganizationId,
  Email,
  AsyncResult,
  PageRequest,
  PageResponse
} from '@odin/core-contracts';

import type { 
  User, 
  UserStatus,
  UserProfile,
  CreateUserData, 
  UpdateUserData 
} from '../../entities/identity/user';

import type { Role, RoleId } from '../../entities/identity/role';

// ============================================================================
// Repository Interface
// ============================================================================

/**
 * IUserRepository - User data access contract
 */
export interface IUserRepository {
  // -------------------------------------------------------------------------
  // Queries
  // -------------------------------------------------------------------------
  
  /**
   * Find a user by ID
   */
  findById(id: UserId): AsyncResult<User | null>;
  
  /**
   * Find a user by email within a tenant
   */
  findByEmail(tenantId: TenantId, email: Email): AsyncResult<User | null>;
  
  /**
   * Find users by tenant
   */
  findByTenantId(tenantId: TenantId, options?: PageRequest): AsyncResult<PageResponse<User>>;
  
  /**
   * Find users by organization
   */
  findByOrganization(orgId: OrganizationId, options?: PageRequest): AsyncResult<PageResponse<User>>;

  // -------------------------------------------------------------------------
  // Commands
  // -------------------------------------------------------------------------
  
  /**
   * Create a new user
   */
  create(data: CreateUserData): AsyncResult<User>;
  
  /**
   * Update user fields
   */
  update(id: UserId, data: UpdateUserData): AsyncResult<User>;
  
  /**
   * Update user status
   */
  updateStatus(id: UserId, status: UserStatus): AsyncResult<User>;
  
  /**
   * Update user password (pre-hashed)
   */
  updatePassword(id: UserId, hashedPassword: string): AsyncResult<void>;
  
  /**
   * Update last login timestamp
   */
  updateLastLogin(id: UserId): AsyncResult<void>;
  
  /**
   * Delete a user
   */
  delete(id: UserId): AsyncResult<void>;

  // -------------------------------------------------------------------------
  // Profile
  // -------------------------------------------------------------------------
  
  /**
   * Get user profile
   */
  getProfile(userId: UserId): AsyncResult<UserProfile | null>;
  
  /**
   * Update user profile
   */
  updateProfile(userId: UserId, data: Partial<UserProfile>): AsyncResult<UserProfile>;

  // -------------------------------------------------------------------------
  // Roles
  // -------------------------------------------------------------------------
  
  /**
   * Get roles assigned to a user
   */
  getRoles(userId: UserId): AsyncResult<readonly Role[]>;
  
  /**
   * Assign a role to a user
   */
  assignRole(userId: UserId, roleId: RoleId): AsyncResult<void>;
  
  /**
   * Revoke a role from a user
   */
  revokeRole(userId: UserId, roleId: RoleId): AsyncResult<void>;
}
