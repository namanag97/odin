export type ActionExecutionsStatus = "success" | "failed" | "pending" | "skipped";

/**
 * Represents a row in the action_executions table
 * Source: 10_automation.sql
 */
export interface ActionExecutions {
  /** Primary key */
  id: string;
  action_id: string;
  rule_id: string;
  tenant_id: string;
  triggered_at: string;
  trigger_context: string;
  status: ActionExecutionsStatus;
  response: string | null;
  error_message: string | null;
  execution_time_ms: number | null;
}

/** Insert type for action_executions (excludes auto-generated fields) */
export interface ActionExecutionsInsert {
  action_id: string;
  rule_id: string;
  tenant_id: string;
  triggered_at?: string;
  trigger_context: string;
  status: ActionExecutionsStatus;
  response?: string | null;
  error_message?: string | null;
  execution_time_ms?: number | null;
}