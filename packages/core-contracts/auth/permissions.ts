/**
 * Permission Enum
 * L0 Core Contract - All permissions across the platform
 */

// ============================================================================
// Permission Categories
// ============================================================================

/**
 * Permissions are structured as RESOURCE:ACTION
 * This allows for granular access control
 */

// ============================================================================
// Data Domain Permissions
// ============================================================================

export const DataPermissions = {
  // Pools
  VIEW_POOL: 'pool:view',
  CREATE_POOL: 'pool:create',
  EDIT_POOL: 'pool:edit',
  DELETE_POOL: 'pool:delete',
  
  // Connections
  VIEW_CONNECTION: 'connection:view',
  CREATE_CONNECTION: 'connection:create',
  EDIT_CONNECTION: 'connection:edit',
  DELETE_CONNECTION: 'connection:delete',
  TEST_CONNECTION: 'connection:test',
  
  // Event Logs
  VIEW_EVENT_LOG: 'event_log:view',
  UPLOAD_EVENT_LOG: 'event_log:upload',
  DELETE_EVENT_LOG: 'event_log:delete',
  EXPORT_EVENT_LOG: 'event_log:export',
  
  // Import Jobs
  VIEW_JOB: 'job:view',
  CREATE_JOB: 'job:create',
  CANCEL_JOB: 'job:cancel',
} as const;

// ============================================================================
// Mining Domain Permissions
// ============================================================================

export const MiningPermissions = {
  // Process Models
  VIEW_MODEL: 'model:view',
  CREATE_MODEL: 'model:create',
  EDIT_MODEL: 'model:edit',
  DELETE_MODEL: 'model:delete',
  
  // Discovery
  RUN_DISCOVERY: 'discovery:run',
  VIEW_DISCOVERY: 'discovery:view',
  
  // Conformance
  RUN_CONFORMANCE: 'conformance:run',
  VIEW_CONFORMANCE: 'conformance:view',
  
  // Analytics
  VIEW_ANALYTICS: 'analytics:view',
  EXPORT_ANALYTICS: 'analytics:export',
} as const;

// ============================================================================
// Studio Domain Permissions
// ============================================================================

export const StudioPermissions = {
  // Dashboards
  VIEW_DASHBOARD: 'dashboard:view',
  CREATE_DASHBOARD: 'dashboard:create',
  EDIT_DASHBOARD: 'dashboard:edit',
  DELETE_DASHBOARD: 'dashboard:delete',
  SHARE_DASHBOARD: 'dashboard:share',
  
  // Views
  VIEW_VIEW: 'view:view',
  CREATE_VIEW: 'view:create',
  EDIT_VIEW: 'view:edit',
  DELETE_VIEW: 'view:delete',
  
  // Components
  VIEW_COMPONENT: 'component:view',
  CREATE_COMPONENT: 'component:create',
  EDIT_COMPONENT: 'component:edit',
  DELETE_COMPONENT: 'component:delete',
} as const;

// ============================================================================
// Automation Domain Permissions
// ============================================================================

export const AutomationPermissions = {
  // Workflows
  VIEW_WORKFLOW: 'workflow:view',
  CREATE_WORKFLOW: 'workflow:create',
  EDIT_WORKFLOW: 'workflow:edit',
  DELETE_WORKFLOW: 'workflow:delete',
  RUN_WORKFLOW: 'workflow:run',
  
  // Action Flows
  VIEW_ACTION_FLOW: 'action_flow:view',
  CREATE_ACTION_FLOW: 'action_flow:create',
  EDIT_ACTION_FLOW: 'action_flow:edit',
  DELETE_ACTION_FLOW: 'action_flow:delete',
  RUN_ACTION_FLOW: 'action_flow:run',
  
  // Sensors & Signals
  VIEW_SENSOR: 'sensor:view',
  CREATE_SENSOR: 'sensor:create',
  EDIT_SENSOR: 'sensor:edit',
  DELETE_SENSOR: 'sensor:delete',
} as const;

// ============================================================================
// Admin Permissions
// ============================================================================

export const AdminPermissions = {
  // Users
  VIEW_USERS: 'user:view',
  CREATE_USER: 'user:create',
  EDIT_USER: 'user:edit',
  DELETE_USER: 'user:delete',
  IMPERSONATE_USER: 'user:impersonate',
  
  // Roles
  VIEW_ROLES: 'role:view',
  CREATE_ROLE: 'role:create',
  EDIT_ROLE: 'role:edit',
  DELETE_ROLE: 'role:delete',
  ASSIGN_ROLE: 'role:assign',
  
  // Tenant
  VIEW_TENANT: 'tenant:view',
  EDIT_TENANT: 'tenant:edit',
  VIEW_BILLING: 'billing:view',
  MANAGE_BILLING: 'billing:manage',
  
  // Audit
  VIEW_AUDIT: 'audit:view',
  EXPORT_AUDIT: 'audit:export',
  
  // System
  VIEW_SYSTEM: 'system:view',
  MANAGE_SYSTEM: 'system:manage',
} as const;

// ============================================================================
// All Permissions
// ============================================================================

export const Permissions = {
  ...DataPermissions,
  ...MiningPermissions,
  ...StudioPermissions,
  ...AutomationPermissions,
  ...AdminPermissions,
} as const;

export type Permission = typeof Permissions[keyof typeof Permissions];

// ============================================================================
// Permission Utilities
// ============================================================================

/**
 * Check if a permission list includes a specific permission
 */
export const hasPermission = (
  permissions: string[],
  required: Permission
): boolean => {
  // Wildcard permission grants all access
  if (permissions.includes('*')) return true;
  return permissions.includes(required);
};

/**
 * Check if a permission list includes all specified permissions
 */
export const hasAllPermissions = (
  permissions: string[],
  required: Permission[]
): boolean => {
  if (permissions.includes('*')) return true;
  return required.every(p => permissions.includes(p));
};

/**
 * Check if a permission list includes any of the specified permissions
 */
export const hasAnyPermission = (
  permissions: string[],
  required: Permission[]
): boolean => {
  if (permissions.includes('*')) return true;
  return required.some(p => permissions.includes(p));
};
