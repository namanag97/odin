
/**
 * Represents a row in the event_log_configs table
 * Source: 16_semantic.sql
 */
export interface EventLogConfigs {
  /** Primary key */
  id: string;
  tenant_id: string;
  knowledge_model_id: string;
  key: string;
  display_name: string | null;
  description: string | null;
  activity_table: string;
  case_id_column: string;
  activity_column: string;
  timestamp_column: string;
  sorting_column: string | null;
  resource_column: string | null;
  cost_column: string | null;
  /** JSON field */
  included_activities: unknown[] | null;
  /** JSON field */
  excluded_activities: unknown[] | null;
  filter_expression: string | null;
  is_default: number;
  /** JSON field */
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

/** Insert type for event_log_configs (excludes auto-generated fields) */
export interface EventLogConfigsInsert {
  tenant_id: string;
  knowledge_model_id: string;
  key: string;
  display_name?: string | null;
  description?: string | null;
  activity_table: string;
  case_id_column: string;
  activity_column: string;
  timestamp_column: string;
  sorting_column?: string | null;
  resource_column?: string | null;
  cost_column?: string | null;
  included_activities?: unknown[] | null;
  excluded_activities?: unknown[] | null;
  filter_expression?: string | null;
  is_default?: number;
  metadata?: Record<string, unknown> | null;
}