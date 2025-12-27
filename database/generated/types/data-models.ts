export type DataModelsModelType = "case_centric" | "object_centric";
export type DataModelsLoadStatus = "pending" | "loading" | "loaded" | "failed" | "stale";
export type DataModelsLoadType = "full" | "delta";

/**
 * Represents a row in the data_models table
 * Source: 15_data_model.sql
 */
export interface DataModels {
  /** Primary key */
  id: string;
  tenant_id: string;
  data_pool_id: string;
  name: string;
  description: string | null;
  model_type: DataModelsModelType;
  activity_table_id: string | null;
  case_table_id: string | null;
  case_column: string | null;
  activity_column: string | null;
  timestamp_column: string | null;
  sorting_column: string | null;
  load_status: DataModelsLoadStatus;
  last_loaded_at: string | null;
  load_type: DataModelsLoadType;
  /** JSON field */
  row_counts: Record<string, unknown> | null;
  version: number;
  /** JSON field */
  metadata: Record<string, unknown> | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

/** Insert type for data_models (excludes auto-generated fields) */
export interface DataModelsInsert {
  tenant_id: string;
  data_pool_id: string;
  name: string;
  description?: string | null;
  model_type?: DataModelsModelType;
  activity_table_id?: string | null;
  case_table_id?: string | null;
  case_column?: string | null;
  activity_column?: string | null;
  timestamp_column?: string | null;
  sorting_column?: string | null;
  load_status?: DataModelsLoadStatus;
  last_loaded_at?: string | null;
  load_type?: DataModelsLoadType;
  row_counts?: Record<string, unknown> | null;
  version?: number;
  metadata?: Record<string, unknown> | null;
  created_by?: string | null;
}