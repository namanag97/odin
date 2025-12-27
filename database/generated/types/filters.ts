export type FiltersFilterType = "standard" | "process" | "forced";

/**
 * Represents a row in the filters table
 * Source: 16_semantic.sql
 */
export interface Filters {
  /** Primary key */
  id: string;
  tenant_id: string;
  knowledge_model_id: string;
  key: string;
  display_name: string | null;
  description: string | null;
  pql_expression: string;
  base_table: string | null;
  filter_type: FiltersFilterType;
  category: string | null;
  is_default: number;
  /** JSON field */
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

/** Insert type for filters (excludes auto-generated fields) */
export interface FiltersInsert {
  tenant_id: string;
  knowledge_model_id: string;
  key: string;
  display_name?: string | null;
  description?: string | null;
  pql_expression: string;
  base_table?: string | null;
  filter_type?: FiltersFilterType;
  category?: string | null;
  is_default?: number;
  metadata?: Record<string, unknown> | null;
}