/**
 * Zod schemas for copilot_messages table
 * Source: 13_copilot.sql
 */

import { z } from "zod";

/** Schema for a copilot_messages row */
export const CopilotMessagesSchema = z.object({
  id: z.string().uuid(),
  session_id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  role: z.enum(["human", "ai", "system", "function", "tool"]),
  content: z.string(),
  sequence: z.number().int(),
  metadata: z.record(z.string(), z.unknown()).nullable(),
  token_count: z.number().int().nullable(),
  created_at: z.string().datetime({ offset: true }).or(z.string()),
});

export type CopilotMessages = z.infer<typeof CopilotMessagesSchema>;

/** Schema for inserting a copilot_messages row */
export const CopilotMessagesInsertSchema = z.object({
  session_id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  role: z.enum(["human", "ai", "system", "function", "tool"]),
  content: z.string(),
  sequence: z.number().int(),
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
  token_count: z.number().int().nullable().optional(),
});

export type CopilotMessagesInsert = z.infer<typeof CopilotMessagesInsertSchema>;

/** Schema for updating a copilot_messages row */
export const CopilotMessagesUpdateSchema = CopilotMessagesInsertSchema.partial();

export type CopilotMessagesUpdate = z.infer<typeof CopilotMessagesUpdateSchema>;