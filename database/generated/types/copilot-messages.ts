export type CopilotMessagesRole = "human" | "ai" | "system" | "function" | "tool";

/**
 * Represents a row in the copilot_messages table
 * Source: 13_copilot.sql
 */
export interface CopilotMessages {
  /** Primary key */
  id: string;
  session_id: string;
  tenant_id: string;
  role: CopilotMessagesRole;
  content: string;
  sequence: number;
  /** JSON field */
  metadata: Record<string, unknown> | null;
  token_count: number | null;
  created_at: string;
}

/** Insert type for copilot_messages (excludes auto-generated fields) */
export interface CopilotMessagesInsert {
  session_id: string;
  tenant_id: string;
  role: CopilotMessagesRole;
  content: string;
  sequence: number;
  metadata?: Record<string, unknown> | null;
  token_count?: number | null;
}