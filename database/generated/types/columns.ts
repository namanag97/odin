export type ColumnsDataType = "string" | "integer" | "decimal" | "boolean" | "date" | "datetime" | "json" | "array";

/**
 * Represents a row in the columns table
 * Source: 15_data_model.sql
 */
export interface Columns {
  /** Primary key */
  id: string;
  tenant_id: string;
  table_id: string;
  name: string;
  display_name: string | null;
  data_type: ColumnsDataType;
  source_data_type: string | null;
  is_nullable: number;
  is_primary_key: number;
  is_indexed: number;
  default_value: string | null;
  format_pattern: string | null;
  ordinal_position: number;
  description: string | null;
  /** JSON field */
  statistics: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

/** Insert type for columns (excludes auto-generated fields) */
export interface ColumnsInsert {
  tenant_id: string;
  table_id: string;
  name: string;
  display_name?: string | null;
  data_type: ColumnsDataType;
  source_data_type?: string | null;
  is_nullable?: number;
  is_primary_key?: number;
  is_indexed?: number;
  default_value?: string | null;
  format_pattern?: string | null;
  ordinal_position: number;
  description?: string | null;
  statistics?: Record<string, unknown> | null;
}