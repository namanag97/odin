export type PerspectivesStatus = "draft" | "published" | "deprecated";

/**
 * Represents a row in the perspectives table
 * Source: 19_ocpm_extended.sql
 */
export interface Perspectives {
  /** Primary key */
  id: string;
  tenant_id: string;
  data_model_id: string;
  name: string;
  description: string | null;
  /** JSON field */
  included_object_types: unknown[] | null;
  /** JSON field */
  included_event_types: unknown[] | null;
  /** JSON field */
  included_relationships: unknown[] | null;
  filter_expression: string | null;
  is_default: number;
  status: PerspectivesStatus;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

/** Insert type for perspectives (excludes auto-generated fields) */
export interface PerspectivesInsert {
  tenant_id: string;
  data_model_id: string;
  name: string;
  description?: string | null;
  included_object_types?: unknown[] | null;
  included_event_types?: unknown[] | null;
  included_relationships?: unknown[] | null;
  filter_expression?: string | null;
  is_default?: number;
  status?: PerspectivesStatus;
  created_by?: string | null;
  published_at?: string | null;
}