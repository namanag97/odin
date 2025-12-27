export type ScheduledJobsJobType = "import" | "discovery" | "conformance" | "prediction" | "workflow" | "metric_compute" | "statistics_refresh";
export type ScheduledJobsLastStatus = "success" | "failed" | "running";

/**
 * Represents a row in the scheduled_jobs table
 * Source: 10_automation.sql
 */
export interface ScheduledJobs {
  /** Primary key */
  id: string;
  tenant_id: string;
  name: string;
  job_type: ScheduledJobsJobType;
  target_id: string | null;
  cron_expression: string;
  timezone: string | null;
  is_active: number | null;
  next_run_at: string | null;
  last_run_at: string | null;
  last_status: ScheduledJobsLastStatus | null;
  /** JSON field */
  configuration: Record<string, unknown> | null;
  created_at: string;
}

/** Insert type for scheduled_jobs (excludes auto-generated fields) */
export interface ScheduledJobsInsert {
  tenant_id: string;
  name: string;
  job_type: ScheduledJobsJobType;
  target_id?: string | null;
  cron_expression: string;
  timezone?: string | null;
  is_active?: number | null;
  next_run_at?: string | null;
  last_run_at?: string | null;
  last_status?: ScheduledJobsLastStatus | null;
  configuration?: Record<string, unknown> | null;
}