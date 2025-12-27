/**
 * Zod schemas for copilot_tool_calls table
 * Source: 13_copilot.sql
 */

import { z } from "zod";

/** Schema for a copilot_tool_calls row */
export const CopilotToolCallsSchema = z.object({
  id: z.string().uuid(),
  message_id: z.string().uuid(),
  session_id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  tool_name: z.string(),
  tool_input: z.string(),
  tool_output: z.string().nullable(),
  status: z.enum(["pending", "running", "success", "error"]).nullable(),
  error_message: z.string().nullable(),
  execution_time_ms: z.number().int().nullable(),
  created_at: z.string().datetime({ offset: true }).or(z.string()),
  completed_at: z.string().datetime({ offset: true }).or(z.string()).nullable(),
});

export type CopilotToolCalls = z.infer<typeof CopilotToolCallsSchema>;

/** Schema for inserting a copilot_tool_calls row */
export const CopilotToolCallsInsertSchema = z.object({
  message_id: z.string().uuid(),
  session_id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  tool_name: z.string(),
  tool_input: z.string(),
  tool_output: z.string().nullable().optional(),
  status: z.enum(["pending", "running", "success", "error"]).nullable().optional(),
  error_message: z.string().nullable().optional(),
  execution_time_ms: z.number().int().nullable().optional(),
  completed_at: z.string().datetime({ offset: true }).or(z.string()).nullable().optional(),
});

export type CopilotToolCallsInsert = z.infer<typeof CopilotToolCallsInsertSchema>;

/** Schema for updating a copilot_tool_calls row */
export const CopilotToolCallsUpdateSchema = CopilotToolCallsInsertSchema.partial();

export type CopilotToolCallsUpdate = z.infer<typeof CopilotToolCallsUpdateSchema>;