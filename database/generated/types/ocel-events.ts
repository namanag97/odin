
/**
 * Represents a row in the ocel_events table
 * Source: 03_ocel.sql
 */
export interface OcelEvents {
  /** Primary key */
  id: string;
  tenant_id: string;
  data_pool_id: string;
  ocel_id: string;
  event_type_id: string;
  event_type_name: string;
  timestamp: string;
  /** JSON field */
  attributes: Record<string, unknown> | null;
}

/** Insert type for ocel_events (excludes auto-generated fields) */
export interface OcelEventsInsert {
  tenant_id: string;
  data_pool_id: string;
  ocel_id: string;
  event_type_id: string;
  event_type_name: string;
  timestamp: string;
  attributes?: Record<string, unknown> | null;
}