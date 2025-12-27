export type ActionFlowExecutionsTriggeredBy = "schedule" | "webhook" | "manual" | "sensor" | "api" | "on_demand";
export type ActionFlowExecutionsStatus = "running" | "success" | "warning" | "error" | "cancelled";

/**
 * Represents a row in the action_flow_executions table
 * Source: 18_automation_enhanced.sql
 */
export interface ActionFlowExecutions {
  /** Primary key */
  id: string;
  tenant_id: string;
  action_flow_id: string;
  triggered_by: ActionFlowExecutionsTriggeredBy;
  triggered_by_user_id: string | null;
  /** JSON field */
  trigger_data: Record<string, unknown> | null;
  status: ActionFlowExecutionsStatus;
  started_at: string;
  completed_at: string | null;
  duration_ms: number | null;
  cycles_completed: number | null;
  bundles_processed: number | null;
  /** JSON field */
  input_values: Record<string, unknown> | null;
  /** JSON field */
  output_values: Record<string, unknown> | null;
  error_message: string | null;
  error_module_id: string | null;
  /** JSON field */
  execution_log: unknown[] | null;
  is_data_confidential: number;
  /** JSON field */
  metadata: Record<string, unknown> | null;
  created_at: string;
}

/** Insert type for action_flow_executions (excludes auto-generated fields) */
export interface ActionFlowExecutionsInsert {
  tenant_id: string;
  action_flow_id: string;
  triggered_by: ActionFlowExecutionsTriggeredBy;
  triggered_by_user_id?: string | null;
  trigger_data?: Record<string, unknown> | null;
  status?: ActionFlowExecutionsStatus;
  started_at?: string;
  completed_at?: string | null;
  duration_ms?: number | null;
  cycles_completed?: number | null;
  bundles_processed?: number | null;
  input_values?: Record<string, unknown> | null;
  output_values?: Record<string, unknown> | null;
  error_message?: string | null;
  error_module_id?: string | null;
  execution_log?: unknown[] | null;
  is_data_confidential?: number;
  metadata?: Record<string, unknown> | null;
}