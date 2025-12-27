export type CopilotToolCallsStatus = "pending" | "running" | "success" | "error";

/**
 * Represents a row in the copilot_tool_calls table
 * Source: 13_copilot.sql
 */
export interface CopilotToolCalls {
  /** Primary key */
  id: string;
  message_id: string;
  session_id: string;
  tenant_id: string;
  tool_name: string;
  tool_input: string;
  tool_output: string | null;
  status: CopilotToolCallsStatus | null;
  error_message: string | null;
  execution_time_ms: number | null;
  created_at: string;
  completed_at: string | null;
}

/** Insert type for copilot_tool_calls (excludes auto-generated fields) */
export interface CopilotToolCallsInsert {
  message_id: string;
  session_id: string;
  tenant_id: string;
  tool_name: string;
  tool_input: string;
  tool_output?: string | null;
  status?: CopilotToolCallsStatus | null;
  error_message?: string | null;
  execution_time_ms?: number | null;
  completed_at?: string | null;
}