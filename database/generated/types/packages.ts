export type PackagesStatus = "draft" | "published" | "archived";

/**
 * Represents a row in the packages table
 * Source: 17_studio.sql
 */
export interface Packages {
  /** Primary key */
  id: string;
  tenant_id: string;
  space_id: string;
  key: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  status: PackagesStatus;
  version: string | null;
  is_template: number;
  source_package_id: string | null;
  data_model_variable_id: string | null;
  published_at: string | null;
  /** JSON field */
  metadata: Record<string, unknown> | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

/** Insert type for packages (excludes auto-generated fields) */
export interface PackagesInsert {
  tenant_id: string;
  space_id: string;
  key: string;
  name: string;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
  status?: PackagesStatus;
  version?: string | null;
  is_template?: number;
  source_package_id?: string | null;
  data_model_variable_id?: string | null;
  published_at?: string | null;
  metadata?: Record<string, unknown> | null;
  created_by?: string | null;
}