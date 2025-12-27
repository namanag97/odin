
/**
 * Represents a row in the role_permissions table
 * Source: 21_identity_layer.sql
 */
export interface RolePermissions {
  /** Primary key */
  id: string;
  role_id: string;
  permission_id: string;
  conditions: string | null;
  granted_at: string;
}

/** Insert type for role_permissions (excludes auto-generated fields) */
export interface RolePermissionsInsert {
  role_id: string;
  permission_id: string;
  conditions?: string | null;
  granted_at?: string;
}