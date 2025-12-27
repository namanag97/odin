export type IncompleteExecutionsStatus = "pending" | "retrying" | "resolved" | "abandoned";
export type IncompleteExecutionsResolutionType = "retry_success" | "manual_resolve" | "deleted";

/**
 * Represents a row in the incomplete_executions table
 * Source: 18_automation_enhanced.sql
 */
export interface IncompleteExecutions {
  /** Primary key */
  id: string;
  tenant_id: string;
  action_flow_id: string;
  execution_id: string;
  failed_module_id: string;
  error_message: string;
  error_type: string;
  bundle_data: string;
  remaining_flow: string;
  retry_count: number | null;
  max_retries: number | null;
  next_retry_at: string | null;
  retry_delay_seconds: number | null;
  status: IncompleteExecutionsStatus;
  resolved_at: string | null;
  resolved_by: string | null;
  resolution_type: IncompleteExecutionsResolutionType | null;
  created_at: string;
  updated_at: string;
}

/** Insert type for incomplete_executions (excludes auto-generated fields) */
export interface IncompleteExecutionsInsert {
  tenant_id: string;
  action_flow_id: string;
  execution_id: string;
  failed_module_id: string;
  error_message: string;
  error_type: string;
  bundle_data: string;
  remaining_flow: string;
  retry_count?: number | null;
  max_retries?: number | null;
  next_retry_at?: string | null;
  retry_delay_seconds?: number | null;
  status?: IncompleteExecutionsStatus;
  resolved_at?: string | null;
  resolved_by?: string | null;
  resolution_type?: IncompleteExecutionsResolutionType | null;
}