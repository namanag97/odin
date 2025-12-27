export type DataJobTasksTaskType = "extraction" | "transformation" | "load" | "custom";
export type DataJobTasksExtractionMode = "full" | "delta";

/**
 * Represents a row in the data_job_tasks table
 * Source: 15_data_model.sql
 */
export interface DataJobTasks {
  /** Primary key */
  id: string;
  tenant_id: string;
  data_job_id: string;
  name: string;
  task_type: DataJobTasksTaskType;
  execution_order: number;
  source_connection_id: string | null;
  source_query: string | null;
  target_table_id: string | null;
  transformation_sql: string | null;
  extraction_mode: DataJobTasksExtractionMode;
  delta_column: string | null;
  delta_value: string | null;
  is_enabled: number;
  timeout_seconds: number | null;
  /** JSON field */
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

/** Insert type for data_job_tasks (excludes auto-generated fields) */
export interface DataJobTasksInsert {
  tenant_id: string;
  data_job_id: string;
  name: string;
  task_type: DataJobTasksTaskType;
  execution_order: number;
  source_connection_id?: string | null;
  source_query?: string | null;
  target_table_id?: string | null;
  transformation_sql?: string | null;
  extraction_mode?: DataJobTasksExtractionMode;
  delta_column?: string | null;
  delta_value?: string | null;
  is_enabled?: number;
  timeout_seconds?: number | null;
  metadata?: Record<string, unknown> | null;
}