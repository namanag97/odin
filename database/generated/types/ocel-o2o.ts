
/**
 * Represents a row in the ocel_o2o table
 * Source: 03_ocel.sql
 */
export interface OcelO2o {
  /** Primary key */
  id: string;
  tenant_id: string;
  data_pool_id: string;
  source_object_id: string;
  target_object_id: string;
  relationship_type: string;
  /** JSON field */
  attributes: Record<string, unknown> | null;
  valid_from: string | null;
  valid_to: string | null;
}

/** Insert type for ocel_o2o (excludes auto-generated fields) */
export interface OcelO2oInsert {
  tenant_id: string;
  data_pool_id: string;
  source_object_id: string;
  target_object_id: string;
  relationship_type: string;
  attributes?: Record<string, unknown> | null;
  valid_from?: string | null;
  valid_to?: string | null;
}