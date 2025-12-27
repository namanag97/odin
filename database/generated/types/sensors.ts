export type SensorsSensorType = "record_based" | "data_model_based" | "ml_based";
export type SensorsEvaluationTrigger = "data_model_reload" | "km_publish" | "scheduled" | "manual";
export type SensorsStatus = "active" | "inactive";

/**
 * Represents a row in the sensors table
 * Source: 18_automation_enhanced.sql
 */
export interface Sensors {
  /** Primary key */
  id: string;
  tenant_id: string;
  knowledge_model_id: string;
  name: string;
  description: string | null;
  sensor_type: SensorsSensorType;
  record_id: string | null;
  filter_id: string | null;
  filter_expression: string | null;
  /** JSON field */
  identifier_columns: unknown[] | null;
  /** JSON field */
  additional_columns: unknown[] | null;
  evaluation_trigger: SensorsEvaluationTrigger;
  max_signals_per_evaluation: number | null;
  status: SensorsStatus;
  last_evaluated_at: string | null;
  last_signal_count: number | null;
  /** JSON field */
  metadata: Record<string, unknown> | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

/** Insert type for sensors (excludes auto-generated fields) */
export interface SensorsInsert {
  tenant_id: string;
  knowledge_model_id: string;
  name: string;
  description?: string | null;
  sensor_type: SensorsSensorType;
  record_id?: string | null;
  filter_id?: string | null;
  filter_expression?: string | null;
  identifier_columns?: unknown[] | null;
  additional_columns?: unknown[] | null;
  evaluation_trigger?: SensorsEvaluationTrigger;
  max_signals_per_evaluation?: number | null;
  status?: SensorsStatus;
  last_evaluated_at?: string | null;
  last_signal_count?: number | null;
  metadata?: Record<string, unknown> | null;
  created_by?: string | null;
}