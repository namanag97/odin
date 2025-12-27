export type RecordAttributesAttributeType = "column" | "calculated" | "augmented";
export type RecordAttributesDataType = "string" | "number" | "date" | "boolean" | "array";

/**
 * Represents a row in the record_attributes table
 * Source: 16_semantic.sql
 */
export interface RecordAttributes {
  /** Primary key */
  id: string;
  tenant_id: string;
  record_id: string;
  key: string;
  display_name: string | null;
  description: string | null;
  attribute_type: RecordAttributesAttributeType;
  source_column: string | null;
  pql_expression: string | null;
  data_type: RecordAttributesDataType;
  format_string: string | null;
  is_identifier: number;
  is_filterable: number;
  is_sortable: number;
  ordinal_position: number | null;
  /** JSON field */
  metadata: Record<string, unknown> | null;
  created_at: string;
}

/** Insert type for record_attributes (excludes auto-generated fields) */
export interface RecordAttributesInsert {
  tenant_id: string;
  record_id: string;
  key: string;
  display_name?: string | null;
  description?: string | null;
  attribute_type?: RecordAttributesAttributeType;
  source_column?: string | null;
  pql_expression?: string | null;
  data_type: RecordAttributesDataType;
  format_string?: string | null;
  is_identifier?: number;
  is_filterable?: number;
  is_sortable?: number;
  ordinal_position?: number | null;
  metadata?: Record<string, unknown> | null;
}