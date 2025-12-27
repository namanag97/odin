/**
 * Role Definitions
 * L0 Core Contract - System roles and role utilities
 */

// ============================================================================
// System Roles
// ============================================================================

/**
 * Built-in system roles
 * These cannot be deleted and have predefined permissions
 */
export enum SystemRole {
  /** Full access - tenant owner */
  Owner = 'owner',
  /** Administrative access */
  Admin = 'admin',
  /** Standard member access */
  Member = 'member',
  /** Read-only access */
  Viewer = 'viewer',
  /** Service account role */
  Service = 'service',
  /** System/background processes */
  System = 'system',
}

// ============================================================================
// Role Scope
// ============================================================================

/**
 * Scope at which a role applies
 */
export enum RoleScope {
  /** Applies across the entire tenant */
  Global = 'global',
  /** Applies to a specific organization */
  Organization = 'organization',
  /** Applies to a specific team */
  Team = 'team',
  /** Applies to a specific resource */
  Resource = 'resource',
}

// ============================================================================
// Role Type
// ============================================================================

/**
 * Whether a role is system-defined or custom
 */
export enum RoleType {
  /** Built-in system role */
  System = 'system',
  /** Custom user-defined role */
  Custom = 'custom',
}

// ============================================================================
// Role Definition
// ============================================================================

/**
 * Role definition structure
 */
export interface RoleDefinition {
  /** Role identifier */
  id: string;
  /** Role name (display) */
  name: string;
  /** Role slug (unique within tenant) */
  slug: string;
  /** Optional description */
  description?: string;
  /** Role type */
  type: RoleType;
  /** Role scope */
  scope: RoleScope;
  /** Is this the default role for new users? */
  isDefault: boolean;
  /** Permissions granted by this role */
  permissions: string[];
}

// ============================================================================
// Default Role Permissions
// ============================================================================

import { 
  DataPermissions, 
  MiningPermissions, 
  StudioPermissions,
  AutomationPermissions,
  AdminPermissions 
} from './permissions';

/**
 * Default permissions for system roles
 */
export const SystemRolePermissions: Record<SystemRole, string[]> = {
  [SystemRole.Owner]: ['*'], // All permissions
  
  [SystemRole.Admin]: [
    ...Object.values(DataPermissions),
    ...Object.values(MiningPermissions),
    ...Object.values(StudioPermissions),
    ...Object.values(AutomationPermissions),
    AdminPermissions.VIEW_USERS,
    AdminPermissions.CREATE_USER,
    AdminPermissions.EDIT_USER,
    AdminPermissions.VIEW_ROLES,
    AdminPermissions.ASSIGN_ROLE,
    AdminPermissions.VIEW_TENANT,
    AdminPermissions.VIEW_AUDIT,
  ],
  
  [SystemRole.Member]: [
    ...Object.values(DataPermissions).filter(p => !p.includes('delete')),
    ...Object.values(MiningPermissions),
    ...Object.values(StudioPermissions).filter(p => !p.includes('delete')),
    ...Object.values(AutomationPermissions).filter(p => !p.includes('delete')),
  ],
  
  [SystemRole.Viewer]: [
    DataPermissions.VIEW_POOL,
    DataPermissions.VIEW_CONNECTION,
    DataPermissions.VIEW_EVENT_LOG,
    DataPermissions.VIEW_JOB,
    MiningPermissions.VIEW_MODEL,
    MiningPermissions.VIEW_DISCOVERY,
    MiningPermissions.VIEW_CONFORMANCE,
    MiningPermissions.VIEW_ANALYTICS,
    StudioPermissions.VIEW_DASHBOARD,
    StudioPermissions.VIEW_VIEW,
    StudioPermissions.VIEW_COMPONENT,
    AutomationPermissions.VIEW_WORKFLOW,
    AutomationPermissions.VIEW_ACTION_FLOW,
    AutomationPermissions.VIEW_SENSOR,
  ],
  
  [SystemRole.Service]: [
    // Service accounts get specific permissions as needed
    DataPermissions.VIEW_POOL,
    DataPermissions.VIEW_EVENT_LOG,
    MiningPermissions.VIEW_MODEL,
    MiningPermissions.RUN_DISCOVERY,
  ],
  
  [SystemRole.System]: ['*'], // System processes have full access
};

// ============================================================================
// Role Utilities
// ============================================================================

/**
 * Check if a role is a system role
 */
export const isSystemRole = (role: string): role is SystemRole => {
  return Object.values(SystemRole).includes(role as SystemRole);
};

/**
 * Get permissions for a system role
 */
export const getSystemRolePermissions = (role: SystemRole): string[] => {
  return SystemRolePermissions[role] ?? [];
};

/**
 * Get permissions for a list of roles
 */
export const resolveRolePermissions = (
  roles: string[],
  customRolePermissions: Map<string, string[]> = new Map()
): string[] => {
  const permissions = new Set<string>();
  
  for (const role of roles) {
    if (isSystemRole(role)) {
      getSystemRolePermissions(role).forEach(p => permissions.add(p));
    } else {
      const custom = customRolePermissions.get(role);
      if (custom) {
        custom.forEach(p => permissions.add(p));
      }
    }
  }
  
  return Array.from(permissions);
};
