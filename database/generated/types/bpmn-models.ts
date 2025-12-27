
/**
 * Represents a row in the bpmn_models table
 * Source: 05_discovery.sql
 */
export interface BpmnModels {
  /** Primary key */
  id: string;
  discovered_model_id: string | null;
  tenant_id: string;
  bpmn_xml: string;
  bpmn_json: string;
  process_id: string | null;
  /** JSON field */
  pools: unknown[] | null;
  element_count: number | null;
}

/** Insert type for bpmn_models (excludes auto-generated fields) */
export interface BpmnModelsInsert {
  discovered_model_id?: string | null;
  tenant_id: string;
  bpmn_xml: string;
  bpmn_json: string;
  process_id?: string | null;
  pools?: unknown[] | null;
  element_count?: number | null;
}