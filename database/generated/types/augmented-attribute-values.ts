
/**
 * Represents a row in the augmented_attribute_values table
 * Source: 16_semantic.sql
 */
export interface AugmentedAttributeValues {
  /** Primary key */
  id: string;
  tenant_id: string;
  augmented_attribute_id: string;
  record_key: string;
  value: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
}

/** Insert type for augmented_attribute_values (excludes auto-generated fields) */
export interface AugmentedAttributeValuesInsert {
  tenant_id: string;
  augmented_attribute_id: string;
  record_key: string;
  value: string;
  updated_by: string;
}