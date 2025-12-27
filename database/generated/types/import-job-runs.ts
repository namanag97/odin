export type ImportJobRunsStatus = "pending" | "running" | "success" | "failed" | "cancelled";

/**
 * Represents a row in the import_job_runs table
 * Source: 01_core.sql
 */
export interface ImportJobRuns {
  /** Primary key */
  id: string;
  job_id: string;
  tenant_id: string;
  status: ImportJobRunsStatus;
  started_at: string;
  completed_at: string | null;
  rows_read: number | null;
  rows_written: number | null;
  events_created: number | null;
  cases_created: number | null;
  objects_created: number | null;
  error_message: string | null;
  error_details: string | null;
  /** JSON field */
  metrics: Record<string, unknown> | null;
}

/** Insert type for import_job_runs (excludes auto-generated fields) */
export interface ImportJobRunsInsert {
  job_id: string;
  tenant_id: string;
  status: ImportJobRunsStatus;
  started_at?: string;
  completed_at?: string | null;
  rows_read?: number | null;
  rows_written?: number | null;
  events_created?: number | null;
  cases_created?: number | null;
  objects_created?: number | null;
  error_message?: string | null;
  error_details?: string | null;
  metrics?: Record<string, unknown> | null;
}