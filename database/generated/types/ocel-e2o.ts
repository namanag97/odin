
/**
 * Represents a row in the ocel_e2o table
 * Source: 03_ocel.sql
 */
export interface OcelE2o {
  /** Primary key */
  id: string;
  tenant_id: string;
  data_pool_id: string;
  event_id: string;
  object_id: string;
  qualifier: string | null;
  qualifier_value: string | null;
}

/** Insert type for ocel_e2o (excludes auto-generated fields) */
export interface OcelE2oInsert {
  tenant_id: string;
  data_pool_id: string;
  event_id: string;
  object_id: string;
  qualifier?: string | null;
  qualifier_value?: string | null;
}