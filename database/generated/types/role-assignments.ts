export type RoleAssignmentsPrincipalType = "user" | "team" | "service_account";
export type RoleAssignmentsScopeType = "global" | "organization" | "team" | "resource";

/**
 * Represents a row in the role_assignments table
 * Source: 21_identity_layer.sql
 */
export interface RoleAssignments {
  /** Primary key */
  id: string;
  role_id: string;
  principal_type: RoleAssignmentsPrincipalType;
  principal_id: string;
  scope_type: RoleAssignmentsScopeType;
  scope_id: string | null;
  granted_by: string;
  granted_at: string;
  expires_at: string | null;
}

/** Insert type for role_assignments (excludes auto-generated fields) */
export interface RoleAssignmentsInsert {
  role_id: string;
  principal_type: RoleAssignmentsPrincipalType;
  principal_id: string;
  scope_type?: RoleAssignmentsScopeType;
  scope_id?: string | null;
  granted_by: string;
  granted_at?: string;
  expires_at?: string | null;
}