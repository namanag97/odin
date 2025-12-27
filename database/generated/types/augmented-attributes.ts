export type AugmentedAttributesDataType = "string" | "number" | "date" | "boolean" | "enum";

/**
 * Represents a row in the augmented_attributes table
 * Source: 16_semantic.sql
 */
export interface AugmentedAttributes {
  /** Primary key */
  id: string;
  tenant_id: string;
  record_id: string;
  key: string;
  display_name: string | null;
  description: string | null;
  data_type: AugmentedAttributesDataType;
  possible_values: string | null;
  default_value: string | null;
  is_required: number;
  is_multi_value: number;
  validation_regex: string | null;
  ordinal_position: number | null;
  /** JSON field */
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

/** Insert type for augmented_attributes (excludes auto-generated fields) */
export interface AugmentedAttributesInsert {
  tenant_id: string;
  record_id: string;
  key: string;
  display_name?: string | null;
  description?: string | null;
  data_type: AugmentedAttributesDataType;
  possible_values?: string | null;
  default_value?: string | null;
  is_required?: number;
  is_multi_value?: number;
  validation_regex?: string | null;
  ordinal_position?: number | null;
  metadata?: Record<string, unknown> | null;
}