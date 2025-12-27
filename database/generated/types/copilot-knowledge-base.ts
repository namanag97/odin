export type CopilotKnowledgeBaseContentType = "markdown" | "text" | "html";

/**
 * Represents a row in the copilot_knowledge_base table
 * Source: 13_copilot.sql
 */
export interface CopilotKnowledgeBase {
  /** Primary key */
  id: string;
  tenant_id: string;
  title: string;
  category: string | null;
  content: string;
  content_type: CopilotKnowledgeBaseContentType | null;
  version: number | null;
  is_active: number | null;
  created_at: string;
  updated_at: string;
}

/** Insert type for copilot_knowledge_base (excludes auto-generated fields) */
export interface CopilotKnowledgeBaseInsert {
  tenant_id: string;
  title: string;
  category?: string | null;
  content: string;
  content_type?: CopilotKnowledgeBaseContentType | null;
  version?: number | null;
  is_active?: number | null;
}