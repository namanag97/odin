export type CopilotEmbeddingsSourceType = "activity" | "kpi" | "variant" | "resource" | "documentation" | "discovered_model" | "conformance_result" | "bottleneck";

/**
 * Represents a row in the copilot_embeddings table
 * Source: 13_copilot.sql
 */
export interface CopilotEmbeddings {
  /** Primary key */
  id: string;
  tenant_id: string;
  source_type: CopilotEmbeddingsSourceType;
  source_id: string;
  content: string;
  chunk_index: number | null;
  embedding: Buffer | null;
  embedding_model: string | null;
  embedding_dimensions: number | null;
  /** JSON field */
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

/** Insert type for copilot_embeddings (excludes auto-generated fields) */
export interface CopilotEmbeddingsInsert {
  tenant_id: string;
  source_type: CopilotEmbeddingsSourceType;
  source_id: string;
  content: string;
  chunk_index?: number | null;
  embedding?: Buffer | null;
  embedding_model?: string | null;
  embedding_dimensions?: number | null;
  metadata?: Record<string, unknown> | null;
}