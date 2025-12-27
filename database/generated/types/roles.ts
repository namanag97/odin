export type RolesType = "system" | "custom";
export type RolesScope = "global" | "organization" | "team" | "resource";

/**
 * Represents a row in the roles table
 * Source: 21_identity_layer.sql
 */
export interface Roles {
  /** Primary key */
  id: string;
  tenant_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  type: RolesType;
  scope: RolesScope;
  is_default: number;
  /** JSON field */
  metadata: Record<string, unknown> | null;
  created_at: string;
}

/** Insert type for roles (excludes auto-generated fields) */
export interface RolesInsert {
  tenant_id?: string | null;
  name: string;
  slug: string;
  description?: string | null;
  type?: RolesType;
  scope?: RolesScope;
  is_default?: number;
  metadata?: Record<string, unknown> | null;
}