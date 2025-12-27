export type JobExecutionsTriggeredBy = "schedule" | "manual" | "api" | "dependent";
export type JobExecutionsStatus = "pending" | "running" | "success" | "failed" | "cancelled";

/**
 * Represents a row in the job_executions table
 * Source: 15_data_model.sql
 */
export interface JobExecutions {
  /** Primary key */
  id: string;
  tenant_id: string;
  data_job_id: string;
  triggered_by: JobExecutionsTriggeredBy;
  triggered_by_user_id: string | null;
  status: JobExecutionsStatus;
  started_at: string | null;
  completed_at: string | null;
  duration_ms: number | null;
  rows_processed: number | null;
  rows_failed: number | null;
  error_message: string | null;
  /** JSON field */
  error_details: Record<string, unknown> | null;
  /** JSON field */
  task_results: unknown[] | null;
  /** JSON field */
  metadata: Record<string, unknown> | null;
  created_at: string;
}

/** Insert type for job_executions (excludes auto-generated fields) */
export interface JobExecutionsInsert {
  tenant_id: string;
  data_job_id: string;
  triggered_by: JobExecutionsTriggeredBy;
  triggered_by_user_id?: string | null;
  status?: JobExecutionsStatus;
  started_at?: string | null;
  completed_at?: string | null;
  duration_ms?: number | null;
  rows_processed?: number | null;
  rows_failed?: number | null;
  error_message?: string | null;
  error_details?: Record<string, unknown> | null;
  task_results?: unknown[] | null;
  metadata?: Record<string, unknown> | null;
}