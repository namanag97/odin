
/**
 * Represents a row in the event_logs table
 * Source: 02_case_centric.sql
 */
export interface EventLogs {
  /** Primary key */
  id: string;
  tenant_id: string;
  data_pool_id: string;
  name: string;
  description: string | null;
  case_notion: string;
  activity_key: string | null;
  timestamp_key: string | null;
  resource_key: string | null;
  /** JSON field */
  case_attributes: unknown[] | null;
  /** JSON field */
  event_attributes: unknown[] | null;
  /** JSON field */
  classifiers: Record<string, unknown> | null;
  /** JSON field */
  extensions: Record<string, unknown> | null;
  /** JSON field */
  global_attributes: Record<string, unknown> | null;
  /** JSON field */
  statistics: Record<string, unknown> | null;
  source_file_path: string | null;
  source_file_format: string | null;
  created_at: string;
  updated_at: string;
}

/** Insert type for event_logs (excludes auto-generated fields) */
export interface EventLogsInsert {
  tenant_id: string;
  data_pool_id: string;
  name: string;
  description?: string | null;
  case_notion: string;
  activity_key?: string | null;
  timestamp_key?: string | null;
  resource_key?: string | null;
  case_attributes?: unknown[] | null;
  event_attributes?: unknown[] | null;
  classifiers?: Record<string, unknown> | null;
  extensions?: Record<string, unknown> | null;
  global_attributes?: Record<string, unknown> | null;
  statistics?: Record<string, unknown> | null;
  source_file_path?: string | null;
  source_file_format?: string | null;
}