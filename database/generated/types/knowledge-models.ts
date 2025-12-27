export type KnowledgeModelsKmType = "base" | "extension";
export type KnowledgeModelsStatus = "draft" | "published";

/**
 * Represents a row in the knowledge_models table
 * Source: 16_semantic.sql
 */
export interface KnowledgeModels {
  /** Primary key */
  id: string;
  tenant_id: string;
  package_id: string;
  key: string;
  name: string;
  description: string | null;
  data_model_id: string;
  km_type: KnowledgeModelsKmType;
  extends_km_id: string | null;
  status: KnowledgeModelsStatus;
  version: number;
  yaml_content: string | null;
  published_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

/** Insert type for knowledge_models (excludes auto-generated fields) */
export interface KnowledgeModelsInsert {
  tenant_id: string;
  package_id: string;
  key: string;
  name: string;
  description?: string | null;
  data_model_id: string;
  km_type?: KnowledgeModelsKmType;
  extends_km_id?: string | null;
  status?: KnowledgeModelsStatus;
  version?: number;
  yaml_content?: string | null;
  published_at?: string | null;
  created_by?: string | null;
}