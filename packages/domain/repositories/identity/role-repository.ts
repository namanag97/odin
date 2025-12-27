/**
 * Role Repository Interface - Identity Layer
 * 
 * Data access contract for Role and Permission entities.
 */

import type { 
  TenantId,
  AsyncResult
} from '@odin/core-contracts';

import type { 
  Role, 
  RoleId,
  Permission,
  PermissionId,
  CreateRoleData, 
  UpdateRoleData 
} from '../../entities/identity/role';

import type { User } from '../../entities/identity/user';

// ============================================================================
// Repository Interface
// ============================================================================

/**
 * IRoleRepository - Role data access contract
 */
export interface IRoleRepository {
  // -------------------------------------------------------------------------
  // Queries
  // -------------------------------------------------------------------------
  
  /**
   * Find a role by ID
   */
  findById(id: RoleId): AsyncResult<Role | null>;
  
  /**
   * Find roles by tenant
   */
  findByTenantId(tenantId: TenantId): AsyncResult<readonly Role[]>;
  
  /**
   * Find system (built-in) roles
   */
  findSystemRoles(): AsyncResult<readonly Role[]>;

  // -------------------------------------------------------------------------
  // Commands
  // -------------------------------------------------------------------------
  
  /**
   * Create a new role
   */
  create(data: CreateRoleData): AsyncResult<Role>;
  
  /**
   * Update role fields
   */
  update(id: RoleId, data: UpdateRoleData): AsyncResult<Role>;
  
  /**
   * Delete a role
   */
  delete(id: RoleId): AsyncResult<void>;

  // -------------------------------------------------------------------------
  // Permissions
  // -------------------------------------------------------------------------
  
  /**
   * Add a permission to a role
   */
  addPermission(roleId: RoleId, permission: Permission): AsyncResult<void>;
  
  /**
   * Remove a permission from a role
   */
  removePermission(roleId: RoleId, permissionId: PermissionId): AsyncResult<void>;

  // -------------------------------------------------------------------------
  // User Queries
  // -------------------------------------------------------------------------
  
  /**
   * Get all users with a specific role
   */
  getUsersWithRole(roleId: RoleId): AsyncResult<readonly User[]>;
}
