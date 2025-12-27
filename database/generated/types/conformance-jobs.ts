export type ConformanceJobsMethod = "token_replay" | "alignment" | "footprints";

/**
 * Represents a row in the conformance_jobs table
 * Source: 06_conformance.sql
 */
export interface ConformanceJobs {
  /** Primary key */
  id: string;
  tenant_id: string;
  event_log_id: string | null;
  data_pool_id: string | null;
  model_id: string;
  name: string;
  method: ConformanceJobsMethod;
  /** JSON field */
  configuration: Record<string, unknown> | null;
  schedule_cron: string | null;
  is_active: number | null;
  created_at: string;
}

/** Insert type for conformance_jobs (excludes auto-generated fields) */
export interface ConformanceJobsInsert {
  tenant_id: string;
  event_log_id?: string | null;
  data_pool_id?: string | null;
  model_id: string;
  name: string;
  method: ConformanceJobsMethod;
  configuration?: Record<string, unknown> | null;
  schedule_cron?: string | null;
  is_active?: number | null;
}