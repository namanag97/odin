
/**
 * Represents a row in the ocel_object_types table
 * Source: 03_ocel.sql
 */
export interface OcelObjectTypes {
  /** Primary key */
  id: string;
  tenant_id: string;
  data_pool_id: string;
  name: string;
  display_name: string | null;
  attribute_schema: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  object_count: number | null;
  is_process_object: number | null;
  created_at: string;
}

/** Insert type for ocel_object_types (excludes auto-generated fields) */
export interface OcelObjectTypesInsert {
  tenant_id: string;
  data_pool_id: string;
  name: string;
  display_name?: string | null;
  attribute_schema?: string;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
  object_count?: number | null;
  is_process_object?: number | null;
}