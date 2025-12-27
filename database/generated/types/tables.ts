export type TablesTableType = "physical" | "view" | "materialized" | "external";

/**
 * Represents a row in the tables table
 * Source: 15_data_model.sql
 */
export interface Tables {
  /** Primary key */
  id: string;
  tenant_id: string;
  data_pool_id: string;
  name: string;
  display_name: string | null;
  description: string | null;
  table_type: TablesTableType;
  source_connection_id: string | null;
  source_schema: string | null;
  source_table: string | null;
  transformation_sql: string | null;
  row_count: number | null;
  size_bytes: number | null;
  last_sync_at: string | null;
  is_activity_table: number;
  is_case_table: number;
  /** JSON field */
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

/** Insert type for tables (excludes auto-generated fields) */
export interface TablesInsert {
  tenant_id: string;
  data_pool_id: string;
  name: string;
  display_name?: string | null;
  description?: string | null;
  table_type?: TablesTableType;
  source_connection_id?: string | null;
  source_schema?: string | null;
  source_table?: string | null;
  transformation_sql?: string | null;
  row_count?: number | null;
  size_bytes?: number | null;
  last_sync_at?: string | null;
  is_activity_table?: number;
  is_case_table?: number;
  metadata?: Record<string, unknown> | null;
}