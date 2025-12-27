export type OrganizationsType = "division" | "department" | "unit" | "custom";

/**
 * Represents a row in the organizations table
 * Source: 20_existence_layer.sql
 */
export interface Organizations {
  /** Primary key */
  id: string;
  tenant_id: string;
  parent_org_id: string | null;
  name: string;
  code: string;
  type: OrganizationsType;
  hierarchy_path: string | null;
  /** JSON field */
  metadata: Record<string, unknown> | null;
  is_active: number;
  created_at: string;
}

/** Insert type for organizations (excludes auto-generated fields) */
export interface OrganizationsInsert {
  tenant_id: string;
  parent_org_id?: string | null;
  name: string;
  code: string;
  type: OrganizationsType;
  hierarchy_path?: string | null;
  metadata?: Record<string, unknown> | null;
  is_active?: number;
}