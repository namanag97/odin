export type RecordsDefaultSortOrder = "asc" | "desc";

/**
 * Represents a row in the records table
 * Source: 16_semantic.sql
 */
export interface Records {
  /** Primary key */
  id: string;
  tenant_id: string;
  knowledge_model_id: string;
  key: string;
  display_name: string | null;
  description: string | null;
  base_table: string;
  identifier_attribute: string | null;
  default_sort_attribute: string | null;
  default_sort_order: RecordsDefaultSortOrder | null;
  icon: string | null;
  color: string | null;
  /** JSON field */
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

/** Insert type for records (excludes auto-generated fields) */
export interface RecordsInsert {
  tenant_id: string;
  knowledge_model_id: string;
  key: string;
  display_name?: string | null;
  description?: string | null;
  base_table: string;
  identifier_attribute?: string | null;
  default_sort_attribute?: string | null;
  default_sort_order?: RecordsDefaultSortOrder | null;
  icon?: string | null;
  color?: string | null;
  metadata?: Record<string, unknown> | null;
}