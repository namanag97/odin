export type WorkflowExecutionsStatus = "running" | "completed" | "failed" | "cancelled" | "terminated" | "timed_out" | "continued_as_new";

/**
 * Represents a row in the workflow_executions table
 * Source: 14_workflow_eventsource.sql
 */
export interface WorkflowExecutions {
  /** Primary key */
  id: string;
  tenant_id: string;
  workflow_id: string;
  run_id: string;
  workflow_type: string;
  workflow_type_id: string | null;
  parent_execution_id: string | null;
  parent_run_id: string | null;
  status: WorkflowExecutionsStatus;
  started_at: string;
  completed_at: string | null;
  timeout_seconds: number | null;
  input: string | null;
  output: string | null;
  error: string | null;
  attempt_number: number | null;
  max_attempts: number | null;
  /** JSON field */
  search_attributes: Record<string, unknown> | null;
  created_at: string;
}

/** Insert type for workflow_executions (excludes auto-generated fields) */
export interface WorkflowExecutionsInsert {
  tenant_id: string;
  workflow_id: string;
  run_id: string;
  workflow_type: string;
  workflow_type_id?: string | null;
  parent_execution_id?: string | null;
  parent_run_id?: string | null;
  status?: WorkflowExecutionsStatus;
  started_at?: string;
  completed_at?: string | null;
  timeout_seconds?: number | null;
  input?: string | null;
  output?: string | null;
  error?: string | null;
  attempt_number?: number | null;
  max_attempts?: number | null;
  search_attributes?: Record<string, unknown> | null;
}