export type ActionFlowsTriggerType = "manual" | "scheduled" | "event" | "webhook" | "sensor";
export type ActionFlowsStatus = "draft" | "active" | "inactive" | "deactivated";
export type ActionFlowsLastExecutionStatus = "success" | "warning" | "error";

/**
 * Represents a row in the action_flows table
 * Source: 18_automation_enhanced.sql
 */
export interface ActionFlows {
  /** Primary key */
  id: string;
  tenant_id: string;
  package_id: string;
  key: string;
  name: string;
  description: string | null;
  trigger_type: ActionFlowsTriggerType;
  schedule_id: string | null;
  webhook_id: string | null;
  sensor_id: string | null;
  status: ActionFlowsStatus;
  consecutive_error_limit: number | null;
  consecutive_error_count: number | null;
  is_data_confidential: number;
  timeout_seconds: number | null;
  max_cycles: number | null;
  auto_commit: number;
  sequential_processing: number;
  incomplete_executions_enabled: number;
  blueprint: string;
  /** JSON field */
  inputs: unknown[] | null;
  /** JSON field */
  outputs: unknown[] | null;
  last_executed_at: string | null;
  last_execution_status: ActionFlowsLastExecutionStatus | null;
  activated_at: string | null;
  deactivated_at: string | null;
  deactivation_reason: string | null;
  /** JSON field */
  metadata: Record<string, unknown> | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

/** Insert type for action_flows (excludes auto-generated fields) */
export interface ActionFlowsInsert {
  tenant_id: string;
  package_id: string;
  key: string;
  name: string;
  description?: string | null;
  trigger_type: ActionFlowsTriggerType;
  schedule_id?: string | null;
  webhook_id?: string | null;
  sensor_id?: string | null;
  status?: ActionFlowsStatus;
  consecutive_error_limit?: number | null;
  consecutive_error_count?: number | null;
  is_data_confidential?: number;
  timeout_seconds?: number | null;
  max_cycles?: number | null;
  auto_commit?: number;
  sequential_processing?: number;
  incomplete_executions_enabled?: number;
  blueprint: string;
  inputs?: unknown[] | null;
  outputs?: unknown[] | null;
  last_executed_at?: string | null;
  last_execution_status?: ActionFlowsLastExecutionStatus | null;
  activated_at?: string | null;
  deactivated_at?: string | null;
  deactivation_reason?: string | null;
  metadata?: Record<string, unknown> | null;
  created_by?: string | null;
}