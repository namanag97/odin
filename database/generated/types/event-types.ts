export type EventTypesStatus = "draft" | "published" | "deprecated";

/**
 * Represents a row in the event_types table
 * Source: 19_ocpm_extended.sql
 */
export interface EventTypes {
  /** Primary key */
  id: string;
  tenant_id: string;
  perspective_id: string;
  name: string;
  display_name: string | null;
  description: string | null;
  source_table: string | null;
  timestamp_column: string;
  sorting_column: string | null;
  icon: string | null;
  color: string | null;
  status: EventTypesStatus;
  /** JSON field */
  attribute_schema: Record<string, unknown> | null;
  /** JSON field */
  metadata: Record<string, unknown> | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

/** Insert type for event_types (excludes auto-generated fields) */
export interface EventTypesInsert {
  tenant_id: string;
  perspective_id: string;
  name: string;
  display_name?: string | null;
  description?: string | null;
  source_table?: string | null;
  timestamp_column: string;
  sorting_column?: string | null;
  icon?: string | null;
  color?: string | null;
  status?: EventTypesStatus;
  attribute_schema?: Record<string, unknown> | null;
  metadata?: Record<string, unknown> | null;
  created_by?: string | null;
}