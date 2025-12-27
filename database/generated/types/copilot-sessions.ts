export type CopilotSessionsMemoryType = "buffer" | "summary" | "buffer_window" | "entity";
export type CopilotSessionsStatus = "active" | "archived" | "deleted";

/**
 * Represents a row in the copilot_sessions table
 * Source: 13_copilot.sql
 */
export interface CopilotSessions {
  /** Primary key */
  id: string;
  tenant_id: string;
  user_id: string;
  event_log_id: string | null;
  data_pool_id: string | null;
  memory_type: CopilotSessionsMemoryType | null;
  max_tokens: number | null;
  window_size: number | null;
  title: string | null;
  status: CopilotSessionsStatus | null;
  created_at: string;
  updated_at: string;
  last_message_at: string | null;
}

/** Insert type for copilot_sessions (excludes auto-generated fields) */
export interface CopilotSessionsInsert {
  tenant_id: string;
  user_id: string;
  event_log_id?: string | null;
  data_pool_id?: string | null;
  memory_type?: CopilotSessionsMemoryType | null;
  max_tokens?: number | null;
  window_size?: number | null;
  title?: string | null;
  status?: CopilotSessionsStatus | null;
  last_message_at?: string | null;
}