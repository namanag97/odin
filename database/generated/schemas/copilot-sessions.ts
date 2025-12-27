/**
 * Zod schemas for copilot_sessions table
 * Source: 13_copilot.sql
 */

import { z } from "zod";

/** Schema for a copilot_sessions row */
export const CopilotSessionsSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  user_id: z.string().uuid(),
  event_log_id: z.string().uuid().nullable(),
  data_pool_id: z.string().uuid().nullable(),
  memory_type: z.enum(["buffer", "summary", "buffer_window", "entity"]).nullable(),
  max_tokens: z.number().int().nullable(),
  window_size: z.number().int().nullable(),
  title: z.string().nullable(),
  status: z.enum(["active", "archived", "deleted"]).nullable(),
  created_at: z.string().datetime({ offset: true }).or(z.string()),
  updated_at: z.string().datetime({ offset: true }).or(z.string()),
  last_message_at: z.string().datetime({ offset: true }).or(z.string()).nullable(),
});

export type CopilotSessions = z.infer<typeof CopilotSessionsSchema>;

/** Schema for inserting a copilot_sessions row */
export const CopilotSessionsInsertSchema = z.object({
  tenant_id: z.string().uuid(),
  user_id: z.string().uuid(),
  event_log_id: z.string().uuid().nullable().optional(),
  data_pool_id: z.string().uuid().nullable().optional(),
  memory_type: z.enum(["buffer", "summary", "buffer_window", "entity"]).nullable().optional(),
  max_tokens: z.number().int().nullable().optional(),
  window_size: z.number().int().nullable().optional(),
  title: z.string().nullable().optional(),
  status: z.enum(["active", "archived", "deleted"]).nullable().optional(),
  last_message_at: z.string().datetime({ offset: true }).or(z.string()).nullable().optional(),
});

export type CopilotSessionsInsert = z.infer<typeof CopilotSessionsInsertSchema>;

/** Schema for updating a copilot_sessions row */
export const CopilotSessionsUpdateSchema = CopilotSessionsInsertSchema.partial();

export type CopilotSessionsUpdate = z.infer<typeof CopilotSessionsUpdateSchema>;