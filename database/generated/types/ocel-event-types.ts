
/**
 * Represents a row in the ocel_event_types table
 * Source: 03_ocel.sql
 */
export interface OcelEventTypes {
  /** Primary key */
  id: string;
  tenant_id: string;
  data_pool_id: string;
  name: string;
  display_name: string | null;
  attribute_schema: string;
  description: string | null;
  category: string | null;
  color: string | null;
  occurrence_count: number | null;
  created_at: string;
}

/** Insert type for ocel_event_types (excludes auto-generated fields) */
export interface OcelEventTypesInsert {
  tenant_id: string;
  data_pool_id: string;
  name: string;
  display_name?: string | null;
  attribute_schema?: string;
  description?: string | null;
  category?: string | null;
  color?: string | null;
  occurrence_count?: number | null;
}