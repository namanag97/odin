export type EventsLifecycle = "start" | "complete" | "suspend" | "resume" | "abort";

/**
 * Represents a row in the events table
 * Source: 02_case_centric.sql
 */
export interface Events {
  /** Primary key */
  id: string;
  tenant_id: string;
  event_log_id: string;
  case_id: string;
  activity_id: string | null;
  activity_name: string;
  timestamp: string;
  sort_key: number | null;
  resource_id: string | null;
  resource_name: string | null;
  lifecycle: EventsLifecycle | null;
  cost: number | null;
  /** JSON field */
  attributes: Record<string, unknown> | null;
}

/** Insert type for events (excludes auto-generated fields) */
export interface EventsInsert {
  tenant_id: string;
  event_log_id: string;
  case_id: string;
  activity_id?: string | null;
  activity_name: string;
  timestamp: string;
  sort_key?: number | null;
  resource_id?: string | null;
  resource_name?: string | null;
  lifecycle?: EventsLifecycle | null;
  cost?: number | null;
  attributes?: Record<string, unknown> | null;
}