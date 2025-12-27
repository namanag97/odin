export type CustomEventLogsFlatteningStrategy = "simple" | "object_propagation" | "all_events";

/**
 * Represents a row in the custom_event_logs table
 * Source: 19_ocpm_extended.sql
 */
export interface CustomEventLogs {
  /** Primary key */
  id: string;
  tenant_id: string;
  perspective_id: string;
  name: string;
  description: string | null;
  lead_object_type_id: string;
  /** JSON field */
  included_event_types: unknown[] | null;
  flattening_strategy: CustomEventLogsFlatteningStrategy;
  filter_expression: string | null;
  is_materialized: number;
  last_materialized_at: string | null;
  row_count: number | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

/** Insert type for custom_event_logs (excludes auto-generated fields) */
export interface CustomEventLogsInsert {
  tenant_id: string;
  perspective_id: string;
  name: string;
  description?: string | null;
  lead_object_type_id: string;
  included_event_types?: unknown[] | null;
  flattening_strategy?: CustomEventLogsFlatteningStrategy;
  filter_expression?: string | null;
  is_materialized?: number;
  last_materialized_at?: string | null;
  row_count?: number | null;
  created_by?: string | null;
}