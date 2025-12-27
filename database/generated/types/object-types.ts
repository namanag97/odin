export type ObjectTypesStatus = "draft" | "published" | "deprecated";

/**
 * Represents a row in the object_types table
 * Source: 19_ocpm_extended.sql
 */
export interface ObjectTypes {
  /** Primary key */
  id: string;
  tenant_id: string;
  perspective_id: string;
  name: string;
  display_name: string | null;
  description: string | null;
  source_table: string | null;
  identifier_columns: string;
  icon: string | null;
  color: string | null;
  /** JSON field */
  tags: unknown[] | null;
  is_lead_object: number;
  status: ObjectTypesStatus;
  /** JSON field */
  attribute_schema: Record<string, unknown> | null;
  /** JSON field */
  metadata: Record<string, unknown> | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

/** Insert type for object_types (excludes auto-generated fields) */
export interface ObjectTypesInsert {
  tenant_id: string;
  perspective_id: string;
  name: string;
  display_name?: string | null;
  description?: string | null;
  source_table?: string | null;
  identifier_columns: string;
  icon?: string | null;
  color?: string | null;
  tags?: unknown[] | null;
  is_lead_object?: number;
  status?: ObjectTypesStatus;
  attribute_schema?: Record<string, unknown> | null;
  metadata?: Record<string, unknown> | null;
  created_by?: string | null;
  published_at?: string | null;
}