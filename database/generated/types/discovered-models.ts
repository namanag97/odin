export type DiscoveredModelsModelType = "petri_net" | "bpmn" | "dfg" | "process_tree" | "ocel_ocdfg";

/**
 * Represents a row in the discovered_models table
 * Source: 05_discovery.sql
 */
export interface DiscoveredModels {
  /** Primary key */
  id: string;
  tenant_id: string;
  event_log_id: string | null;
  data_pool_id: string | null;
  name: string;
  description: string | null;
  algorithm: string;
  /** JSON field */
  algorithm_params: Record<string, unknown> | null;
  model_type: DiscoveredModelsModelType;
  model_data: string;
  model_file_path: string | null;
  /** JSON field */
  quality_metrics: Record<string, unknown> | null;
  /** JSON field */
  statistics: Record<string, unknown> | null;
  perspective: string | null;
  created_at: string;
}

/** Insert type for discovered_models (excludes auto-generated fields) */
export interface DiscoveredModelsInsert {
  tenant_id: string;
  event_log_id?: string | null;
  data_pool_id?: string | null;
  name: string;
  description?: string | null;
  algorithm: string;
  algorithm_params?: Record<string, unknown> | null;
  model_type: DiscoveredModelsModelType;
  model_data: string;
  model_file_path?: string | null;
  quality_metrics?: Record<string, unknown> | null;
  statistics?: Record<string, unknown> | null;
  perspective?: string | null;
}