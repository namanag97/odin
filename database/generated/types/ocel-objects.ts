
/**
 * Represents a row in the ocel_objects table
 * Source: 03_ocel.sql
 */
export interface OcelObjects {
  /** Primary key */
  id: string;
  tenant_id: string;
  data_pool_id: string;
  ocel_id: string;
  object_type_id: string;
  object_type_name: string;
  /** JSON field */
  attributes: Record<string, unknown> | null;
  created_at: string;
}

/** Insert type for ocel_objects (excludes auto-generated fields) */
export interface OcelObjectsInsert {
  tenant_id: string;
  data_pool_id: string;
  ocel_id: string;
  object_type_id: string;
  object_type_name: string;
  attributes?: Record<string, unknown> | null;
}