export type ImportJobsJobType = "extraction" | "transformation" | "full_load" | "incremental" | "file_import" | "database_extract";

/**
 * Represents a row in the import_jobs table
 * Source: 01_core.sql
 */
export interface ImportJobs {
  /** Primary key */
  id: string;
  tenant_id: string;
  data_pool_id: string;
  connection_id: string | null;
  name: string;
  job_type: ImportJobsJobType;
  source_query: string | null;
  /** JSON field */
  mapping_config: Record<string, unknown>;
  schedule_cron: string | null;
  is_active: number | null;
  created_at: string;
  updated_at: string;
}

/** Insert type for import_jobs (excludes auto-generated fields) */
export interface ImportJobsInsert {
  tenant_id: string;
  data_pool_id: string;
  connection_id?: string | null;
  name: string;
  job_type: ImportJobsJobType;
  source_query?: string | null;
  mapping_config: Record<string, unknown>;
  schedule_cron?: string | null;
  is_active?: number | null;
}